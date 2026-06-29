"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Label } from "@pixel/ui";
import { UserPlus, Loader2, Tractor, Building2, Truck } from "lucide-react";

const ROLES = [
  { value: "farmer" as const, label: "کشاورز", icon: Tractor, desc: "تولیدکننده محصول کشاورزی" },
  { value: "supplier" as const, label: "تأمین‌کننده", icon: Truck, desc: "عرضه‌کننده نهاده و تجهیزات" },
  { value: "company" as const, label: "شرکت/تعاونی", icon: Building2, desc: "فرآوری، بازرگانی و صنعت" },
];

function RegisterContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [role, setRole] = useState<"farmer" | "supplier" | "company">("farmer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = trpc.auth.register.useMutation();

  async function handleRegister() {
    setError("");
    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل نامعتبر");
      return;
    }
    if (firstName.length < 2 || lastName.length < 2) {
      setError("نام و نام خانوادگی حداقل ۲ کاراکتر");
      return;
    }
    setLoading(true);
    try {
      const res = await register.mutateAsync({
        phone,
        role,
        firstName,
        lastName,
        nationalCode: nationalCode || undefined,
      });
      if (!res.success) {
        setError(res.message);
        return;
      }
      if (res.token) {
        localStorage.setItem("pixel_token", res.token);
        router.push("/profile");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ثبت‌نام در پیکسل</h1>
          <p className="text-gray-500 mt-2 text-sm">نقش خود را انتخاب و اطلاعات را تکمیل کنید</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <Label>انتخاب نقش</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      role === r.value
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${role === r.value ? "text-green-700" : "text-gray-400"}`} />
                    <span className={`text-sm font-medium ${role === r.value ? "text-green-700" : "text-gray-600"}`}>
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {ROLES.find((r) => r.value === role)?.desc}
            </p>
          </div>

          <div>
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="text-center"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">نام</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="نام"
              />
            </div>
            <div>
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="نام خانوادگی"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nationalCode">کد ملی (اختیاری)</Label>
            <Input
              id="nationalCode"
              value={nationalCode}
              onChange={(e) => setNationalCode(e.target.value)}
              placeholder="XXXXXXXXXX"
              dir="ltr"
              className="text-center"
              maxLength={10}
            />
          </div>

          <Button className="w-full" disabled={loading} onClick={handleRegister}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ثبت‌نام و ورود"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-700" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
