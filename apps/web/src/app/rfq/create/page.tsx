"use client";

import { Button, Card, CardContent, Input, Textarea, Select, Label } from "@pixel/ui";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function CreateRFQPage() {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("تن");
  const [description, setDescription] = useState("");
  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [success, setSuccess] = useState(false);

  const createRfq = trpc.rfq.create.useMutation({
    onSuccess: () => setSuccess(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRfq.mutate({
      productName,
      quantity: Number(quantity),
      unit,
      description: description || undefined,
      deliveryProvince: deliveryProvince || undefined,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent>
            <h2 className="text-xl font-bold text-center mb-4">درخواست خرید ثبت شد</h2>
            <p className="text-center text-gray-600 mb-6">درخواست شما در بازار منتشر شد. تأمین‌کنندگان می‌توانند به آن پیشنهاد قیمت بدهند.</p>
            <Link href="/dashboard/rfqs"><Button className="w-full">مشاهده درخواست‌های من</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="text-2xl font-bold mb-6">ثبت درخواست خرید (RFQ)</h1>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>نام محصول *</Label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} required placeholder="مثلاً: کود اوره" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>مقدار *</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required placeholder="مثلاً: ۵" />
                </div>
                <div>
                  <Label>واحد *</Label>
                  <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="تن">تن</option>
                    <option value="کیلوگرم">کیلوگرم</option>
                    <option value="گرم">گرم</option>
                    <option value="لیتر">لیتر</option>
                    <option value="عدد">عدد</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label>قیمت هدف (تومان)</Label>
                <Input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="اختیاری" />
              </div>
              <div>
                <Label>استان تحویل</Label>
                <Input value={deliveryProvince} onChange={(e) => setDeliveryProvince(e.target.value)} placeholder="اختیاری" />
              </div>
              <div>
                <Label>توضیحات</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات تکمیلی..." />
              </div>
              <Button type="submit" className="w-full" disabled={createRfq.isLoading}>
                {createRfq.isLoading ? "در حال ثبت..." : "ثبت درخواست"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
