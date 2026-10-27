import { Router } from "express";
import { searchYouTube } from "../services/youtube.service.js";

const router = Router();

router.get("/search", async (req, res, next) => {
  try {
    const query =
      typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query) {
      res.status(400).json({
        error: "QUERY_REQUIRED",
        message: "কী খুঁজতে চাও তা লিখো।",
      });
      return;
    }

    if (query.length > 200) {
      res.status(400).json({
        error: "QUERY_TOO_LONG",
        message: "সার্চ ২০০ অক্ষরের মধ্যে রাখো।",
      });
      return;
    }

    const videos = await searchYouTube(query);

    res.json({ videos });
  } catch (error) {
    next(error);
  }
});

export default router;