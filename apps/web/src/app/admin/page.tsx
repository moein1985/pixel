"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Select, Label } from "@pixel/ui";
import { Loader2, Users, Tractor, Truck, Building2, CheckCircle, Clock, Shield } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"stats" | "users" | "verify">("stats");
  const [userFilter, setUserFilter] = useState<{ role?: string; status?: string; page: number }>({ page: 1 });

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("pixel_token")) {
      router.push("/login");
    }
  }, [router]);

  const stats = trpc.admin.getStats.useQuery();
  const users = trpc.admin.listUsers.useQuery(userFilter);
  const verifyMutation = trpc.admin.verifyProfile.useMutation();
  const statusMutation = trpc.admin.updateUserStatus.useMutation();

  if (stats.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-700" /></div>;
  }

  const s = stats.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-700">پنل مدیریت پیکسل</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>بازگشت</Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={tab === "stats" ? "default" : "outline"} size="sm" onClick={() => setTab("stats")}>آمار</Button>
          <Button variant={tab === "users" ? "default" : "outline"} size="sm" onClick={() => setTab("users")}>کاربران</Button>
          <Button variant={tab === "verify" ? "default" : "outline"} size="sm" onClick={() => setTab("verify")}>تأیید پروفایل</Button>
        </div>

        {tab === "stats" && s && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="کل کاربران" value={s.totalUsers} color="bg-blue-500" />
            <StatCard icon={Tractor} label="کشاورزان" value={s.totalFarmers} color="bg-green-600" />
            <StatCard icon={Truck} label="تأمین‌کنندگان" value={s.totalSuppliers} color="bg-orange-500" />
            <StatCard icon={Building2} label="شرکت‌ها" value={s.totalCompanies} color="bg-purple-500" />
            <StatCard icon={CheckCircle} label="تأییدشده" value={s.verifiedFarmers + s.verifiedSuppliers + s.verifiedCompanies} color="bg-teal-600" />
            <StatCard icon={Clock} label="در انتظار تأیید" value={s.pendingVerifications} color="bg-yellow-500" />
            <StatCard icon={Shield} label="کاربران فعال" value={s.totalUsers} color="bg-indigo-500" />
          </div>
        )}

        {tab === "users" && (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-4">
              <div className="flex-1">
                <Label>نقش</Label>
                <Select value={userFilter.role ?? ""} onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value || undefined, page: 1 })}>
                  <option value="">همه</option>
                  <option value="admin">مدیر</option>
                  <option value="farmer">کشاورز</option>
                  <option value="supplier">تأمین‌کننده</option>
                  <option value="company">شرکت</option>
                  <option value="moderator">ناظر</option>
                </Select>
              </div>
              <div className="flex-1">
                <Label>وضعیت</Label>
                <Select value={userFilter.status ?? ""} onChange={(e) => setUserFilter({ ...userFilter, status: e.target.value || undefined, page: 1 })}>
                  <option value="">همه</option>
                  <option value="pending">در انتظار</option>
                  <option value="active">فعال</option>
                  <option value="suspended">معلق</option>
                  <option value="rejected">رد شده</option>
                </Select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-right p-3">نام</th>
                    <th className="text-right p-3">موبایل</th>
                    <th className="text-right p-3">نقش</th>
                    <th className="text-right p-3">وضعیت</th>
                    <th className="text-right p-3">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data?.items.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-3">{u.firstName} {u.lastName}</td>
                      <td className="p-3" dir="ltr">{u.phone}</td>
                      <td className="p-3"><Badge variant="default">{u.role}</Badge></td>
                      <td className="p-3"><Badge variant={u.status === "active" ? "success" : u.status === "suspended" ? "error" : "warning"}>{u.status}</Badge></td>
                      <td className="p-3">
                        {u.status !== "active" && (
                          <Button size="sm" variant="outline" onClick={async () => {
                            await statusMutation.mutateAsync({ userId: u.id, status: "active" });
                            users.refetch();
                          }}>فعال‌سازی</Button>
                        )}
                        {u.status === "active" && (
                          <Button size="sm" variant="destructive" onClick={async () => {
                            await statusMutation.mutateAsync({ userId: u.id, status: "suspended" });
                            users.refetch();
                          }}>تعلیق</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "verify" && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>سیستم تأیید پروفایل در فاز بعدی کامل می‌شود</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </CardContent>
    </Card>
  );
}
