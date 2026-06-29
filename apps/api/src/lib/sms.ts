import { OTP_CONFIG } from "@pixel/shared";

export function generateOtpCode(): string {
  if (process.env.NODE_ENV !== "production") {
    return OTP_CONFIG.DEV_MODE_CODE;
  }
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < OTP_CONFIG.CODE_LENGTH; i++) {
    code += digits[Math.floor(Math.random() * 10)];
  }
  return code;
}

export async function sendSms(phone: string, message: string): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[SMS DEV] → ${phone}: ${message}`);
    return true;
  }

  const provider = process.env.SMS_PROVIDER ?? "kavenegar";
  const apiKey = process.env.SMS_API_KEY;
  const sender = process.env.SMS_SENDER;

  if (!apiKey) {
    console.error("[SMS] SMS_API_KEY not set");
    return false;
  }

  try {
    if (provider === "kavenegar") {
      const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json?receptor=${phone}&sender=${sender}&message=${encodeURIComponent(message)}`;
      const res = await fetch(url);
      return res.ok;
    }
    // Add other providers here
    console.error(`[SMS] Unknown provider: ${provider}`);
    return false;
  } catch (err) {
    console.error("[SMS] Send failed:", err);
    return false;
  }
}

export async function sendOtpSms(phone: string, code: string): Promise<boolean> {
  const message = `کد تأیید پیکسل: ${code}\nاین کد تا ${OTP_CONFIG.EXPIRY_MINUTES} دقیقه معتبر است.`;
  return sendSms(phone, message);
}
