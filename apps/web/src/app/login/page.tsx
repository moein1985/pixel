"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@pixel/ui";
import { Phone, KeyRound, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const requestOtp = trpc.auth.requestOtp.useMutation();
  const verifyOtp = trpc.auth.verifyOtp.useMutation();

  async function handleRequestOtp() {
    setError("");
    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد");
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp.mutateAsync({ phone });
      if (res.devCode) setDevCode(res.devCode);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("کد باید ۶ رقم باشد");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp.mutateAsync({ phone, code });
      if (!res.success) {
        setError(res.message);
        return;
      }
      if (res.needsRegistration) {
        router.push(`/register?phone=${phone}`);
        return;
      }
      if (res.token) {
        localStorage.setItem("pixel_token", res.token);
        router.push("/profile");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در تأیید کد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 rounded-full mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ورود به پیکسل</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {step === "phone" ? "شماره موبایل خود را وارد کنید" : "کد تأیید ارسال شده را وارد کنید"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4 text-center">
            {error}
          </div>
        )}

        {devCode && (
          <div className="bg-blue-50 text-blue-600 text-sm rounded-lg p-3 mb-4 text-center">
            کد تست: {devCode}
          </div>
        )}

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">شماره موبایل</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="text-center text-lg"
              />
            </div>
            <Button
              className="w-full"
              disabled={loading}
              onClick={handleRequestOtp}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ارسال کد تأیید"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">کد تأیید</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                dir="ltr"
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button
              className="w-full"
              disabled={loading}
              onClick={handleVerifyOtp}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <KeyRound className="w-4 h-4" />
                  تأیید و ورود
                </>
              )}
            </Button>
            <button
              className="w-full text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError("");
                setDevCode(null);
              }}
            >
              تغییر شماره موبایل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
