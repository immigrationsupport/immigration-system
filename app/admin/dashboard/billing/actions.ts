"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { initializePayment } from "@/lib/flutterwave";

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
 * Free plans and downgrades never touch Flutterwave — they just change
 * the subscription directly. Paid upgrades create a PENDING Payment and
 * hand back a Flutterwave checkout link for the browser to redirect to;
 * the plan itself only changes once that payment is confirmed (see
 * lib/subscription-payments.ts, called from the webhook and the
 * redirect-back page).
 */
export async function upgradeSubscriptionAction(formData: FormData) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };
    const { session, agencyId } = ctx;

    const planId = formData.get("planId") as string;
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

        // Downgrade or switching to a free plan: no payment required.
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
                            ? `Agency scheduled a downgrade to plan "${newPlan.name}", effective ${subscription.currentPeriodEnd.toDateString()}.`
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

        // Paid upgrade: create a pending payment and start a Flutterwave checkout.
        const txRef = `UPG-${agencyId.slice(0, 8)}-${Date.now()}-${randomUUID().slice(0, 8)}`;

        await prisma.payment.create({
            data: {
                subscriptionId: subscription.id,
                amountFcfa: newPlan.priceFcfa,
                status: "PENDING",
                reference: txRef,
                targetPlanId: newPlan.id,
            },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";

        const init = await initializePayment({
            txRef,
            amount: newPlan.priceFcfa,
            currency: CURRENCY,
            redirectUrl: `${appUrl}/admin/dashboard/billing/verify`,
            customerEmail: session.user.email,
            customerName: session.user.name,
            title: `${newPlan.name} plan subscription`,
            meta: { agencyId, subscriptionId: subscription.id, planId: newPlan.id },
        });

        if (!init.ok || !init.paymentUrl) {
            // Clean up the pending payment we just created so it doesn't linger.
            await prisma.payment.update({ where: { reference: txRef }, data: { status: "FAILED" } });
            return { error: init.error || "Could not start the payment. Please try again." };
        }

        return { success: true, paymentUrl: init.paymentUrl };
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