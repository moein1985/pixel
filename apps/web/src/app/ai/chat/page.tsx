"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Card, CardContent, Input } from "@pixel/ui";
import { Send, Bot, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

interface ChatMsg {
  role: "user" | "bot";
  content: string;
  suggestions?: string[];
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "bot",
      content: "سلام! من دستیار هوشمند پیکسل هستم. می‌توانم در جستجوی محصولات، استعلام قیمت، یافتن تأمین‌کننده و ثبت درخواست خرید به شما کمک کنم.",
      suggestions: ["قیمت گندم چنده؟", "تأمین‌کننده کود اوره", "وضعیت بازار پنبه", "۵ تن کود می‌خوام"],
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = trpc.ai.chat.useMutation();
  const { data: suggestionsData } = trpc.ai.getSuggestions.useQuery();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");

    chat.mutate({ message: msg }, {
      onSuccess: (data: any) => {
        setMessages((prev) => [...prev, {
          role: "bot",
          content: data.response,
          suggestions: data.suggestions,
        }]);
      },
      onError: () => {
        setMessages((prev) => [...prev, {
          role: "bot",
          content: "متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.",
        }]);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pixel-600" />
            <span className="font-medium">دستیار هوشمند</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-4 h-[calc(100vh-80px)] flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "bot" ? "bg-pixel-100 text-pixel-700" : "bg-gray-200 text-gray-600"
              }`}>
                {msg.role === "bot" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : ""}`}>
                <div className={`rounded-2xl p-3 ${
                  msg.role === "bot" ? "bg-white border" : "bg-pixel-600 text-white"
                }`}>
                  <p className="text-sm leading-6">{msg.content}</p>
                </div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {msg.suggestions.map((s, j) => (
                      <button
                        key={j}
                        onClick={() => handleSend(s)}
                        className="text-xs px-3 py-1.5 rounded-full bg-pixel-50 text-pixel-700 hover:bg-pixel-100 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {chat.isLoading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-pixel-100 text-pixel-700 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white border rounded-2xl p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-3">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="سوال خود را بپرسید..." />
            <Button type="submit" size="icon" disabled={chat.isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
