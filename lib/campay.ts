// lib/campay.ts
// CamPay integration for Mobile Money collections and hosted card checkout.

const CAMPAY_BASE_URL = (process.env.CAMPAY_BASE_URL || "https://demo.campay.net").replace(/\/$/, "");

function getToken(): string {
  const token = process.env.CAMPAY_PERMANENT_TOKEN;
  if (!token) throw new Error("CAMPAY_PERMANENT_TOKEN is not set.");
  return token;
}

export interface CollectPaymentParams {
  txRef: string;
  amount: number;
  phoneNumber: string;
  description: string;
}

export interface CollectPaymentResult {
  ok: boolean;
  gatewayReference?: string;
  error?: string;
}

export async function collectMobileMoney(params: CollectPaymentParams): Promise<CollectPaymentResult> {
  try {
    const res = await fetch(`${CAMPAY_BASE_URL}/api/collect/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(params.amount),
        currency: "XAF",
        from: params.phoneNumber,
        description: params.description,
        external_reference: params.txRef,
      }),
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { /* handled below */ }

    if (!res.ok) {
      console.error("CamPay collect failed:", res.status, text.slice(0, 1000));
      return { ok: false, error: data.message || data.detail || data.error || "CamPay could not start the payment." };
    }

    const reference = data.reference || data.transaction_id || data.transactionId || Object.values(data)[0];
    if (!reference) {
      console.error("CamPay collect returned no reference:", data);
      return { ok: false, error: "CamPay started no identifiable transaction." };
    }

    return { ok: true, gatewayReference: String(reference) };
  } catch (error) {
    console.error("CamPay collect error:", error);
    return { ok: false, error: "Could not reach CamPay. Please try again." };
  }
}

export interface HostedPaymentParams {
  txRef: string;
  amount: number;
  redirectUrl: string;
  customerEmail: string;
  customerName: string;
  title: string;
}

export interface HostedPaymentResult {
  ok: boolean;
  paymentUrl?: string;
  gatewayReference?: string;
  error?: string;
}

export async function initializePayment(params: HostedPaymentParams): Promise<HostedPaymentResult> {
  try {
    const [firstName, ...rest] = params.customerName.trim().split(/\s+/);
    const lastName = rest.join(" ") || firstName || "Customer";

    const res = await fetch(`${CAMPAY_BASE_URL}/api/get_payment_link/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(params.amount),
        currency: "XAF",
        description: params.title,
        external_reference: params.txRef,
        first_name: firstName || "Customer",
        last_name: lastName,
        email: params.customerEmail,
        redirect_url: params.redirectUrl,
        failure_redirect_url: params.redirectUrl,
        payment_options: "MOMO,CARD",
      }),
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { /* handled below */ }

    if (!res.ok || !data.link) {
      console.error("CamPay payment link failed:", res.status, text.slice(0, 1000));
      return { ok: false, error: data.message || data.detail || data.error || "Could not create the card checkout." };
    }

    return {
      ok: true,
      paymentUrl: String(data.link),
      gatewayReference: data.reference ? String(data.reference) : undefined,
    };
  } catch (error) {
    console.error("CamPay payment link error:", error);
    return { ok: false, error: "Could not reach CamPay. Please try again." };
  }
}

export interface VerifyTransactionResult {
  ok: boolean;
  successful: boolean;
  pending?: boolean;
  amount?: number;
  currency?: string;
  txRef?: string;
  transactionId?: string;
  paymentType?: string;
  error?: string;
}

export async function verifyTransaction(gatewayReference: string): Promise<VerifyTransactionResult> {
  try {
    const res = await fetch(`${CAMPAY_BASE_URL}/api/transaction/${encodeURIComponent(gatewayReference)}/`, {
      headers: { Authorization: `Token ${getToken()}` },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { /* handled below */ }

    if (!res.ok) {
      return { ok: false, successful: false, error: data.message || data.detail || "Verification failed." };
    }

    const status = String(data.status || "").toUpperCase();

    return {
      ok: true,
      successful: status === "SUCCESSFUL" || status === "SUCCESS",
      pending: status === "PENDING" || status === "PROCESSING",
      amount: data.amount != null ? Number(data.amount) : undefined,
      currency: data.currency,
      txRef: data.external_reference,
      transactionId: data.reference || data.transaction_id,
      paymentType: data.operator || data.payment_type,
    };
  } catch (error) {
    console.error("CamPay verification error:", error);
    return { ok: false, successful: false, error: "Could not reach CamPay." };
  }
}

export function mapPaymentType(operator?: string): "MTN_MOBILE_MONEY" | "ORANGE_MONEY" | "CARD" {
  const value = (operator || "").toLowerCase();
  if (value.includes("mtn")) return "MTN_MOBILE_MONEY";
  if (value.includes("orange")) return "ORANGE_MONEY";
  return "CARD";
}
