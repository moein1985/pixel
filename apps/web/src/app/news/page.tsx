"use client";

import { Card, CardContent, Badge } from "@pixel/ui";
import { Calendar, User, Eye } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function NewsPage() {
  const [category, setCategory] = useState<string | undefined>();
  const { data, isLoading } = trpc.content.articleList.useQuery({
    category,
    page: 1,
    pageSize: 20,
  });
  const { data: featured } = trpc.content.articleGetFeatured.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Badge variant="info">ورود</Badge></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">اخبار و مقالات</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["news", "article", "report", "guideline", "announcement"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? undefined : cat)}
              className={`px-4 py-2 rounded-lg text-sm ${category === cat ? "bg-pixel-600 text-white" : "bg-white border"}`}
            >
              {cat === "news" ? "اخبار" : cat === "article" ? "مقالات" : cat === "report" ? "گزارش" : cat === "guideline" ? "راهنما" : "اطلاعیه"}
            </button>
          ))}
        </div>

        {featured && featured.length > 0 && !category && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3">ویژه</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((article: any) => (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {article.coverImageUrl && (
                      <img src={article.coverImageUrl} alt={article.title} className="w-full h-40 object-cover rounded-t-lg" />
                    )}
                    <CardContent>
                      <Badge variant="info">{article.category}</Badge>
                      <h3 className="font-bold mt-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">در حال بارگذاری...</div>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((article: any) => (
              <Link key={article.id} href={`/news/${article.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {article.coverImageUrl && (
                    <img src={article.coverImageUrl} alt={article.title} className="w-full h-40 object-cover rounded-t-lg" />
                  )}
                  <CardContent>
                    <Badge variant="info">{article.category}</Badge>
                    <h3 className="font-bold mt-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.viewCount}</span>
                      {article.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.publishedAt).toLocaleDateString("fa-IR")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">مقاله‌ای یافت نشد</div>
        )}
      </div>
    </div>
  );
}
