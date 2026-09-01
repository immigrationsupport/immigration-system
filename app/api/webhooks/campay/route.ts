import { NextRequest, NextResponse } from "next/server";
import { confirmCampayPayment } from "@/lib/subscription-payments";

// CamPay webhook / callback. Configure this exact URL — e.g.
// https://<your-vercel-app>.vercel.app/api/webhooks/campay — in the
// "Callback URL" field under your CamPay app's WEBHOOK section, with the
// method set to POST (not the GET default shown in the dashboard).
//
// We do NOT trust the status in this payload — CamPay's docs don't clearly
// document a signature scheme we could verify here, so instead we just use
// this call as a trigger to re-fetch the authoritative status directly
// from CamPay via confirmCampayPayment(). Worst case if this webhook were
// spoofed: we make one extra read-only API call to CamPay for a reference
// that either doesn't exist or isn't ours, and no state changes.
export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const reference = body?.reference;
    if (!reference) {
        return NextResponse.json({ received: true });
    }

    try {
        await confirmCampayPayment(String(reference));
    } catch (e) {
        console.error("CamPay webhook processing error:", e);
        // Still return 200 so CamPay doesn't hammer us with retries for a
        // transient error on our side after we've logged it; the
        // redirect-back page acts as a fallback confirmation path either way.
    }

    return NextResponse.json({ received: true });
}

// Some CamPay dashboards default the callback method to GET — support it
// too so it works regardless of which method ends up configured.
export async function GET(req: NextRequest) {
    const reference = req.nextUrl.searchParams.get("reference");
    if (!reference) {
        return NextResponse.json({ received: true });
    }

    try {
        await confirmCampayPayment(reference);
    } catch (e) {
        console.error("CamPay webhook processing error:", e);
    }

    return NextResponse.json({ received: true });
}