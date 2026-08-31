import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { confirmFlutterwavePayment } from "@/lib/subscription-payments";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function VerifyPaymentPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }>;
}) {
    const t = await getTranslations("adminBilling.verify");
    const params = await searchParams;
    const { status, tx_ref, transaction_id } = params;

    // Flutterwave cancelled/aborted checkouts land here without a
    // transaction_id at all — nothing to verify.
    if (status === "cancelled" || !transaction_id) {
        return (
            <Result
                icon={<XCircle className="h-10 w-10 text-gray-400" />}
                title={t("cancelledTitle")}
                message={t("cancelledMessage")}
                backLabel={t("backToBilling")}
            />
        );
    }

    const result = await confirmFlutterwavePayment(transaction_id, tx_ref);

    if (result.outcome === "success" || result.outcome === "already_processed") {
        return (
            <Result
                icon={<CheckCircle2 className="h-10 w-10 text-green-600" />}
                title={t("successTitle")}
                message={
                    result.outcome === "success"
                        ? t("successMessage", { planName: result.planName })
                        : t("alreadyProcessedMessage")
                }
                backLabel={t("backToBilling")}
            />
        );
    }

    if (result.outcome === "not_found") {
        return (
            <Result
                icon={<Clock className="h-10 w-10 text-amber-500" />}
                title={t("checkingTitle")}
                message={t("checkingMessage")}
                backLabel={t("backToBilling")}
            />
        );
    }

    return (
        <Result
            icon={<XCircle className="h-10 w-10 text-red-500" />}
            title={t("failedTitle")}
            message={result.reason}
            backLabel={t("backToBilling")}
        />
    );
}

function Result({ icon, title, message, backLabel }: { icon: React.ReactNode; title: string; message: string; backLabel: string }) {
    return (
        <div className="max-w-md mx-auto mt-16 text-center space-y-4">
            <div className="flex justify-center">{icon}</div>
            <h1 className="text-xl font-black text-gray-900">{title}</h1>
            <p className="text-gray-500 text-sm">{message}</p>
            <Link
                href="/admin/dashboard/billing"
                className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#1E3A8A] text-white font-bold hover:bg-blue-900 transition-colors"
            >
                {backLabel}
            </Link>
        </div>
    );
}