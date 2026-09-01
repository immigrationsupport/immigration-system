
import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { confirmCampayPayment } from "@/lib/subscription-payments";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function VerifyPaymentPage({
    params,
}: {
    params: Promise<{ txRef: string; locale: string }>;
}) {
    const { txRef, locale } = await params;

    const t = await getTranslations({
        locale,
        namespace: "adminBilling.verify",
    });

    const payment = await prisma.payment.findUnique({
        where: { reference: txRef },
    });

    if (!payment) {
        return (
            <Result
                locale={locale}
                icon={<XCircle className="h-10 w-10 text-gray-400" />}
                title={t("checkingTitle")}
                message={t("checkingMessage")}
            />
        );
    }

    if (payment.status === "SUCCESS") {
        return (
            <Result
                locale={locale}
                icon={<CheckCircle2 className="h-10 w-10 text-green-600" />}
                title={t("successTitle")}
                message={t("alreadyProcessedMessage")}
            />
        );
    }

    if (payment.status === "FAILED") {
        return (
            <Result
                locale={locale}
                icon={<XCircle className="h-10 w-10 text-red-500" />}
                title={t("failedTitle")}
                message={t("cancelledMessage")}
            />
        );
    }

    // Still PENDING in our DB — re-check directly with CamPay.
    if (!payment.gatewayTransactionId) {
        return (
            <Result
                locale={locale}
                icon={<Clock className="h-10 w-10 text-amber-500" />}
                title={t("checkingTitle")}
                message={t("checkingMessage")}
            />
        );
    }

    const result = await confirmCampayPayment(
        payment.gatewayTransactionId
    );

    if (
        result.outcome === "success" ||
        result.outcome === "already_processed"
    ) {
        return (
            <Result
                locale={locale}
                icon={
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                }
                title={t("successTitle")}
                message={
                    result.outcome === "success"
                        ? t("successMessage", {
                              planName: result.planName,
                          })
                        : t("alreadyProcessedMessage")
                }
            />
        );
    }

    if (result.outcome === "pending") {
        return (
            <Result
                locale={locale}
                icon={<Clock className="h-10 w-10 text-amber-500" />}
                title={t("checkingTitle")}
                message={t("checkingMessage")}
            />
        );
    }

    if (result.outcome === "not_found") {
        return (
            <Result
                locale={locale}
                icon={<Clock className="h-10 w-10 text-amber-500" />}
                title={t("checkingTitle")}
                message={t("checkingMessage")}
            />
        );
    }

    return (
        <Result
            locale={locale}
            icon={<XCircle className="h-10 w-10 text-red-500" />}
            title={t("failedTitle")}
            message={result.reason}
        />
    );
}

function Result({
    icon,
    title,
    message,
    locale,
}: {
    icon: React.ReactNode;
    title: string;
    message: string;
    locale: string;
}) {
    return (
        <div className="max-w-md mx-auto mt-16 text-center space-y-4">
            <div className="flex justify-center">
                {icon}
            </div>

            <h1 className="text-xl font-black text-gray-900">
                {title}
            </h1>

            <p className="text-gray-500 text-sm">
                {message}
            </p>

            <Link
                href={`/${locale}/admin/dashboard/billing`}
                className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#1E3A8A] text-white font-bold hover:bg-blue-900 transition-colors"
            >
                {/*
                  We cannot use t() here because Result is a regular
                  function. The translated text is passed from the page.
                */}
                {locale === "fr"
                    ? "Retour à la facturation"
                    : "Back to Billing"}
            </Link>
        </div>
    );
}
