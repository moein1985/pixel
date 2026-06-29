"use client";

import { Card, CardContent, Badge, Input, Button } from "@pixel/ui";
import { TrendingUp, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function ReportsPage() {
  const [type, setType] = useState<string | undefined>();
  const { data, isLoading } = trpc.content.reportList.useQuery({
    type,
    page: 1,
    pageSize: 20,
  });
  const { data: latestPrices } = trpc.content.priceGetLatest.useQuery({});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <Link href="/login"><Badge variant="info">ورود</Badge></Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">گزارش‌های بازار</h1>

        {latestPrices && latestPrices.length > 0 && (
          <Card className="mb-8">
            <CardContent>
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pixel-600" />
                قیمت‌های روز بازار
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="text-right py-2">محصول</th>
                      <th className="text-right py-2">استان</th>
                      <th className="text-right py-2">حداقل قیمت</th>
                      <th className="text-right py-2">حداکثر قیمت</th>
                      <th className="text-right py-2">میانگین</th>
                      <th className="text-right py-2">واحد</th>
                      <th className="text-right py-2">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestPrices.map((price: any) => (
                      <tr key={price.id} className="border-b">
                        <td className="py-2 font-medium">{price.productName}</td>
                        <td className="py-2 text-gray-500">{price.province ?? "—"}</td>
                        <td className="py-2">{Number(price.minPrice).toLocaleString("fa-IR")}</td>
                        <td className="py-2">{Number(price.maxPrice).toLocaleString("fa-IR")}</td>
                        <td className="py-2 font-bold text-pixel-700">{Number(price.avgPrice).toLocaleString("fa-IR")}</td>
                        <td className="py-2 text-gray-500">{price.unit}</td>
                        <td className="py-2 text-gray-400">{new Date(price.recordedAt).toLocaleDateString("fa-IR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {["price_analysis", "supply_demand", "seasonal", "export_import", "general"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t === type ? undefined : t)}
              className={`px-4 py-2 rounded-lg text-sm ${type === t ? "bg-pixel-600 text-white" : "bg-white border"}`}
            >
              {t === "price_analysis" ? "تحلیل قیمت" : t === "supply_demand" ? "عرضه و تقاضا" : t === "seasonal" ? "فصلی" : t === "export_import" ? "صادرات و واردات" : "عمومی"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">در حال بارگذاری...</div>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((report: any) => (
              <Link key={report.id} href={`/reports/${report.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {report.coverImageUrl && (
                    <img src={report.coverImageUrl} alt={report.title} className="w-full h-40 object-cover rounded-t-lg" />
                  )}
                  <CardContent>
                    <Badge variant="success">{report.reportType}</Badge>
                    <h3 className="font-bold mt-2 line-clamp-2">{report.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{report.summary}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {report.viewCount}</span>
                      {report.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.publishedAt).toLocaleDateString("fa-IR")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">گزارشی یافت نشد</div>
        )}
      </div>
    </div>
  );
}
