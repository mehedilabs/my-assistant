import type { ChatMessage as ChatMessageData } from "@/types/assistant";

type ChatMessageProps = {
  message: ChatMessageData;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-row ${isUser ? "message-user" : "message-assistant"}`}
    >
      {!isUser && <div className="message-avatar assistant-avatar">J</div>}

      <div className="message-content">
        <div className="message-meta">
          <span>{isUser ? "তুমি" : "JARVIS"}</span>

          <time>
            {message.createdAt.toLocaleTimeString("bn-BD", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>

        <div className="message-bubble">{message.content}</div>
      </div>

      {isUser && <div className="message-avatar user-avatar">M</div>}
    </div>
  );
}
