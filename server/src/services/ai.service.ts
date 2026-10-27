import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export async function askAI(
  message: string,
  history: ChatHistoryItem[] = [],
): Promise<string> {
  if (!ai) {
    throw new Error(
      "AI_SETUP_REQUIRED: server/.env ফাইলে GEMINI_API_KEY যোগ করো।",
    );
  }

  const recentHistory = history.slice(-12);

  const contents = [
    ...recentHistory.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    contents,
config: {
  maxOutputTokens: 200,
  systemInstruction:
    "You are JARVIS, a fast and helpful personal assistant. Answer directly, concisely, and in the user's language. Avoid unnecessary explanations unless asked.",
},
  });

  const answer = response.text?.trim();

  if (!answer) {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  return answer;
}
export async function* streamAI(
  message: string,
  history: ChatHistoryItem[] = [],
): AsyncGenerator<string> {
  if (!ai) {
    throw new Error(
      "AI_SETUP_REQUIRED: server/.env ফাইলে GEMINI_API_KEY যোগ করো।",
    );
  }

 const recentHistory = history.slice(-4);

  const contents = [
    ...recentHistory.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const stream = await ai.models.generateContentStream({
    model,
    contents,
    config: {
      maxOutputTokens: 300,
      systemInstruction:
        "You are JARVIS, a helpful personal assistant. Reply in the user's language. Keep replies concise, natural, and conversational. Never claim an action succeeded unless it did.",
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
