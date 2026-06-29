"use client";

import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@pixel/ui";
import { User, Settings, LogOut, Loader2, Award, MapPin, Phone } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const me = trpc.auth.me.useQuery();
  const farmerProfile = trpc.farmer.getMyProfile.useQuery(undefined, { enabled: me.data?.role === "farmer" });
  const companyProfile = trpc.company.getMyProfile.useQuery(undefined, { enabled: me.data?.role === "company" });
  const supplierProfile = trpc.supplier.getMyProfile.useQuery(undefined, { enabled: me.data?.role === "supplier" });

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("pixel_token")) {
      router.push("/login");
    }
  }, [router]);

  if (me.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-700" />
      </div>
    );
  }

  if (!me.data) {
    router.push("/login");
    return null;
  }

  const user = me.data;
  const profile = user.role === "farmer" ? farmerProfile.data : user.role === "company" ? companyProfile.data : user.role === "supplier" ? supplierProfile.data : null;

  const roleLabels: Record<string, string> = {
    farmer: "کشاورز",
    supplier: "تأمین‌کننده",
    company: "شرکت/تعاونی",
    admin: "مدیر",
    moderator: "ناظر",
  };

  function handleLogout() {
    localStorage.removeItem("pixel_token");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-700">پیکسل</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.firstName} {user.lastName}</span>
            <Badge variant="success">{roleLabels[user.role]}</Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-green-700" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">{user.firstName} {user.lastName}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.status === "active" ? "success" : "warning"}>
                    {user.status === "active" ? "فعال" : user.status === "pending" ? "در انتظار" : user.status === "suspended" ? "معلق" : "رد شده"}
                  </Badge>
                  {profile && "verifiedAt" in profile && profile.verifiedAt && (
                    <Badge variant="info">تأییدشده</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Details */}
        {profile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>اطلاعات پروفایل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {"farmType" in profile && profile.farmType && (
                  <div>
                    <span className="text-gray-500">نوع کشاورزی:</span>
                    <span className="font-medium mr-2">{profile.farmType}</span>
                  </div>
                )}
                {"companyName" in profile && profile.companyName && (
                  <div>
                    <span className="text-gray-500">نام شرکت:</span>
                    <span className="font-medium mr-2">{profile.companyName}</span>
                  </div>
                )}
                {"supplierName" in profile && profile.supplierName && (
                  <div>
                    <span className="text-gray-500">نام تأمین‌کننده:</span>
                    <span className="font-medium mr-2">{profile.supplierName}</span>
                  </div>
                )}
                {profile.province && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">استان:</span>
                    <span className="font-medium">{profile.province}</span>
                  </div>
                )}
                {profile.county && (
                  <div>
                    <span className="text-gray-500">شهرستان:</span>
                    <span className="font-medium mr-2">{profile.county}</span>
                  </div>
                )}
                {"creditScore" in profile && (
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-500">امتیاز اعتباری:</span>
                    <span className="font-medium">{profile.creditScore}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/profile/edit")}>
            <Settings className="w-4 h-4" />
            ویرایش پروفایل
          </Button>
          {user.role === "admin" || user.role === "moderator" ? (
            <Button variant="outline" onClick={() => router.push("/admin")}>
              پنل مدیریت
            </Button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
