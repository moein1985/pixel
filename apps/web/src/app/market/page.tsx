"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Badge } from "@pixel/ui";
import { Search, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export default function MarketPage() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "popular" | "rating">("newest");

  const { data, isLoading } = trpc.product.list.useQuery({
    categoryId,
    sort,
    page: 1,
    pageSize: 20,
  });

  const searchResults = trpc.product.search.useQuery(
    { query, page: 1, pageSize: 20 },
    { enabled: query.length > 0 },
  );

  const items = query.length > 0 ? searchResults.data?.items : data?.items;
  const loading = query.length > 0 ? searchResults.isLoading : isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-pixel-700">پیکسل</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">ورود</Button></Link>
            <Link href="/register"><Button size="sm">ثبت‌نام</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">بازار هوشمند کشاورزی</h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="جستجوی محصول..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value as any)} className="w-48">
            <option value="newest">جدیدترین</option>
            <option value="price_asc">ارزان‌ترین</option>
            <option value="price_desc">گران‌ترین</option>
            <option value="popular">پربازدیدترین</option>
            <option value="rating">پرامتیازترین</option>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">در حال بارگذاری...</div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item: any) => (
              <Link key={item.id} href={`/market/${item.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent>
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.supplierName}</p>
                    <div className="mt-2 flex items-center justify-between">
                      {item.pricePerUnit ? (
                        <span className="text-pixel-700 font-bold">
                          {Number(item.pricePerUnit).toLocaleString("fa-IR")} تومان/{item.unit}
                        </span>
                      ) : (
                        <span className="text-gray-400">استعلام قیمت</span>
                      )}
                      {item.rating && Number(item.rating) > 0 && (
                        <Badge variant="success">★ {Number(item.rating).toFixed(1)}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">محصولی یافت نشد</div>
        )}
      </div>
    </div>
  );
}
