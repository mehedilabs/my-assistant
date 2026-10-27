"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/jarvis/Sidebar";
import ChatMessage from "@/components/jarvis/ChatMessage";
import VoiceOrb from "@/components/jarvis/VoiceOrb";
import type {
  AssistantAction,
  ChatMessage as ChatMessageData,
} from "@/types/assistant";

type SpeechResult = {
  transcript: string;
};

type SpeechResultEvent = {
  results: ArrayLike<ArrayLike<SpeechResult>>;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const initialMessages: ChatMessageData[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "আসসালামু আলাইকুম! আমি JARVIS, তোমার ব্যক্তিগত সহকারী। নিচে লিখে অথবা মাইক্রোফোনে কথা বলে আমার সঙ্গে যোগাযোগ করতে পারো।",
    createdAt: new Date(),
  },
];

const quickActions = [
  { icon: "▶", label: "YouTube", prompt: "YouTube-এ সার্চ করতে চাই" },
  { icon: "✉", label: "Gmail", prompt: "Gmail খোলার সুবিধা চাই" },
  { icon: "☎", label: "Phone", prompt: "ফোন কল করার সুবিধা চাই" },
  { icon: "◷", label: "Reminder", prompt: "একটি রিমাইন্ডার তৈরি করতে চাই" },
];

const sectionInfo: Record<
  AssistantAction,
  { title: string; subtitle: string }
> = {
  home: {
    title: "আমি কীভাবে সাহায্য করতে পারি?",
    subtitle: "তোমার ব্যক্তিগত সহকারী, সবকিছু এক জায়গায়।",
  },
  chat: {
    title: "কথোপকথন",
    subtitle: "তোমার মেসেজগুলো এখানে দেখা যাবে।",
  },
  reminders: {
    title: "রিমাইন্ডার",
    subtitle: "রিমাইন্ডার সংরক্ষণ ও নোটিফিকেশন পরে যুক্ত হবে।",
  },
  settings: {
    title: "সেটিংস",
    subtitle: "তোমার ব্যক্তিগত সহকারীর সেটিংস।",
  },
};

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<AssistantAction>("home");

  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);

  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const voiceSupported = useSyncExternalStore(
    () => () => {},
    () => {
      const speechWindow = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };

      return Boolean(
        speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition,
      );
    },
    () => true,
  );

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "bn-BD";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;

      if (transcript) {
        setInput(transcript);
        sendMessage(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(rawMessage?: string) {
    const content = (rawMessage ?? input).trim();

    if (!content || isThinking) return;

    const previousMessages = messages;

    const userMessage: ChatMessageData = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setActiveSection("chat");
    setIsThinking(true);

    let assistantId: string | null = null;
    let fullReply = "";

    try {
      const history = previousMessages
        .filter(
          (message) => message.id !== "welcome" || message.role !== "assistant",
        )
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = "AI-এর সঙ্গে যোগাযোগ করা যায়নি।";

        try {
          const data = JSON.parse(errorText);
          message = data.message || message;
        } catch {
          // সার্ভার থেকে JSON না এলে সাধারণ Error দেখাবে।
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error("Streaming response পাওয়া যায়নি।");
      }

      assistantId = crypto.randomUUID();

      const newAssistantMessage: ChatMessageData = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setMessages((previous) => [...previous, newAssistantMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      function processEvent(event: string) {
        const dataLine = event
          .split(/\r?\n/)
          .find((line) => line.startsWith("data:"));

        if (!dataLine) return;

        const payload = dataLine.slice(5).trim();

        if (!payload || payload === "[DONE]") return;

        const data = JSON.parse(payload) as {
          text?: string;
          error?: string;
        };

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.text) {
          fullReply += data.text;

          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: fullReply,
                  }
                : message,
            ),
          );
        }
      }

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";

        for (const event of events) {
          processEvent(event);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processEvent(buffer);
      }

      if (!fullReply.trim()) {
        throw new Error("AI থেকে কোনো উত্তর পাওয়া যায়নি।");
      }

      // উত্তর সম্পূর্ণ হলে সেটি শোনাবে।
      if ("speechSynthesis" in window) {
        const synth = window.speechSynthesis;

        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(fullReply);
        const voices = synth.getVoices();

        const bengaliVoice = voices.find((voice) =>
          /^bn([-_]|$)/i.test(voice.lang),
        );

        if (bengaliVoice) {
          utterance.voice = bengaliVoice;
          utterance.lang = bengaliVoice.lang;
        } else {
          utterance.lang = "bn-BD";
        }

        utterance.rate = 1;
        utterance.pitch = 1;

        synth.speak(utterance);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "অজানা সমস্যা হয়েছে।";

      setMessages((previous) => {
        const updated = assistantId
          ? previous.filter((message) => message.id !== assistantId)
          : previous;

        return [
          ...updated,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: fullReply
              ? `${fullReply}\n\nদুঃখিত, সংযোগে সমস্যা হয়েছে: ${errorMessage}`
              : `দুঃখিত, ${errorMessage}`,
            createdAt: new Date(),
          },
        ];
      });
    } finally {
      setIsThinking(false);
    }
  }

  function toggleVoice() {
    const recognition = recognitionRef.current;

    if (!recognition) {
      return;
    }

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function selectSection(section: AssistantAction) {
    setActiveSection(section);
  }

  function handleQuickAction(prompt: string) {
    sendMessage(prompt);
  }

  const currentSection = sectionInfo[activeSection];

  return (
    <main className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onNavigate={selectSection}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="মেনু খুলুন"
            >
              <span />
              <span />
              <span />
            </button>

            <div className="breadcrumb">
              <span>JARVIS</span>
              <span className="breadcrumb-divider">/</span>
              <strong>
                {activeSection === "home" ? "Workspace" : currentSection.title}
              </strong>
            </div>
          </div>

          <div className="topbar-status">
            <span className="status-dot" />
            <span>Personal Assistant</span>
          </div>
        </header>

        <div className="workspace">
          <section className="welcome-section">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              YOUR PERSONAL ASSISTANT
            </div>

            <h1>
              {activeSection === "home" ? (
                <>
                  শুভ সন্ধ্যা
                  <span className="heading-dot">.</span>
                </>
              ) : (
                currentSection.title
              )}
            </h1>

            <p className="welcome-subtitle">{currentSection.subtitle}</p>
          </section>

          {activeSection === "reminders" ? (
            <section className="placeholder-panel">
              <div className="placeholder-icon">◷</div>
              <h2>রিমাইন্ডার সেন্টার</h2>
              <p>এখানে ভবিষ্যতে রিমাইন্ডার তৈরি, দেখা ও পরিচালনা করতে পারবে।</p>
              <span className="feature-badge">BACKEND REQUIRED</span>
            </section>
          ) : activeSection === "settings" ? (
            <section className="placeholder-panel">
              <div className="placeholder-icon">⚙</div>
              <h2>ব্যক্তিগত সেটিংস</h2>
              <p>
                ভবিষ্যতে এখানে ভয়েস, ভাষা ও সহকারীর পছন্দগুলো নিয়ন্ত্রণ করতে
                পারবে।
              </p>
              <span className="feature-badge">COMING LATER</span>
            </section>
          ) : (
            <>
              {activeSection === "home" && (
                <section className="voice-section">
                  <VoiceOrb
                    listening={listening}
                    onClick={toggleVoice}
                    disabled={!voiceSupported}
                  />

                  <div className="voice-title">
                    {listening ? "আমি শুনছি..." : "কথা বলো, আমি শুনছি"}
                  </div>

                  <p className="voice-description">
                    {voiceSupported
                      ? "মাইক্রোফোনে চাপ দিয়ে তোমার কথা বলো"
                      : "এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। নিচে লিখে পাঠাও।"}
                  </p>

                  <div className="voice-indicator">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </section>
              )}

              <section className="chat-section">
                <div className="section-heading">
                  <div>
                    <h2>কথোপকথন</h2>
                    <p>তোমার ও JARVIS-এর মেসেজ</p>
                  </div>

                  <span className="message-count">
                    {messages.length} messages
                  </span>
                </div>

                <div className="chat-messages">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}

                  {isThinking && (
                    <div className="thinking-indicator">
                      <span className="thinking-dot" />
                      <span className="thinking-dot" />
                      <span className="thinking-dot" />
                      <span>JARVIS উত্তর তৈরি করছে...</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </section>

              {activeSection === "home" && (
                <section className="quick-actions">
                  <div className="quick-actions-label">TRY SOMETHING</div>

                  <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                      <button
                        className="quick-action"
                        key={action.label}
                        onClick={() => handleQuickAction(action.prompt)}
                      >
                        <span className="quick-action-icon">{action.icon}</span>

                        <span>{action.label}</span>

                        <span className="quick-action-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="composer-area">
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <button
              type="button"
              className={`composer-mic ${
                listening ? "composer-mic-active" : ""
              }`}
              onClick={toggleVoice}
              aria-label="ভয়েস ইনপুট"
              title="কথা বলুন"
              disabled={!voiceSupported}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="3" width="6" height="12" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0" />
                <path d="M12 18v3" />
                <path d="M8 21h8" />
              </svg>
            </button>

            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="এখানে লিখো অথবা মাইক্রোফোনে কথা বলো..."
              aria-label="তোমার মেসেজ"
            />

            <span className="composer-shortcut">↵</span>

            <button
              className="send-button"
              type="submit"
              disabled={!input.trim()}
              aria-label="মেসেজ পাঠাও"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4Z" />
              </svg>
            </button>
          </form>

          <div className="privacy-note">
            <span className="privacy-lock">◇</span>
            তোমার ব্যক্তিগত সহকারী · Frontend Demo
          </div>
        </footer>
      </section>
    </main>
  );
}
