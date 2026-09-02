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
    try {
      data = JSON.parse(text);
    } catch {
      /* handled below */
    }

    if (!res.ok) {
      console.error("CamPay collect failed:", res.status, text.slice(0, 1000));
      return {
        ok: false,
        error: data.message || data.detail || data.error || "CamPay could not start the payment.",
      };
    }

    const reference =
      data.reference ||
      data.transaction_id ||
      data.transactionId ||
      Object.values(data)[0];

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
    try {
      data = JSON.parse(text);
    } catch {
      /* handled below */
    }

    if (!res.ok || !data.link) {
      console.error("CamPay payment link failed:", res.status, text.slice(0, 1000));
      return {
        ok: false,
        error: data.message || data.detail || data.error || "Could not create the card checkout.",
      };
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
  status?: string;

  // Raw CamPay failure information, kept so the application can
  // turn gateway errors into useful customer-facing messages.
  reason?: string;
  reasonCode?: string;

  error?: string;
}

function readCamPayReason(data: any): { reason?: string; reasonCode?: string } {
  const candidates = [
    data?.reason_code,
    data?.reasonCode,
    data?.reason,
    data?.failure_reason,
    data?.failureReason,
    data?.failure_message,
    data?.failureMessage,
    data?.message,
    data?.detail,
    data?.description,
  ];

  for (const value of candidates) {
    if (value == null || value === "") continue;

    if (typeof value === "object") {
      const code =
        value.code ||
        value.reason_code ||
        value.reasonCode ||
        value.reason ||
        value.status_code;

      const message =
        value.message ||
        value.detail ||
        value.description ||
        value.reason;

      if (code || message) {
        return {
          reason: message ? String(message) : code ? String(code) : undefined,
          reasonCode: code ? String(code) : undefined,
        };
      }
    }

    const text = String(value).trim();
    if (text) {
      return {
        reason: text,
        // A CamPay code is normally uppercase with underscores.
        reasonCode: /^[A-Z0-9_]+$/.test(text) ? text : undefined,
      };
    }
  }

  return {};
}

export function getCamPayFailureMessage(reason?: string): string {
  const value = String(reason || "").trim();
  const code = value.toUpperCase();

  if (
    code.includes("LOW_BALANCE_OR_PAYEE_LIMIT_REACHED_OR_NOT_ALLOWED") ||
    code.includes("LOW_BALANCE") ||
    code.includes("INSUFFICIENT_BALANCE")
  ) {
    return "Your payment could not be completed because your Mobile Money balance is insufficient or a transaction limit has been reached. Please check your balance and try again.";
  }

  if (
    code.includes("USER_CANCELED") ||
    code.includes("USER_CANCELLED") ||
    code.includes("CANCELLED_BY_USER") ||
    code.includes("CANCELED_BY_USER")
  ) {
    return "You cancelled the payment. No subscription change was made. You can try again when you are ready.";
  }

  if (
    code.includes("TIMEOUT") ||
    code.includes("TIMED_OUT") ||
    code.includes("EXPIRED")
  ) {
    return "The payment confirmation timed out. Please try the payment again.";
  }

  if (
    code.includes("INVALID_MSISDN") ||
    code.includes("INVALID_PHONE") ||
    code.includes("INVALID_MOBILE")
  ) {
    return "The Mobile Money phone number is invalid. Please check the number and try again.";
  }

  if (
    code.includes("USER_NOT_REGISTERED") ||
    code.includes("NOT_REGISTERED")
  ) {
    return "This phone number is not registered for the selected Mobile Money service. Please use another number.";
  }

  if (code.includes("LIMIT_REACHED") || code.includes("LIMIT")) {
    return "The transaction could not be completed because a Mobile Money transaction limit was reached. Please try another payment method or try again later.";
  }

  // Do not expose technical CamPay codes to customers.
  if (!value || /^[A-Z0-9_]+$/.test(value)) {
    return "Your payment could not be completed. Please check your Mobile Money account and try again.";
  }

  return `Your payment could not be completed. ${value}`;
}

export async function verifyTransaction(gatewayReference: string): Promise<VerifyTransactionResult> {
  try {
    const res = await fetch(
      `${CAMPAY_BASE_URL}/api/transaction/${encodeURIComponent(gatewayReference)}/`,
      {
        headers: { Authorization: `Token ${getToken()}` },
        cache: "no-store",
      }
    );

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      /* handled below */
    }

    if (!res.ok) {
      return {
        ok: false,
        successful: false,
        error: data.message || data.detail || "Verification failed.",
      };
    }

    const status = String(data.status || "").toUpperCase();
    const failure = readCamPayReason(data);

    return {
      ok: true,
      successful: status === "SUCCESSFUL" || status === "SUCCESS",
      pending: status === "PENDING" || status === "PROCESSING",
      amount: data.amount != null ? Number(data.amount) : undefined,
      currency: data.currency,
      txRef: data.external_reference,
      transactionId: data.reference || data.transaction_id,
      paymentType: data.operator || data.payment_type,
      status,
      reason: failure.reason,
      reasonCode: failure.reasonCode,
    };
  } catch (error) {
    console.error("CamPay verification error:", error);
    return { ok: false, successful: false, error: "Could not reach CamPay." };
  }
}

export function mapPaymentType(
  operator?: string
): "MTN_MOBILE_MONEY" | "ORANGE_MONEY" | "CARD" {
  const value = (operator || "").toLowerCase();
  if (value.includes("mtn")) return "MTN_MOBILE_MONEY";
  if (value.includes("orange")) return "ORANGE_MONEY";
  return "CARD";
}
