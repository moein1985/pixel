"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@pixel/ui";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: article, isLoading } = trpc.content.articleGet.useQuery({ slug });

  if (isLoading) return <div className="text-center py-12 text-gray-500">در حال بارگذاری...</div>;
  if (!article) return <div className="text-center py-12 text-gray-500">مقاله یافت نشد</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <Link href="/news"><Badge variant="info">بازگشت به اخبار</Badge></Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-8">
        {article.coverImageUrl && (
          <img src={article.coverImageUrl} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />
        )}
        <Badge variant="info">{article.category}</Badge>
        <h1 className="text-3xl font-bold mt-3 mb-4">{article.title}</h1>
        {article.excerpt && <p className="text-lg text-gray-600 mb-6">{article.excerpt}</p>}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(article.publishedAt).toLocaleDateString("fa-IR")}
            </span>
          )}
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {article.viewCount} بازدید</span>
        </div>
        <div className="prose prose-lg max-w-none text-gray-700 leading-8" dangerouslySetInnerHTML={{ __html: article.content }} />
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 flex gap-2 flex-wrap">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
