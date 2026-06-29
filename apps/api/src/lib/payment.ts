export interface PaymentResult {
  redirectUrl: string;
  authority: string;
}

export interface PaymentVerification {
  success: boolean;
  refId?: string;
}

export async function createPayment(amount: number, callbackUrl: string, description: string): Promise<PaymentResult> {
  if (process.env.NODE_ENV !== "production" || !process.env.PAYMENT_GATEWAY) {
    const authority = `dev-${Date.now()}`;
    return {
      redirectUrl: `${process.env.API_URL ?? "http://localhost:4000"}/payment/callback?Authority=${authority}&Status=OK`,
      authority,
    };
  }

  const gateway = process.env.PAYMENT_GATEWAY!;
  const merchantId = process.env.PAYMENT_MERCHANT_ID!;

  if (gateway === "zarinpal") {
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant_id: merchantId, amount: amount * 10, callback_url: callbackUrl, description }),
    });
    const data = await res.json();
    return {
      redirectUrl: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`,
      authority: data.data.authority,
    };
  }

  const authority = `prod-${Date.now()}`;
  return { redirectUrl: callbackUrl, authority };
}

export async function verifyPayment(authority: string, amount: number): Promise<PaymentVerification> {
  if (process.env.NODE_ENV !== "production" || !process.env.PAYMENT_GATEWAY) {
    return { success: true, refId: `dev-ref-${Date.now()}` };
  }

  const gateway = process.env.PAYMENT_GATEWAY!;
  const merchantId = process.env.PAYMENT_MERCHANT_ID!;

  if (gateway === "zarinpal") {
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant_id: merchantId, amount: amount * 10, authority }),
    });
    const data = await res.json();
    if (data.data?.code === 100) return { success: true, refId: String(data.data.ref_id) };
    return { success: false };
  }

  return { success: true, refId: `prod-ref-${Date.now()}` };
}
