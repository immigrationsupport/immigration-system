import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Smartphone, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { confirmCampayPayment } from "@/lib/subscription-payments";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function VerifyPaymentPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { locale } = await params;
  const { ref: txRef } = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminBilling.verify" });

  if (!txRef) return <Result locale={locale} icon={<XCircle className="h-12 w-12 text-gray-400" />} title="Payment reference missing" message="We could not find the payment you are trying to verify." />;

  const payment = await prisma.payment.findUnique({ where: { reference: txRef } });
  if (!payment) return <Result locale={locale} icon={<XCircle className="h-12 w-12 text-gray-400" />} title="Payment not found" message="This payment could not be found. Please return to billing and try again." />;

  if (payment.status === "SUCCESS") return <Result locale={locale} success icon={<CheckCircle2 className="h-12 w-12 text-green-600" />} title={t("successTitle")} message={t("alreadyProcessedMessage")} />;

  if (payment.status === "FAILED") return <Result locale={locale} icon={<XCircle className="h-12 w-12 text-red-500" />} title={t("failedTitle")} message="The payment was not completed. If you did not cancel it, wait a moment and try again from billing." />;

  if (!payment.gatewayTransactionId) {
    return <PendingResult locale={locale} title="Waiting for payment confirmation" message="Approve the payment on your phone. This page will keep checking automatically." />;
  }

  const result = await confirmCampayPayment(payment.gatewayTransactionId);
  if (result.outcome === "success" || result.outcome === "already_processed") {
    return <Result locale={locale} success icon={<CheckCircle2 className="h-12 w-12 text-green-600" />} title={t("successTitle")} message={result.outcome === "success" ? t("successMessage", { planName: result.planName }) : t("alreadyProcessedMessage")} />;
  }

  if (result.outcome === "pending") return <PendingResult locale={locale} title="Waiting for confirmation" message="Approve the Mobile Money request on your phone. We will automatically check again." />;
  if (result.outcome === "not_found") return <PendingResult locale={locale} title="Waiting for CamPay" message="Your payment was started, but CamPay has not returned the transaction yet." />;

  return <Result locale={locale} icon={<XCircle className="h-12 w-12 text-red-500" />} title={t("failedTitle")} message={result.reason} />;
}

function PendingResult({ locale, title, message }: { locale: string; title: string; message: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border p-8 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center"><Smartphone className="h-8 w-8 text-blue-700 animate-pulse" /></div>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        <p className="mt-3 text-gray-500 leading-6">{message}</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-blue-700"><Clock className="h-4 w-4 animate-spin" /> Checking payment status…</div>
        <meta httpEquiv="refresh" content="5" />
        <Link href={`/${locale}/admin/dashboard/billing`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">Back to billing <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}

function Result({ icon, title, message, locale, success = false }: { icon: React.ReactNode; title: string; message: string; locale: string; success?: boolean }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border p-8 text-center">
        <div className={`mx-auto mb-5 h-16 w-16 rounded-2xl flex items-center justify-center ${success ? "bg-green-50" : "bg-gray-50"}`}>{icon}</div>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        <p className="mt-3 text-gray-500 leading-6">{message}</p>
        <Link href={`/${locale}/admin/dashboard/billing`} className="mt-7 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E3A8A] text-white font-bold hover:bg-blue-900">Back to Billing <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
