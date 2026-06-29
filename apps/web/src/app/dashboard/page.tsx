"use client";

import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@pixel/ui";
import { Package, ShoppingCart, FileText, MessageSquare, TrendingUp, Users, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export default function DashboardPage() {
  const { data: myProducts } = trpc.product.getMyProducts.useQuery({ page: 1, pageSize: 5 });
  const { data: myOrders } = trpc.order.getMyOrders.useQuery({ page: 1, pageSize: 5 });
  const { data: myRfqs } = trpc.rfq.getMyRfqs.useQuery({ page: 1, pageSize: 5 });
  const { data: conversations } = trpc.chat.listConversations.useQuery();
  const { data: myNetworks } = trpc.network.getMyNetworks.useQuery();

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
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profile"><Settings className="h-5 w-5 text-gray-600" /></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">داشبورد</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-3">
              <Package className="h-8 w-8 text-pixel-600" />
              <div>
                <p className="text-2xl font-bold">{myProducts?.total ?? 0}</p>
                <p className="text-sm text-gray-500">محصولات</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-pixel-600" />
              <div>
                <p className="text-2xl font-bold">{myOrders?.total ?? 0}</p>
                <p className="text-sm text-gray-500">سفارش‌ها</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-pixel-600" />
              <div>
                <p className="text-2xl font-bold">{myRfqs?.total ?? 0}</p>
                <p className="text-sm text-gray-500">درخواست‌های خرید</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <Users className="h-8 w-8 text-pixel-600" />
              <div>
                <p className="text-2xl font-bold">{myNetworks?.length ?? 0}</p>
                <p className="text-sm text-gray-500">شبکه‌ها</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>محصولات من</CardTitle>
                <Link href="/dashboard/products"><Button size="sm" variant="outline">مدیریت</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {myProducts?.items?.length ? (
                <div className="space-y-2">
                  {myProducts.items.map((p: any) => (
                    <Link key={p.id} href={`/market/${p.id}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="font-medium">{p.name}</span>
                      <Badge variant={p.stockStatus === "in_stock" ? "success" : "warning"}>
                        {p.stockStatus === "in_stock" ? "موجود" : "ناموجود"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">محصولی ثبت نشده</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>سفارش‌های اخیر</CardTitle>
                <Link href="/dashboard/orders"><Button size="sm" variant="outline">همه</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {myOrders?.items?.length ? (
                <div className="space-y-2">
                  {myOrders.items.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{o.orderNumber}</span>
                        <span className="text-sm text-gray-500 mr-2">{o.supplierName}</span>
                      </div>
                      <Badge variant={o.status === "delivered" ? "success" : o.status === "cancelled" ? "error" : "info"}>
                        {o.status === "pending" ? "در انتظار" : o.status === "confirmed" ? "تأیید شده" : o.status === "paid" ? "پرداخت شده" : o.status === "shipped" ? "ارسال شده" : o.status === "delivered" ? "تحویل شده" : o.status === "cancelled" ? "لغو شده" : "م спор"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">سفارشی ثبت نشده</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>درخواست‌های خرید (RFQ)</CardTitle>
                <Link href="/rfq/create"><Button size="sm">ثبت RFQ</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {myRfqs?.items?.length ? (
                <div className="space-y-2">
                  {myRfqs.items.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="font-medium">{r.productName}</span>
                      <Badge variant={r.status === "open" ? "info" : r.status === "awarded" ? "success" : "default"}>
                        {r.status === "open" ? "باز" : r.status === "awarded" ? "اختصاص یافت" : r.status === "closed" ? "بسته شده" : "لغو شده"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">درخواستی ثبت نشده</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>پیام‌های اخیر</CardTitle>
                <Link href="/messages"><Button size="sm" variant="outline"><MessageSquare className="ml-1 h-4 w-4" /> همه</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {conversations?.length ? (
                <div className="space-y-2">
                  {conversations.slice(0, 5).map((c: any) => (
                    <Link key={c.id} href="/messages" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="font-medium">{c.otherUser?.firstName} {c.otherUser?.lastName}</span>
                      {c.unreadCount > 0 && <Badge variant="error">{c.unreadCount}</Badge>}
                    </Link>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">پیامی وجود ندارد</p>}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/market"><Button variant="outline"><Package className="ml-1 h-4 w-4" /> بازار</Button></Link>
          <Link href="/ai/chat"><Button variant="outline"><TrendingUp className="ml-1 h-4 w-4" /> دستیار هوشمند</Button></Link>
          <Link href="/ai/price"><Button variant="outline"><TrendingUp className="ml-1 h-4 w-4" /> پیش‌بینی قیمت</Button></Link>
          <Link href="/news"><Button variant="outline">اخبار</Button></Link>
          <Link href="/reports"><Button variant="outline">گزارش بازار</Button></Link>
          <Link href="/networks"><Button variant="outline">شبکه‌ها</Button></Link>
          <Link href="/contact"><Button variant="outline">تماس</Button></Link>
        </div>
      </div>
    </div>
  );
}
