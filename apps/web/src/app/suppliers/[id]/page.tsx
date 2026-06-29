"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, Badge } from "@pixel/ui";
import { MapPin, Award, Loader2, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SupplierDetailPage() {
  const params = useParams();
  const supplierId = params.id as string;
  const query = trpc.supplier.getProfile.useQuery({ supplierId });

  if (query.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-700" /></div>;
  }
  if (!query.data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">پروفایل یافت نشد</div>;
  }

  const s = query.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/suppliers" className="text-green-700 text-sm inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> بازگشت به لیست
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                {s.supplierName?.[0] ?? "؟"}
              </div>
              <div>
                <h2 className="text-xl font-bold">{s.supplierName}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {s.verifiedAt && <Badge variant="success">تأییدشده</Badge>}
                  {s.rating && s.rating !== "0" && (
                    <span className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 text-yellow-400" />{s.rating}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {s.province && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-gray-500">استان:</span><span className="font-medium">{s.province}</span></div>}
              {s.county && <div><span className="text-gray-500">شهرستان:</span><span className="font-medium mr-2">{s.county}</span></div>}
              {s.phone && <div><span className="text-gray-500">تلفن:</span><span className="font-medium mr-2" dir="ltr">{s.phone}</span></div>}
              {s.creditScore > 0 && <div className="flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /><span className="text-gray-500">امتیاز:</span><span className="font-medium">{s.creditScore}</span></div>}
            </div>
            {s.supplyCategories && s.supplyCategories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">دسته‌بندی‌های تأمین</h4>
                <div className="flex flex-wrap gap-2">{s.supplyCategories.map((c, i) => <Badge key={i} variant="default">{c}</Badge>)}</div>
              </div>
            )}
            {s.description && <div><h4 className="text-sm font-medium text-gray-700 mb-2">معرفی</h4><p className="text-sm text-gray-600 leading-relaxed">{s.description}</p></div>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
