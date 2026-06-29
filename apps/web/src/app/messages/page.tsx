"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, Input } from "@pixel/ui";
import { Send, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const { data: conversations } = trpc.chat.listConversations.useQuery();
  const { data: messages } = trpc.chat.getMessages.useQuery(
    { conversationId: selectedId!, page: 1, pageSize: 50 },
    { enabled: !!selectedId },
  );

  const sendMessage = trpc.chat.sendMessage.useMutation();
  const markAsRead = trpc.chat.markAsRead.useMutation();

  useEffect(() => {
    if (selectedId) {
      markAsRead.mutate({ conversationId: selectedId });
    }
  }, [selectedId, messages?.items?.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !message.trim()) return;
    sendMessage.mutate({ conversationId: selectedId, content: message }, {
      onSuccess: () => setMessage(""),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <Link href="/dashboard"><Button variant="ghost" size="sm">داشبورد</Button></Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4">
        <h1 className="text-xl font-bold mb-4">پیام‌ها</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
          <Card className="md:col-span-1 overflow-hidden">
            <div className="divide-y">
              {conversations?.map((conv: any) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedId === conv.id ? "bg-pixel-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="bg-pixel-600 text-white text-xs rounded-full px-2 py-0.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
                  )}
                </div>
              ))}
              {!conversations?.length && (
                <div className="p-8 text-center text-gray-400">مکالمه‌ای وجود ندارد</div>
              )}
            </div>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            {selectedId ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages?.items.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.senderId === "me" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === "me" ? "bg-pixel-600 text-white" : "bg-gray-100"}`}>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="پیام بنویسید..." />
                    <Button type="submit" size="icon" disabled={sendMessage.isLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                یک مکالمه را انتخاب کنید
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
