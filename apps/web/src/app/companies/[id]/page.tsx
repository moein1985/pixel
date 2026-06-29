"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, Badge } from "@pixel/ui";
import { MapPin, Award, Loader2, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const companyTypeLabels: Record<string, string> = {
  cooperative: "تعاونی", private: "خصوصی", industrial: "صنعتی", governmental: "دولتی",
};

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  const query = trpc.company.getProfile.useQuery({ companyId });

  if (query.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-700" /></div>;
  }
  if (!query.data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">پروفایل یافت نشد</div>;
  }

  const c = query.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/companies" className="text-green-700 text-sm inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> بازگشت به لیست
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-2xl font-bold">
                {c.companyName?.[0] ?? "؟"}
              </div>
              <div>
                <h2 className="text-xl font-bold">{c.companyName}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {c.companyType && <Badge variant="info">{companyTypeLabels[c.companyType] ?? c.companyType}</Badge>}
                  {c.verifiedAt && <Badge variant="success">تأییدشده</Badge>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {c.province && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-gray-500">استان:</span><span className="font-medium">{c.province}</span></div>}
              {c.county && <div><span className="text-gray-500">شهرستان:</span><span className="font-medium mr-2">{c.county}</span></div>}
              {c.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="font-medium" dir="ltr">{c.phone}</span></div>}
              {c.creditScore > 0 && <div className="flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /><span className="text-gray-500">امتیاز:</span><span className="font-medium">{c.creditScore}</span></div>}
            </div>
            {c.address && <div><h4 className="text-sm font-medium text-gray-700 mb-1">آدرس</h4><p className="text-sm text-gray-600">{c.address}</p></div>}
            {c.productionLines && c.productionLines.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">خطوط تولید</h4>
                <div className="flex flex-wrap gap-2">{c.productionLines.map((p, i) => <Badge key={i} variant="default">{p}</Badge>)}</div>
              </div>
            )}
            {c.certifications && c.certifications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">گواهی‌ها</h4>
                <div className="flex flex-wrap gap-2">{c.certifications.map((cert, i) => <Badge key={i} variant="success">{cert}</Badge>)}</div>
              </div>
            )}
            {c.description && <div><h4 className="text-sm font-medium text-gray-700 mb-1">معرفی</h4><p className="text-sm text-gray-600 leading-relaxed">{c.description}</p></div>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
