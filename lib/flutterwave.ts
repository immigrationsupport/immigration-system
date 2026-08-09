const FLW_BASE_URL = "https://api.flutterwave.com/v3";

function getSecretKey(): string {
    const key = process.env.FLW_SECRET_KEY;
    if (!key) throw new Error("FLW_SECRET_KEY is not set.");
    return key;
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
    error?: string;
}

/**
 * Creates a Flutterwave "Standard" checkout session and returns the hosted
 * payment link to redirect the payer to. Flutterwave itself presents the
 * available payment options (card, MTN/Orange mobile money, etc.) for the
 * given currency.
 */
export async function initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    try {
        const res = await fetch(`${FLW_BASE_URL}/payments`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getSecretKey()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tx_ref: params.txRef,
                amount: params.amount,
                currency: params.currency,
                redirect_url: params.redirectUrl,
                payment_options: "card,mobilemoneyfranco,ussd",
                customer: {
                    email: params.customerEmail,
                    name: params.customerName,
                },
                customizations: {
                    title: params.title,
                },
                meta: params.meta,
            }),
        });

        const data = await res.json();

        if (!res.ok || data.status !== "success" || !data.data?.link) {
            return { ok: false, error: data.message || "Failed to start the payment." };
        }

        return { ok: true, paymentUrl: data.data.link as string };
    } catch (e: any) {
        console.error("Flutterwave initializePayment error:", e);
        return { ok: false, error: "Could not reach the payment provider." };
    }
}

export interface VerifyTransactionResult {
    ok: boolean;
    successful: boolean;
    amount?: number;
    currency?: string;
    txRef?: string;
    transactionId?: string;
    paymentType?: string;
    error?: string;
}

/**
 * Re-fetches a transaction directly from Flutterwave by its numeric id.
 * Never trust amount/status coming from the client or the webhook body
 * alone — this is the call that actually confirms a charge happened.
 */
export async function verifyTransaction(transactionId: string): Promise<VerifyTransactionResult> {
    try {
        const res = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
            headers: { Authorization: `Bearer ${getSecretKey()}` },
        });

        const data = await res.json();

        if (!res.ok || data.status !== "success") {
            return { ok: false, successful: false, error: data.message || "Verification failed." };
        }

        const tx = data.data;

        return {
            ok: true,
            successful: tx.status === "successful",
            amount: tx.amount,
            currency: tx.currency,
            txRef: tx.tx_ref,
            transactionId: String(tx.id),
            paymentType: tx.payment_type,
        };
    } catch (e: any) {
        console.error("Flutterwave verifyTransaction error:", e);
        return { ok: false, successful: false, error: "Could not reach the payment provider." };
    }
}

/** Best-effort mapping of Flutterwave's payment_type to our own enum. */
export function mapPaymentType(paymentType?: string): "MTN_MOBILE_MONEY" | "ORANGE_MONEY" | "CARD" {
    const t = (paymentType || "").toLowerCase();
    if (t.includes("mtn")) return "MTN_MOBILE_MONEY";
    if (t.includes("orange")) return "ORANGE_MONEY";
    if (t.includes("mobilemoney")) return "MTN_MOBILE_MONEY"; // best guess when the network isn't distinguished
    return "CARD";
}