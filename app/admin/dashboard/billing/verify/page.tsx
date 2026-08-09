import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { confirmFlutterwavePayment } from "@/lib/subscription-payments";

export const dynamic = "force-dynamic";

export default async function VerifyPaymentPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }>;
}) {
    const params = await searchParams;
    const { status, tx_ref, transaction_id } = params;

    // Flutterwave cancelled/aborted checkouts land here without a
    // transaction_id at all — nothing to verify.
    if (status === "cancelled" || !transaction_id) {
        return (
            <Result
                icon={<XCircle className="h-10 w-10 text-gray-400" />}
                title="Payment cancelled"
                message="You cancelled the checkout before it completed. No changes were made to your subscription."
            />
        );
    }

    const result = await confirmFlutterwavePayment(transaction_id, tx_ref);

    if (result.outcome === "success" || result.outcome === "already_processed") {
        return (
            <Result
                icon={<CheckCircle2 className="h-10 w-10 text-green-600" />}
                title="Payment successful"
                message={
                    result.outcome === "success"
                        ? `Your agency is now on the ${result.planName} plan.`
                        : "This payment has already been confirmed — your subscription is up to date."
                }
            />
        );
    }

    if (result.outcome === "not_found") {
        return (
            <Result
                icon={<Clock className="h-10 w-10 text-amber-500" />}
                title="Still checking..."
                message="We couldn't immediately match this payment. If money left your account, it will be reflected on your billing page shortly — refresh in a minute."
            />
        );
    }

    return (
        <Result
            icon={<XCircle className="h-10 w-10 text-red-500" />}
            title="Payment failed"
            message={result.reason}
        />
    );
}

function Result({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
    return (
        <div className="max-w-md mx-auto mt-16 text-center space-y-4">
            <div className="flex justify-center">{icon}</div>
            <h1 className="text-xl font-black text-gray-900">{title}</h1>
            <p className="text-gray-500 text-sm">{message}</p>
            <Link
                href="/admin/dashboard/billing"
                className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#1E3A8A] text-white font-bold hover:bg-blue-900 transition-colors"
            >
                Back to Billing
            </Link>
        </div>
    );
}