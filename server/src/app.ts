import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";
import youtubeRoutes from "./routes/youtube.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  }),
);

app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "JARVIS Backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/chat", chatRoutes);
app.use("/api/youtube", youtubeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;