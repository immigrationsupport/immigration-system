import prisma from "@/lib/prisma";
import { verifyTransaction, mapPaymentType } from "@/lib/flutterwave";

export type ConfirmResult =
    | { outcome: "success"; planName: string }
    | { outcome: "already_processed" }
    | { outcome: "failed"; reason: string }
    | { outcome: "not_found" };

/**
 * Confirms a Flutterwave transaction and, if genuinely successful, applies
 * the plan upgrade it was paying for. Safe to call twice for the same
 * transaction (webhook + redirect both call this) — the PENDING -> SUCCESS
 * transition only happens once thanks to the status guard inside the
 * transaction.
 */
export async function confirmFlutterwavePayment(transactionId: string, txRef?: string): Promise<ConfirmResult> {
    const verification = await verifyTransaction(transactionId);
    if (!verification.ok) {
        return { outcome: "failed", reason: verification.error || "Could not verify the transaction." };
    }

    const reference = verification.txRef || txRef;
    if (!reference) {
        return { outcome: "not_found" };
    }

    const payment = await prisma.payment.findUnique({
        where: { reference },
        include: { subscription: true, targetPlan: true },
    });

    if (!payment) {
        return { outcome: "not_found" };
    }

    if (payment.status !== "PENDING") {
        // Already handled by the webhook or a previous redirect — nothing to do.
        return payment.status === "SUCCESS" ? { outcome: "already_processed" } : { outcome: "failed", reason: "This payment already failed." };
    }

    if (!verification.successful) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", flwTransactionId: verification.transactionId },
        });
        return { outcome: "failed", reason: "The payment was not completed." };
    }

    // Guard against a tampered/short amount: the charge must cover the plan price.
    if (!payment.targetPlan || (verification.amount ?? 0) < payment.amountFcfa) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", flwTransactionId: verification.transactionId },
        });
        return { outcome: "failed", reason: "The amount paid did not match the plan price." };
    }

    const result = await prisma.$transaction(async (tx) => {
        // Re-check status inside the transaction to close the race between
        // the webhook and the redirect page firing at the same moment.
        const fresh = await tx.payment.findUnique({ where: { id: payment.id } });
        if (!fresh || fresh.status !== "PENDING") return null;

        await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: "SUCCESS",
                method: mapPaymentType(verification.paymentType),
                flwTransactionId: verification.transactionId,
            },
        });

        await tx.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
                planId: payment.targetPlan!.id,
                pendingPlanId: null,
                status: "ACTIVE",
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });

        await tx.auditLog.create({
            data: {
                action: "UPGRADE_SUBSCRIPTION",
                details: `Agency upgraded to plan "${payment.targetPlan!.name}" (${payment.amountFcfa.toLocaleString()} FCFA) via Flutterwave.`,
                agencyId: payment.subscription.agencyId,
                targetId: payment.subscriptionId,
            },
        });

        return payment.targetPlan!.name;
    });

    if (!result) {
        return { outcome: "already_processed" };
    }

    return { outcome: "success", planName: result };
}