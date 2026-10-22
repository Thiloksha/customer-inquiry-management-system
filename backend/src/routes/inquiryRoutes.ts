
import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import prisma from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();


const searchQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]).optional(),
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const validation = searchQuerySchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid search or status filter.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (!req.staffId) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const { search, status } = validation.data;

  try {
    const inquiries = await prisma.inquiry.findMany({
      where: {
        createdById: req.staffId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                {
                  customerName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  contactInfo: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  subject: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error("List inquiries failed:", error);

    return res.status(500).json({
      message: "Unable to retrieve inquiries right now.",
    });
  }
});

const createInquirySchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").max(100),
  contactInfo: z.string().trim().min(1, "Contact information is required").max(150),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  description: z.string().trim().min(1, "Description is required").max(5000),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const validation = createInquirySchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Please correct the inquiry details.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (!req.staffId) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }
  
  // Check whether another staff member has already recorded
  // the same customer's open inquiry.
  const allowDuplicate = req.get("X-Allow-Duplicate") === "true";

  if (!allowDuplicate) {
    const normalizedContact =
      validation.data.contactInfo.trim().toLowerCase();

    const normalizedSubject =
      validation.data.subject.trim().toLowerCase();

    try {
      const possibleDuplicate = await prisma.inquiry.findFirst({
        where: {
          createdById: { not: req.staffId },
          status: { in: ["NEW", "IN_PROGRESS"] },
          contactInfo: {
            equals: normalizedContact,
            mode: "insensitive",
          },
          subject: {
            equals: normalizedSubject,
            mode: "insensitive",
          },
        },
      });

      if (possibleDuplicate) {
        return res.status(409).json({
          code: "POSSIBLE_DUPLICATE",
          message:
            "A similar open inquiry may already exist. Please check before continuing.",
        });
      }
    } catch (error) {
      console.error("Duplicate inquiry check failed:", error);

      return res.status(500).json({
        message: "Unable to check for duplicate inquiries right now.",
      });
    }
  }


  const suppliedKey = req.get("Idempotency-Key");
  const submissionKey = suppliedKey || randomUUID();

  if (submissionKey.length > 200 || submissionKey.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid submission key.",
    });
  }

  try {
    const existing = await prisma.inquiry.findUnique({
      where: { submissionKey },
    });

    if (existing) {
      if (existing.createdById !== req.staffId) {
        return res.status(409).json({
          message: "This submission key has already been used.",
        });
      }

      return res.status(200).json({
        message: "This inquiry was already submitted.",
        inquiry: existing,
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        ...validation.data,
        submissionKey,
        createdById: req.staffId,
      },
    });

    return res.status(201).json({
      message: "Inquiry created successfully.",
      inquiry,
    });
  } catch (error) {
    if ( typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      const existing = await prisma.inquiry.findUnique({
        where: { submissionKey },
      });

      if (existing && existing.createdById === req.staffId) {
        return res.status(200).json({
          message: "This inquiry was already submitted.",
          inquiry: existing,
        });
      }

      return res.status(409).json({
        message: "This submission key has already been used.",
      });
    }

    console.error("Create inquiry failed:", error);

    return res.status(500).json({
      message: "Unable to create the inquiry right now.",
    });
  }
});


const updateStatusSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]),
});

router.patch("/:id/status", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id;

  if (typeof id !== "string" || id.trim().length === 0) {
    return res.status(400).json({
      message: "A valid inquiry ID is required.",
    });
  }

  const validation = updateStatusSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid inquiry status.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (!req.staffId) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        id,
        createdById: req.staffId,
      },
    });

    if (!inquiry) {
      return res.status(404).json({
        message: "Inquiry not found.",
      });
    }

    const nextStatus = validation.data.status;
    const allowedTransitions: Record<string, string[]> = {
      NEW: ["IN_PROGRESS"],
      IN_PROGRESS: ["RESOLVED"],
      RESOLVED: ["IN_PROGRESS"],
    };

    if (inquiry.status === nextStatus) {
      return res.status(400).json({
        message: "The inquiry already has this status.",
      });
    }

    if (!allowedTransitions[inquiry.status].includes(nextStatus)) {
      return res.status(400).json({
        message: `Status cannot change from ${inquiry.status} to ${nextStatus}.`,
      });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { status: nextStatus as "NEW" | "IN_PROGRESS" | "RESOLVED" },
    });

    return res.status(200).json({
      message: "Inquiry status updated successfully.",
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error("Update inquiry status failed:", error);

    return res.status(500).json({
      message: "Unable to update the inquiry status right now.",
    });
  }
});

export default router;
