export type MessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
};

export type AssistantAction = "home" | "chat" | "reminders" | "settings";
