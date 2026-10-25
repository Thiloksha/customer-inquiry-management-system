
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import { requireAuth, type AuthRequest } from "./middleware/auth";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import inquiryRouter from "./routes/inquiryRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/protected", requireAuth, (req: AuthRequest, res) => {
  res.json({
    message: "You are authenticated.",
    staffId: req.staffId,
  });
});

app.use("/auth", authRoutes);
app.use("/inquiries", inquiryRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
