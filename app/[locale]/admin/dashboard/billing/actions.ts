"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { initializePayment } from "@/lib/campay";
import { getLocale } from "next-intl/server";

const CURRENCY = "XAF";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "ADMIN") return null;
    const agencyId = (session.user as any).agencyId;
    if (!agencyId) return null;
    return { session, agencyId };
}

export async function getAvailablePlans() {
    return prisma.plan.findMany({
        where: { isPublic: true },
        orderBy: { priceFcfa: "asc" },
    });
}

/**
 * Free plans and downgrades never touch CamPay — they just change
 * the subscription directly. Paid upgrades create a PENDING Payment and
 * hand back a CamPay checkout link for the browser to redirect to;
 * the plan itself only changes once that payment is confirmed (see
 * lib/subscription-payments.ts, called from the webhook and the
 * redirect-back page).
 */
export async function upgradeSubscriptionAction(formData: FormData) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };
    const { session, agencyId } = ctx;

    const planId = String(formData.get("planId") || "");
    const paymentMethod = String(formData.get("paymentMethod") || "");
    const phoneNumber = String(formData.get("phoneNumber") || "").replace(/\D/g, "");

    if (!planId) return { error: "Select a plan." };

    try {
        const [subscription, newPlan] = await Promise.all([
            prisma.subscription.findUnique({ where: { agencyId }, include: { plan: true } }),
            prisma.plan.findUnique({ where: { id: planId } }),
        ]);

        if (!subscription) return { error: "No subscription found for your agency." };
        if (!newPlan || !newPlan.isPublic) return { error: "This plan is not available." };
        if (newPlan.id === subscription.planId) return { error: "You are already on this plan." };

        const isDowngrade = newPlan.priceFcfa < subscription.plan.priceFcfa;

        if (isDowngrade || newPlan.priceFcfa === 0) {
            await prisma.$transaction(async (tx) => {
                if (isDowngrade) {
                    await tx.subscription.update({
                        where: { agencyId },
                        data: { pendingPlanId: newPlan.id },
                    });
                } else {
                    await tx.subscription.update({
                        where: { agencyId },
                        data: {
                            planId: newPlan.id,
                            pendingPlanId: null,
                            status: "ACTIVE",
                            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        },
                    });
                }

                await tx.auditLog.create({
                    data: {
                        action: isDowngrade ? "SCHEDULE_PLAN_DOWNGRADE" : "UPGRADE_SUBSCRIPTION",
                        details: isDowngrade
                            ? `Agency scheduled a downgrade to plan "${newPlan.name}".`
                            : `Agency switched to the free plan "${newPlan.name}".`,
                        userId: session.user.id,
                        agencyId,
                        targetId: subscription.id,
                    },
                });
            });

            revalidatePath("/admin/dashboard/billing");
            return { success: true, downgrade: isDowngrade };
        }

        if (paymentMethod !== "MTN_MOBILE_MONEY" && paymentMethod !== "ORANGE_MONEY" && paymentMethod !== "CARD") {
            return { error: "Choose a payment method." };
        }

        if ((paymentMethod === "MTN_MOBILE_MONEY" || paymentMethod === "ORANGE_MONEY") && !/^2376\d{8}$/.test(phoneNumber)) {
            return { error: "Enter a valid Cameroon mobile number, for example 2376XXXXXXXX." };
        }

        const txRef = `UPG-${agencyId.slice(0, 8)}-${Date.now()}-${randomUUID().slice(0, 8)}`;

        await prisma.payment.create({
            data: {
                subscriptionId: subscription.id,
                amountFcfa: newPlan.priceFcfa,
                status: "PENDING",
                reference: txRef,
                targetPlanId: newPlan.id,
                method: paymentMethod === "MTN_MOBILE_MONEY"
                    ? "MTN_MOBILE_MONEY"
                    : paymentMethod === "ORANGE_MONEY"
                    ? "ORANGE_MONEY"
                    : "CARD",
            },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
        const locale = await getLocale();
        const verifyUrl = `${appUrl}/${locale}/admin/dashboard/billing/verify?ref=${encodeURIComponent(txRef)}`;

        if (paymentMethod === "CARD") {
            const init = await initializePayment({
                txRef,
                amount: newPlan.priceFcfa,
                redirectUrl: verifyUrl,
                customerEmail: session.user.email,
                customerName: session.user.name || "Customer",
                title: `${newPlan.name} plan subscription`,
            });

            if (!init.ok || !init.paymentUrl) {
                await prisma.payment.update({ where: { reference: txRef }, data: { status: "FAILED" } });
                return { error: init.error || "Could not start the card payment." };
            }

            if (init.gatewayReference) {
                await prisma.payment.update({
                    where: { reference: txRef },
                    data: { gatewayTransactionId: init.gatewayReference },
                });
            }

            return { success: true, paymentUrl: init.paymentUrl, txRef };
        }

        const { collectMobileMoney } = await import("@/lib/campay");
        const collect = await collectMobileMoney({
            txRef,
            amount: newPlan.priceFcfa,
            phoneNumber,
            description: `${newPlan.name} subscription`,
        });

        if (!collect.ok || !collect.gatewayReference) {
            await prisma.payment.update({ where: { reference: txRef }, data: { status: "FAILED" } });
            return { error: collect.error || "Could not start the Mobile Money payment." };
        }

        await prisma.payment.update({
            where: { reference: txRef },
            data: { gatewayTransactionId: collect.gatewayReference },
        });

        return {
            success: true,
            txRef,
            paymentReference: collect.gatewayReference,
        };
    } catch (e: any) {
        console.error("Upgrade subscription error:", e);
        return { error: e.message || "Failed to update your subscription." };
    }
}

export async function cancelPendingDowngradeAction() {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };
    const { session, agencyId } = ctx;

    try {
        await prisma.subscription.update({
            where: { agencyId },
            data: { pendingPlanId: null },
        });

        await prisma.auditLog.create({
            data: {
                action: "CANCEL_PLAN_DOWNGRADE",
                details: "Agency cancelled a scheduled plan downgrade.",
                userId: session.user.id,
                agencyId,
            },
        });

        revalidatePath("/admin/dashboard/billing");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to cancel the scheduled downgrade." };
    }
}