"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

const VALID_METHODS = ["MTN_MOBILE_MONEY", "ORANGE_MONEY", "CARD"];

export async function upgradeSubscriptionAction(formData: FormData) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };
    const { session, agencyId } = ctx;

    const planId = formData.get("planId") as string;
    const method = formData.get("method") as string;
    const reference = (formData.get("reference") as string)?.trim() || null;

    if (!planId || !method) return { error: "Select a plan and a payment method." };
    if (!VALID_METHODS.includes(method)) return { error: "Invalid payment method." };

    try {
        const [subscription, newPlan] = await Promise.all([
            prisma.subscription.findUnique({ where: { agencyId }, include: { plan: true } }),
            prisma.plan.findUnique({ where: { id: planId } }),
        ]);

        if (!subscription) return { error: "No subscription found for your agency." };
        if (!newPlan || !newPlan.isPublic) return { error: "This plan is not available." };
        if (newPlan.id === subscription.planId) return { error: "You are already on this plan." };

        const isDowngrade = newPlan.priceFcfa < subscription.plan.priceFcfa;

        await prisma.$transaction(async (tx) => {
            if (isDowngrade) {
                // Takes effect at the end of the current billing period instead
                // of immediately, so the agency keeps what it already paid for.
                await tx.subscription.update({
                    where: { agencyId },
                    data: { pendingPlanId: newPlan.id },
                });
            } else {
                if (newPlan.priceFcfa > 0) {
                    await tx.payment.create({
                        data: {
                            subscriptionId: subscription.id,
                            amountFcfa: newPlan.priceFcfa,
                            method: method as any,
                            status: "SUCCESS",
                            reference,
                        },
                    });
                }

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
                        : `Agency upgraded to plan "${newPlan.name}" (${newPlan.priceFcfa.toLocaleString()} FCFA) via ${method}.`,
                    userId: session.user.id,
                    agencyId,
                    targetId: subscription.id,
                },
            });
        });

        revalidatePath("/admin/dashboard/billing");
        return { success: true, downgrade: isDowngrade };
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