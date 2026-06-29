"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from "@pixel/ui";
import { TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export default function PricePredictionPage() {
  const [productName, setProductName] = useState("");
  const [province, setProvince] = useState("");
  const [days, setDays] = useState(7);

  const { data, isLoading } = trpc.ai.predictPrice.useQuery(
    { productName: productName || "گندم", province: province || undefined, days },
    { enabled: productName.length > 0 },
  );

  const trendIcon = data?.trend === "increasing" ? <TrendingUp className="h-5 w-5 text-red-500" /> :
    data?.trend === "decreasing" ? <TrendingDown className="h-5 w-5 text-green-500" /> :
    <Minus className="h-5 w-5 text-gray-400" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <Link href="/ai/chat"><Button variant="ghost" size="sm"><Brain className="ml-1 h-4 w-4" /> چت‌بات</Button></Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">پیش‌بینی قیمت محصولات</h1>
        <p className="text-gray-500 mb-6">برای پیش‌بینی قیمت محصول مورد نظر، نام محصول و استان را وارد کنید</p>

        <Card className="mb-6">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">نام محصول</label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="مثلاً: گندم" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">استان</label>
                <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="اختیاری" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">تعداد روزها</label>
                <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} min={1} max={90} />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && <div className="text-center py-8 text-gray-500">در حال محاسبه...</div>}

        {data && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>نتیجه پیش‌بینی: {data.productName}</CardTitle>
                  <div className="flex items-center gap-2">
                    {trendIcon}
                    <Badge variant={data.trend === "increasing" ? "error" : data.trend === "decreasing" ? "success" : "default"}>
                      {data.trend === "increasing" ? "صعودی" : data.trend === "decreasing" ? "نزولی" : "باثبات"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">تغییر پیش‌بینی</p>
                    <p className={`text-xl font-bold ${data.changePct > 0 ? "text-red-500" : data.changePct < 0 ? "text-green-500" : "text-gray-700"}`}>
                      {data.changePct > 0 ? "+" : ""}{data.changePct}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">دقت پیش‌بینی</p>
                    <p className="text-xl font-bold text-pixel-700">{(data.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">استان</p>
                    <p className="text-xl font-bold">{data.province ?? "کشوری"}</p>
                  </div>
                </div>

                {data.factors && data.factors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">عوامل مؤثر:</p>
                    <div className="flex gap-2 flex-wrap">
                      {data.factors.map((f: string, i: number) => (
                        <Badge key={i} variant="info">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>پیش‌بینی روزانه</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="text-right py-2">تاریخ</th>
                        <th className="text-right py-2">قیمت پیش‌بینی</th>
                        <th className="text-right py-2">حداقل</th>
                        <th className="text-right py-2">حداکثر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.predictions.map((p: any, i: number) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{new Date(p.date).toLocaleDateString("fa-IR")}</td>
                          <td className="py-2 font-bold text-pixel-700">{Number(p.price).toLocaleString("fa-IR")}</td>
                          <td className="py-2 text-gray-500">{Number(p.lower).toLocaleString("fa-IR")}</td>
                          <td className="py-2 text-gray-500">{Number(p.upper).toLocaleString("fa-IR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
