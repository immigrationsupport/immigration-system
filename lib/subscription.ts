import prisma from "@/lib/prisma";

export async function getAgencySubscription(agencyId: string) {
    return prisma.subscription.findUnique({
        where: { agencyId },
        include: { plan: true },
    });
}

export async function checkAgentQuota(agencyId: string): Promise<{ ok: boolean; error?: string }> {
    const sub = await getAgencySubscription(agencyId);
    if (!sub) return { ok: false, error: "No active subscription found for your agency." };
    if (sub.status !== "ACTIVE") {
        return { ok: false, error: "Your subscription is not active. New agents cannot be created until it's renewed." };
    }
    if (sub.plan.maxAgents === null) return { ok: true };

    const count = await prisma.user.count({ where: { agencyId, role: "AGENT" } });
    if (count >= sub.plan.maxAgents) {
        return { ok: false, error: `Your plan (${sub.plan.name}) allows up to ${sub.plan.maxAgents} agent(s). Upgrade your plan to add more.` };
    }
    return { ok: true };
}

export async function checkClientQuota(agencyId: string): Promise<{ ok: boolean; error?: string }> {
    const sub = await getAgencySubscription(agencyId);
    if (!sub) return { ok: false, error: "No active subscription found for your agency." };
    if (sub.status !== "ACTIVE") {
        return { ok: false, error: "Your subscription is not active. New clients cannot be created until it's renewed." };
    }
    if (sub.plan.maxClients === null) return { ok: true };

    const count = await prisma.user.count({ where: { agencyId, role: "CLIENT" } });
    if (count >= sub.plan.maxClients) {
        return { ok: false, error: `Your plan (${sub.plan.name}) allows up to ${sub.plan.maxClients} client(s). Upgrade your plan to add more.` };
    }
    return { ok: true };
}