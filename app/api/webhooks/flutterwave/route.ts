import { NextRequest, NextResponse } from "next/server";
import { confirmFlutterwavePayment } from "@/lib/subscription-payments";

// Flutterwave webhooks: https://developer.flutterwave.com/docs/integration-guides/webhooks
// Configure this URL in your Flutterwave dashboard (Settings -> Webhooks) and
// set the same secret there and in FLW_SECRET_HASH.
export async function POST(req: NextRequest) {
    const signature = req.headers.get("verif-hash");
    const expected = process.env.FLW_SECRET_HASH;

    if (!expected || !signature || signature !== expected) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // We only care about completed charges; ignore everything else (transfers,
    // subscription-cancelled events from Flutterwave's own subscriptions API, etc.)
    if (body?.event !== "charge.completed" || !body?.data?.id) {
        return NextResponse.json({ received: true });
    }

    try {
        await confirmFlutterwavePayment(String(body.data.id), body.data.tx_ref);
    } catch (e) {
        console.error("Flutterwave webhook processing error:", e);
        // Still return 200 so Flutterwave doesn't hammer us with retries for a
        // transient error on our side after we've logged it; the redirect-back
        // page acts as a fallback confirmation path either way.
    }

    return NextResponse.json({ received: true });
}