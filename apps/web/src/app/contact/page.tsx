"use client";

import { Button, Card, CardContent, Input, Textarea, Select, Label } from "@pixel/ui";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [type, setType] = useState("inquiry");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const createInquiry = trpc.inquiry.create.useMutation({
    onSuccess: () => setSuccess(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInquiry.mutate({
      type: type as any,
      name,
      phone,
      email: email || undefined,
      subject,
      message,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">تماس با ما</h1>

        {success ? (
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-bold text-pixel-700 mb-2">پیام شما ثبت شد</h2>
              <p className="text-gray-600">در اسرع وقت با شما تماس خواهیم گرفت.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>نوع درخواست *</Label>
                  <Select value={type} onChange={(e) => setType(e.target.value)} className="w-full">
                    <option value="inquiry">استعلام</option>
                    <option value="cooperation">همکاری</option>
                    <option value="complaint">شکایت</option>
                    <option value="suggestion">پیشنهاد</option>
                  </Select>
                </div>
                <div>
                  <Label>نام و نام خانوادگی *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>شماره موبایل *</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="09xxxxxxxxx" />
                </div>
                <div>
                  <Label>ایمیل</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="اختیاری" />
                </div>
                <div>
                  <Label>موضوع *</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>
                <div>
                  <Label>پیام *</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
                </div>
                <Button type="submit" className="w-full" disabled={createInquiry.isLoading}>
                  {createInquiry.isLoading ? "در حال ارسال..." : "ارسال"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center">
              <Phone className="h-8 w-8 text-pixel-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">تلفن پشتیبانی</p>
              <p className="font-bold">۰۲۱-۸۸۸۸۸۸۸۸</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <Mail className="h-8 w-8 text-pixel-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">ایمیل</p>
              <p className="font-bold">info@pixel.ir</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <MessageSquare className="h-8 w-8 text-pixel-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">چت آنلاین</p>
              <p className="font-bold">۲۴/۷</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
