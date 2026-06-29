"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@pixel/ui";
import { ShoppingCart, FileText, MessageSquare, TrendingUp, Users, Star } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function FarmerDashboardPage() {
  const { data: myOrders } = trpc.order.getMyOrders.useQuery({ page: 1, pageSize: 100 });
  const { data: myRfqs } = trpc.rfq.getMyRfqs.useQuery({ page: 1, pageSize: 20 });
  const { data: conversations } = trpc.chat.listConversations.useQuery();
  const { data: myNetworks } = trpc.network.getMyNetworks.useQuery();
  const { data: recommendations } = trpc.ai.recommendProducts.useQuery({});

  const orders = myOrders?.items ?? [];
  const activeRfqs = (myRfqs?.items ?? []).filter((r: any) => r.status === "open");
  const unreadCount = conversations?.reduce((sum: number, c: any) => sum + (c.unreadCount ?? 0), 0) ?? 0;

  const totalSpent = orders
    .filter((o: any) => ["confirmed", "paid", "shipped", "delivered"].includes(o.status))
    .reduce((sum: number, o: any) => sum + Number(o.totalAmount ?? 0), 0);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthOrders = orders.filter((o: any) => {
      const od = new Date(o.createdAt);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
    });
    return {
      month: d.toLocaleDateString("fa-IR", { month: "long" }),
      spent: monthOrders.reduce((s: number, o: any) => s + Number(o.totalAmount ?? 0), 0),
      orders: monthOrders.length,
    };
  });

  const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusChart = Object.entries(statusCounts).map(([status, count]) => ({
    status: status === "pending" ? "در انتظار" : status === "confirmed" ? "تأیید شده" : status === "paid" ? "پرداخت شده" : status === "shipped" ? "ارسال شده" : status === "delivered" ? "تحویل شده" : status === "cancelled" ? "لغو شده" : "م спор",
    count,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <Link href="/dashboard"><Button variant="ghost" size="sm">داشبورد کلی</Button></Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">داشبورد کشاورز</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-pixel-600" />
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-gray-500">کل سفارش‌ها</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalSpent.toLocaleString("fa-IR")}</p>
                <p className="text-sm text-gray-500">کل خرید (تومان)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{activeRfqs.length}</p>
                <p className="text-sm text-gray-500">RFQ های فعال</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{myNetworks?.length ?? 0}</p>
                <p className="text-sm text-gray-500">شبکه‌های من</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle>خرید ۶ ماه اخیر</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={last6Months}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="spent" stroke="#15803d" strokeWidth={2} name="مبلغ خرید" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>وضعیت سفارش‌ها</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="تعداد" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>RFQ های فعال</CardTitle>
                <Link href="/rfq/create"><Button size="sm">ثبت RFQ</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeRfqs.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{r.productName}</span>
                      <span className="text-sm text-gray-500 mr-2">{r.quantity} {r.unit}</span>
                    </div>
                    <Badge variant="info">{r.bidCount ?? 0} پیشنهاد</Badge>
                  </div>
                ))}
                {!activeRfqs.length && <p className="text-gray-400 text-center py-4">RFQ فعالی وجود ندارد</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>پیشنهادهای هوشمند</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations?.products?.slice(0, 5).map((p: any) => (
                  <Link key={p.id} href={`/market/${p.id}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{p.name}</span>
                      {p.supplierName && <span className="text-sm text-gray-500 mr-2">{p.supplierName}</span>}
                    </div>
                    {p.pricePerUnit && <span className="text-sm font-bold text-pixel-700">{Number(p.pricePerUnit).toLocaleString("fa-IR")}</span>}
                  </Link>
                ))}
                {!recommendations?.products?.length && <p className="text-gray-400 text-center py-4">پیشنهادی موجود نیست</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
