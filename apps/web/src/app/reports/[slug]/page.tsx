"use client";

import { Card, CardContent, Badge } from "@pixel/ui";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";

export default function ReportDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: report, isLoading } = trpc.content.reportGet.useQuery({ slug });

  if (isLoading) return <div className="text-center py-12 text-gray-500">در حال بارگذاری...</div>;
  if (!report) return <div className="text-center py-12 text-gray-500">گزارش یافت نشد</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <Link href="/reports"><Badge variant="info">بازگشت به گزارش‌ها</Badge></Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-8">
        {report.coverImageUrl && (
          <img src={report.coverImageUrl} alt={report.title} className="w-full h-64 object-cover rounded-lg mb-6" />
        )}
        <Badge variant="success">{report.reportType}</Badge>
        <h1 className="text-3xl font-bold mt-3 mb-4">{report.title}</h1>
        <p className="text-lg text-gray-600 mb-6">{report.summary}</p>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          {report.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(report.publishedAt).toLocaleDateString("fa-IR")}
            </span>
          )}
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {report.viewCount} بازدید</span>
        </div>
        <div className="prose prose-lg max-w-none text-gray-700 leading-8" dangerouslySetInnerHTML={{ __html: report.content }} />
        {report.dataCharts && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">داده‌های نموداری</h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">{JSON.stringify(report.dataCharts, null, 2)}</pre>
          </div>
        )}
      </article>
    </div>
  );
}
