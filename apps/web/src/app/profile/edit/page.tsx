"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Select } from "@pixel/ui";
import { Loader2, Save, ArrowRight } from "lucide-react";
import { PROVINCES } from "@pixel/shared";

export default function EditProfilePage() {
  const router = useRouter();
  const me = trpc.auth.me.useQuery();
  const farmerProfile = trpc.farmer.getMyProfile.useQuery(undefined, { enabled: me.data?.role === "farmer" });
  const companyProfile = trpc.company.getMyProfile.useQuery(undefined, { enabled: me.data?.role === "company" });
  const supplierProfile = trpc.supplier.getMyProfile.useQuery(undefined, { enabled: me.data?.role === "supplier" });

  const updateFarmer = trpc.farmer.updateMyProfile.useMutation();
  const updateCompany = trpc.company.updateMyProfile.useMutation();
  const updateSupplier = trpc.supplier.updateMyProfile.useMutation();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("pixel_token")) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const profile = me.data?.role === "farmer" ? farmerProfile.data : me.data?.role === "company" ? companyProfile.data : me.data?.role === "supplier" ? supplierProfile.data : null;
    if (profile) {
      setFormData({
        province: profile.province ?? "",
        county: profile.county ?? "",
        bio: ("bio" in profile ? profile.bio : "") ?? "",
        description: ("description" in profile ? profile.description : "") ?? "",
        nationalCode: ("nationalCode" in profile ? profile.nationalCode : "") ?? "",
        farmType: ("farmType" in profile ? profile.farmType : "") ?? "",
        companyName: ("companyName" in profile ? profile.companyName : "") ?? "",
        supplierName: ("supplierName" in profile ? profile.supplierName : "") ?? "",
        address: ("address" in profile ? profile.address : "") ?? "",
        phone: ("phone" in profile ? profile.phone : "") ?? "",
        village: ("village" in profile ? profile.village : "") ?? "",
        totalAreaHectares: ("totalAreaHectares" in profile ? String(profile.totalAreaHectares) : "") ?? "",
        experienceYears: ("experienceYears" in profile ? String(profile.experienceYears) : "") ?? "",
      });
    }
  }, [me.data, farmerProfile.data, companyProfile.data, supplierProfile.data]);

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

  const role = me.data.role;

  function setField(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    try {
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(formData)) {
        if (v) {
          if (k === "totalAreaHectares" || k === "experienceYears") {
            data[k] = Number(v);
          } else {
            data[k] = v;
          }
        }
      }

      if (role === "farmer") {
        await updateFarmer.mutateAsync(data);
      } else if (role === "company") {
        await updateCompany.mutateAsync(data);
      } else if (role === "supplier") {
        await updateSupplier.mutateAsync(data);
      }
      setSaved(true);
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err: unknown) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Button>
          <h1 className="text-lg font-bold">ویرایش پروفایل</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {saved && (
          <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4 text-center">
            پروفایل با موفقیت ذخیره شد
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات {role === "farmer" ? "کشاورزی" : role === "company" ? "شرکت" : "تأمین‌کننده"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {role === "farmer" && (
              <>
                <div>
                  <Label htmlFor="farmType">نوع کشاورزی</Label>
                  <Select
                    id="farmType"
                    value={formData.farmType ?? ""}
                    onChange={(e) => setField("farmType", e.target.value)}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="dryland">دیمی</option>
                    <option value="irrigated">آبی</option>
                    <option value="greenhouse">گلخانه‌ای</option>
                    <option value="orchard">باغی</option>
                    <option value="livestock">دامداری</option>
                    <option value="poultry">طیور</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="village">روستا</Label>
                  <Input id="village" value={formData.village ?? ""} onChange={(e) => setField("village", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalAreaHectares">مساحت کل (هکتار)</Label>
                    <Input id="totalAreaHectares" type="number" value={formData.totalAreaHectares ?? ""} onChange={(e) => setField("totalAreaHectares", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="experienceYears">سابقه (سال)</Label>
                    <Input id="experienceYears" type="number" value={formData.experienceYears ?? ""} onChange={(e) => setField("experienceYears", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">درباره من</Label>
                  <Textarea id="bio" value={formData.bio ?? ""} onChange={(e) => setField("bio", e.target.value)} rows={3} />
                </div>
              </>
            )}

            {role === "company" && (
              <>
                <div>
                  <Label htmlFor="companyName">نام شرکت</Label>
                  <Input id="companyName" value={formData.companyName ?? ""} onChange={(e) => setField("companyName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="description">معرفی شرکت</Label>
                  <Textarea id="description" value={formData.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={3} />
                </div>
              </>
            )}

            {role === "supplier" && (
              <>
                <div>
                  <Label htmlFor="supplierName">نام تأمین‌کننده</Label>
                  <Input id="supplierName" value={formData.supplierName ?? ""} onChange={(e) => setField("supplierName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="description">معرفی</Label>
                  <Textarea id="description" value={formData.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={3} />
                </div>
              </>
            )}

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">استان</Label>
                <Select id="province" value={formData.province ?? ""} onChange={(e) => setField("province", e.target.value)}>
                  <option value="">انتخاب کنید</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="county">شهرستان</Label>
                <Input id="county" value={formData.county ?? ""} onChange={(e) => setField("county", e.target.value)} />
              </div>
            </div>

            {(role === "company" || role === "supplier") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">آدرس</Label>
                  <Input id="address" value={formData.address ?? ""} onChange={(e) => setField("address", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">تلفن</Label>
                  <Input id="phone" value={formData.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} dir="ltr" />
                </div>
              </div>
            )}

            <Button className="w-full" disabled={loading} onClick={handleSave}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> ذخیره</>}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
