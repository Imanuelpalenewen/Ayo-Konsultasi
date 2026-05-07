import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, BookOpen, GraduationCap, Building2, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  { icon: Building2, text: "Apa itu Universitas Klabat (UNKLAB)?" },
  { icon: GraduationCap, text: "Siapa saja dosen yang bisa membantu skripsi?" },
  { icon: BookOpen, text: "Bagaimana cara booking konsultasi di sistem ini?" },
  { icon: HelpCircle, text: "Apa keahlian dosen-dosen yang terdaftar?" },
];

const LOADING_MESSAGES = [
  "AI sedang berpikir...",
  "Mengumpulkan informasi...",
  "Menyusun jawaban...",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendChatMessage = useAction(api.chat.chat);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Cycle loading messages while waiting for AI response.
  useEffect(() => {
    if (!isLoading) return;
    setLoadingMsgIdx(0);
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSend = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history for context (exclude the just-added user message)
      const history = messages.map((m) => ({ role: m.role, text: m.text }));

      const response = await sendChatMessage({ message: messageText, history });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "model",
          text: response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "model",
          text: "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Asisten AI UNKLAB
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Tanya tentang UNKLAB, dosen, dan sistem konsultasi
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset chat
            </button>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 bg-[#f0f4f8] dark:bg-gray-950">

          {/* Empty state — suggested questions */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-8">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-5 shadow-inner">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1.5">
                Hai! Ada yang bisa saya bantu?
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mb-8">
                Tanya apa saja tentang UNKLAB, dosen, keahlian mereka, atau cara menggunakan sistem ini.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_QUESTIONS.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => handleSend(text)}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-left text-sm text-gray-700 dark:text-gray-300 font-medium hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-primary mt-0.5 shrink-0 transition-colors" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5 ${
                  msg.role === "user"
                    ? "bg-primary"
                    : "bg-gray-700 dark:bg-gray-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "model" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-600 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              {/* Bot avatar with pulse ring */}
              <div className="relative shrink-0 mt-0.5">
                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "1.4s" }} />
                <div className="relative w-8 h-8 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex flex-col gap-1.5 min-w-55">
                <div className="flex items-center gap-2">
                  <TypingDots />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium transition-opacity">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  Biasanya 3–8 detik
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 md:px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya sesuatu tentang UNKLAB atau sistem ini…"
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none resize-none max-h-32 min-h-[24px] leading-relaxed disabled:opacity-50"
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm shadow-primary/20 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
            Tekan <kbd className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 rounded border border-gray-200 dark:border-gray-600 text-[10px]">Enter</kbd> untuk kirim ·{" "}
            <kbd className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 rounded border border-gray-200 dark:border-gray-600 text-[10px]">Shift+Enter</kbd> untuk baris baru
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
