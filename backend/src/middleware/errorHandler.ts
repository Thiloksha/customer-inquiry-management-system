
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

export function notFoundHandler(
  req: Request,
  res: Response,
) {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.path}`,
  });
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Unexpected server error:", error);

  if (res.headersSent) {
    return;
  }

  return res.status(500).json({
    message: "An unexpected server error occurred. Please try again.",
  });
};
