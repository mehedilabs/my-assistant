import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";

export function notFoundHandler(
  _req: Request,
  res: Response,
): void {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "এই API route পাওয়া যায়নি।",
  });
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const message =
    error instanceof Error ? error.message : "UNKNOWN_ERROR";

  console.error("[JARVIS API]", message);

  if (message.startsWith("AI_SETUP_REQUIRED")) {
    res.status(503).json({
      error: "AI_NOT_CONFIGURED",
      message: "AI চালু করতে Backend-এ Gemini API key যোগ করো।",
    });
    return;
  }

  if (message.startsWith("YOUTUBE_SETUP_REQUIRED")) {
    res.status(503).json({
      error: "YOUTUBE_NOT_CONFIGURED",
      message: "YouTube সার্চ চালু করতে API key যোগ করো।",
    });
    return;
  }

  if (message.startsWith("YOUTUBE_API_ERROR_")) {
    res.status(502).json({
      error: "YOUTUBE_API_FAILED",
      message:
        "YouTube সার্ভিস থেকে উত্তর পাওয়া যায়নি। API key ও quota পরীক্ষা করো।",
    });
    return;
  }

  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করো।",
  });
};