"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@pixel/ui";
import { Package, ShoppingCart, TrendingUp, Users, Bell, AlertTriangle, Star } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#15803d", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function SupplierDashboardPage() {
  const { data: myProducts } = trpc.product.getMyProducts.useQuery({ page: 1, pageSize: 100 });
  const { data: myOrders } = trpc.order.getMyOrders.useQuery({ page: 1, pageSize: 100 });
  const { data: myRfqs } = trpc.rfq.getMyRfqs.useQuery({ page: 1, pageSize: 20 });
  const { data: conversations } = trpc.chat.listConversations.useQuery();

  const orders = myOrders?.items ?? [];
  const products = myProducts?.items ?? [];

  const pendingOrders = orders.filter((o: any) => o.status === "pending");
  const totalRevenue = orders
    .filter((o: any) => ["confirmed", "paid", "shipped", "delivered"].includes(o.status))
    .reduce((sum: number, o: any) => sum + Number(o.totalAmount ?? 0), 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayOrders = orders.filter((o: any) => {
      const od = new Date(o.createdAt);
      return od.toDateString() === d.toDateString();
    });
    return {
      date: d.toLocaleDateString("fa-IR", { weekday: "short" }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s: number, o: any) => s + Number(o.totalAmount ?? 0), 0),
    };
  });

  const categoryData = products.reduce((acc: Record<string, number>, p: any) => {
    const cat = p.categoryName ?? "سایر";
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const categoryChart = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const topProducts = [...products]
    .sort((a: any, b: any) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);

  const lowStockProducts = products.filter((p: any) =>
    p.stockStatus === "low_stock" || p.stockStatus === "out_of_stock",
  );

  const unreadCount = conversations?.reduce((sum: number, c: any) => sum + (c.unreadCount ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <div className="flex items-center gap-3">
            <Link href="/messages" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
              )}
            </Link>
            <Link href="/dashboard"><Button variant="ghost" size="sm">داشبورد کلی</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">داشبورد تأمین‌کننده</h1>

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
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString("fa-IR")}</p>
                <p className="text-sm text-gray-500">درآمد (تومان)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-gray-500">محصولات</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
                <p className="text-sm text-gray-500">سفارش‌های در انتظار</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle>فروش ۷ روز اخیر</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={2} name="درآمد" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>توزیع محصولات بر اساس دسته‌بندی</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle>سفارش‌های ۷ روز اخیر</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3b82f6" name="سفارش‌ها" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>محصولات پربازدید</CardTitle>
                <Link href="/dashboard/products"><Button size="sm" variant="outline">مدیریت</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topProducts.map((p: any, i: number) => (
                  <Link key={p.id} href={`/market/${p.id}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold w-6">{(i + 1).toLocaleString("fa-IR")}</span>
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <Badge variant="info">{p.viewCount?.toLocaleString("fa-IR") ?? 0} بازدید</Badge>
                  </Link>
                ))}
                {!topProducts.length && <p className="text-gray-400 text-center py-4">محصولی ثبت نشده</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>سفارش‌های در انتظار تأیید</CardTitle>
                <Badge variant="warning">{pendingOrders.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingOrders.slice(0, 5).map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{o.orderNumber}</span>
                      <span className="text-sm text-gray-500 mr-2">{o.buyerName}</span>
                    </div>
                    <span className="text-sm font-bold text-pixel-700">{Number(o.totalAmount ?? 0).toLocaleString("fa-IR")}</span>
                  </div>
                ))}
                {!pendingOrders.length && <p className="text-gray-400 text-center py-4">سفارش در انتظاری وجود ندارد</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>هشدار موجودی</CardTitle>
                <Badge variant="error">{lowStockProducts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((p: any) => (
                  <Link key={p.id} href={`/market/${p.id}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant={p.stockStatus === "out_of_stock" ? "error" : "warning"}>
                      {p.stockStatus === "out_of_stock" ? "ناموجود" : "موجودی کم"}
                    </Badge>
                  </Link>
                ))}
                {!lowStockProducts.length && <p className="text-gray-400 text-center py-4">همه محصولات موجود هستند</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
