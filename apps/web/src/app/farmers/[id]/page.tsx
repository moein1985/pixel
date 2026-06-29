"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@pixel/ui";
import { MapPin, Award, Phone, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FarmerDetailPage() {
  const params = useParams();
  const farmerId = params.id as string;
  const query = trpc.farmer.getProfile.useQuery({ farmerId });

  if (query.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-700" />
      </div>
    );
  }

  if (!query.data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        پروفایل یافت نشد
      </div>
    );
  }

  const farmer = query.data;
  const farmTypeLabels: Record<string, string> = {
    dryland: "دیمی", irrigated: "آبی", greenhouse: "گلخانه‌ای",
    orchard: "باغی", livestock: "دامداری", poultry: "طیور",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/farmers" className="text-green-700 text-sm inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            بازگشت به لیست
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold">
                {farmer.firstName?.[0] ?? "؟"}
              </div>
              <div>
                <CardTitle className="text-xl">{farmer.firstName} {farmer.lastName}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {farmer.farmType && <Badge variant="info">{farmTypeLabels[farmer.farmType] ?? farmer.farmType}</Badge>}
                  {farmer.verifiedAt && <Badge variant="success">تأییدشده</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {farmer.province && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">استان:</span>
                  <span className="font-medium">{farmer.province}</span>
                </div>
              )}
              {farmer.county && (
                <div>
                  <span className="text-gray-500">شهرستان:</span>
                  <span className="font-medium mr-2">{farmer.county}</span>
                </div>
              )}
              {farmer.village && (
                <div>
                  <span className="text-gray-500">روستا:</span>
                  <span className="font-medium mr-2">{farmer.village}</span>
                </div>
              )}
              {farmer.experienceYears != null && (
                <div>
                  <span className="text-gray-500">سابقه:</span>
                  <span className="font-medium mr-2">{farmer.experienceYears} سال</span>
                </div>
              )}
              {farmer.totalAreaHectares && (
                <div>
                  <span className="text-gray-500">مساحت:</span>
                  <span className="font-medium mr-2">{farmer.totalAreaHectares} هکتار</span>
                </div>
              )}
              {farmer.creditScore > 0 && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-500">امتیاز اعتباری:</span>
                  <span className="font-medium">{farmer.creditScore}</span>
                </div>
              )}
            </div>

            {farmer.mainCrops && farmer.mainCrops.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">محصولات اصلی</h4>
                <div className="flex flex-wrap gap-2">
                  {farmer.mainCrops.map((crop, i) => (
                    <Badge key={i} variant="default">{crop}</Badge>
                  ))}
                </div>
              </div>
            )}

            {farmer.certifications && farmer.certifications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">گواهی‌ها</h4>
                <div className="flex flex-wrap gap-2">
                  {farmer.certifications.map((cert, i) => (
                    <Badge key={i} variant="success">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}

            {farmer.bio && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">درباره</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{farmer.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
