
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma";

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

router.post("/login", async (req, res) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Please provide a valid email and password.",
    });
  }

  const { email, password } = validation.data;

  try {
    const staff = await prisma.staff.findUnique({
      where: { email },
    });

    if (!staff) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      staff.passwordHash,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      console.error("JWT_SECRET is missing or too short.");
      return res.status(500).json({
        message: "Authentication is temporarily unavailable.",
      });
    }

    const token = jwt.sign(
      { staffId: staff.id },
      secret,
      { expiresIn: "1h" },
    );

    return res.json({
      message: "Sign-in successful.",
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      message: "Unable to sign in right now. Please try again.",
    });
  }
});

export default router;
