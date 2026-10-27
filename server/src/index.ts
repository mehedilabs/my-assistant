import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT) || 4000;

const server = app.listen(port, () => {
  console.log(`JARVIS Backend: http://localhost:${port}`);
  console.log(`Health Check: http://localhost:${port}/api/health`);

  if (!process.env.GEMINI_API_KEY) {
    console.warn("Gemini API key সেট করা হয়নি। AI chat কাজ করবে না।");
  }

  if (!process.env.YOUTUBE_API_KEY) {
    console.warn("YouTube API key সেট করা হয়নি। YouTube search কাজ করবে না।");
  }
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);