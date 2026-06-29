"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, Badge, Input, Select, Button, Label } from "@pixel/ui";
import { Search, MapPin, Award, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { PROVINCES } from "@pixel/shared";
import Link from "next/link";

export default function FarmersListPage() {
  const [page, setPage] = useState(1);
  const [province, setProvince] = useState<string | undefined>();
  const [farmType, setFarmType] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  const listQuery = trpc.farmer.list.useQuery({
    page,
    pageSize: 12,
    province,
    farmType: farmType as "dryland" | "irrigated" | "greenhouse" | "orchard" | "livestock" | "poultry" | undefined,
  });

  const searchQuery_ = trpc.farmer.search.useQuery(
    { query: searchQuery, page, pageSize: 12 },
    { enabled: searchMode && searchQuery.length > 0 }
  );

  const data = searchMode ? searchQuery_.data : listQuery.data;
  const isLoading = searchMode ? searchQuery_.isLoading : listQuery.isLoading;

  const farmTypeLabels: Record<string, string> = {
    dryland: "دیمی",
    irrigated: "آبی",
    greenhouse: "گلخانه‌ای",
    orchard: "باغی",
    livestock: "دامداری",
    poultry: "طیور",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="text-green-700 text-sm mb-2 inline-block">← بازگشت به خانه</Link>
          <h1 className="text-2xl font-bold text-gray-800">کشاورزان</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="جستجو بر اساس نام، استان، شهرستان..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchMode(e.target.value.length > 0);
                setPage(1);
              }}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>استان</Label>
              <Select
                value={province ?? ""}
                onChange={(e) => {
                  setProvince(e.target.value || undefined);
                  setPage(1);
                  setSearchMode(false);
                }}
              >
                <option value="">همه استان‌ها</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>نوع کشاورزی</Label>
              <Select
                value={farmType ?? ""}
                onChange={(e) => {
                  setFarmType(e.target.value || undefined);
                  setPage(1);
                  setSearchMode(false);
                }}
              >
                <option value="">همه انواع</option>
                {Object.entries(farmTypeLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-700" />
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((farmer) => (
                <Link key={farmer.id} href={`/farmers/${farmer.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                          {farmer.firstName?.[0] ?? "؟"}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {farmer.firstName} {farmer.lastName}
                          </h3>
                          {farmer.farmType && (
                            <Badge variant="info" >{farmTypeLabels[farmer.farmType] ?? farmer.farmType}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {farmer.province && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {farmer.province}
                          </span>
                        )}
                        {farmer.creditScore > 0 && (
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-yellow-500" />
                            {farmer.creditScore}
                          </span>
                        )}
                        {farmer.verifiedAt && (
                          <Badge variant="success">تأییدشده</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.total > data.pageSize && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                  قبلی
                </Button>
                <span className="text-sm text-gray-600">
                  صفحه {data.page} از {Math.ceil(data.total / data.pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * data.pageSize >= data.total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  بعدی
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            نتیجه‌ای یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}
