
import { Router } from "express";
import {
  streamAI,
  type ChatHistoryItem,
} from "../services/ai.service.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const body: unknown = req.body;

    if (!body || typeof body !== "object") {
      res.status(400).json({
        message: "সঠিক JSON body পাঠাও।",
      });
      return;
    }

    const payload = body as {
      message?: unknown;
      history?: unknown;
    };

    const message = payload.message;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      res.status(400).json({
        message: "একটি মেসেজ লিখে পাঠাও।",
      });
      return;
    }

    if (message.length > 4000) {
      res.status(413).json({
        message: "মেসেজটি ৪০০০ অক্ষরের মধ্যে রাখো।",
      });
      return;
    }

    const validHistory: ChatHistoryItem[] = [];

    if (Array.isArray(payload.history)) {
      for (const item of payload.history) {
        if (
          item !== null &&
          typeof item === "object" &&
          "role" in item &&
          "content" in item &&
          (item.role === "user" ||
            item.role === "assistant") &&
          typeof item.content === "string"
        ) {
          validHistory.push({
            role: item.role,
            content: item.content,
          });
        }
      }
    }

    validHistory.splice(8);

   res.status(200);
res.setHeader(
  "Content-Type",
  "text/event-stream; charset=utf-8",
);
res.setHeader(
  "Cache-Control",
  "no-cache, no-transform",
);
res.setHeader("Connection", "keep-alive");
res.flushHeaders();

    try {
      for await (const text of streamAI(
        message.trim(),
        validHistory,
      )) {
        res.write(
          `data: ${JSON.stringify({ text })}\n\n`,
        );
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("[JARVIS STREAM]", error);

      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({
            error:
              "AI উত্তর দিতে পারেনি। আবার চেষ্টা করো।",
          })}\n\n`,
        );
        res.end();
      }
    }
  } catch (error) {
    next(error);
  }
});

export default router;
