// CamPay API — https://documenter.getpostman.com/view/2391374/T1LV8PVA
//
// Two base URLs: https://demo.campay.net for sandbox testing,
// https://www.campay.net for production. Set CAMPAY_BASE_URL accordingly.
//
// NOTE ON WEBHOOK VERIFICATION: CamPay's public docs don't clearly document
// a signature header for their webhook callback (unlike Flutterwave's
// verif-hash). Rather than guess at a scheme and risk either rejecting
// legitimate webhooks or — worse — trusting a forged one, we treat the
// webhook purely as a "something changed, go check" ping: we take the
// transaction reference out of it and re-fetch the authoritative status
// directly from CamPay's own /transaction/ endpoint using our permanent
// token, exactly like verifyTransaction() below. We never trust a status
// field coming from the webhook body itself.

const CAMPAY_BASE_URL = process.env.CAMPAY_BASE_URL || "https://demo.campay.net";

function getToken(): string {
    const token = process.env.CAMPAY_PERMANENT_TOKEN;
    if (!token) throw new Error("CAMPAY_PERMANENT_TOKEN is not set.");
    return token;
}

export interface InitializePaymentParams {
    txRef: string;
    amount: number;
    currency: string;
    redirectUrl: string;
    customerEmail: string;
    customerName: string;
    title: string;
    meta?: Record<string, string>;
}

export interface InitializePaymentResult {
    ok: boolean;
    paymentUrl?: string;
    // CamPay's own transaction reference — distinct from our txRef. Needed
    // to check status later via GET /api/transaction/{reference}/.
    gatewayReference?: string;
    error?: string;
}

/**
 * Creates a CamPay hosted "Payment Link" checkout and returns the URL to
 * redirect the payer to. CamPay presents the payer with MTN/Orange mobile
 * money and card options on that page (payment_options: "MOMO,CARD").
 */
export async function initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    try {
        const [firstName, ...rest] = params.customerName.trim().split(" ");
        const lastName = rest.join(" ") || firstName;

        const res = await fetch(`${CAMPAY_BASE_URL}/api/get_payment_link/`, {
            method: "POST",
            headers: {
                Authorization: `Token ${getToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: String(params.amount),
                currency: params.currency,
                description: params.title,
                external_reference: params.txRef,
                first_name: firstName,
                last_name: lastName,
                email: params.customerEmail,
                redirect_url: params.redirectUrl,
                failure_redirect_url: params.redirectUrl,
                payment_options: "MOMO,CARD",
            }),
        });

        const data = await res.json();

        if (!res.ok || data.status !== "SUCCESSFUL" || !data.link) {
            return { ok: false, error: data.message || data.detail || "Failed to start the payment." };
        }

        return { ok: true, paymentUrl: data.link as string, gatewayReference: data.reference as string };
    } catch (e: any) {
        console.error("CamPay initializePayment error:", e);
        return { ok: false, error: "Could not reach the payment provider." };
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

/**
 * Re-fetches a transaction directly from CamPay by ITS OWN reference (the
 * one returned from initializePayment, not our txRef). This is the call
 * that actually confirms a charge happened — never trust the webhook body
 * or a redirect query param alone.
 */
export async function verifyTransaction(gatewayReference: string): Promise<VerifyTransactionResult> {
    try {
        const res = await fetch(`${CAMPAY_BASE_URL}/api/transaction/${gatewayReference}/`, {
            headers: { Authorization: `Token ${getToken()}` },
        });

        const data = await res.json();

        if (!res.ok) {
            return { ok: false, successful: false, error: data.message || data.detail || "Verification failed." };
        }

        return {
            ok: true,
            successful: data.status === "SUCCESSFUL",
            pending: data.status === "PENDING",
            amount: data.amount ? Number(data.amount) : undefined,
            currency: data.currency,
            txRef: data.external_reference,
            transactionId: data.reference,
            paymentType: data.operator,
        };
    } catch (e: any) {
        console.error("CamPay verifyTransaction error:", e);
        return { ok: false, successful: false, error: "Could not reach the payment provider." };
    }
}

/** Best-effort mapping of CamPay's "operator" field to our own enum. */
export function mapPaymentType(operator?: string): "MTN_MOBILE_MONEY" | "ORANGE_MONEY" | "CARD" {
    const t = (operator || "").toLowerCase();
    if (t.includes("mtn")) return "MTN_MOBILE_MONEY";
    if (t.includes("orange")) return "ORANGE_MONEY";
    return "CARD";
}