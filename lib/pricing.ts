import prisma from "@/lib/prisma";

/**
 * Each agent's capacity covers this many clients. The custom plan builder
 * no longer lets the agency pick a client count directly — it's always
 * numAgents * this ratio, and pricing is based on agents alone.
 */
export const AGENT_TO_CLIENT_RATIO = 20;

/**
 * The pricing settings row always exists after this is called once — it's
 * created with sensible defaults on first read if missing, so nothing else
 * in the app has to worry about a missing row.
 */
export async function getPricingSettings() {
    return prisma.pricingSettings.upsert({
        where: { id: "singleton" },
        update: {},
        create: { id: "singleton" },
    });
}

export function getClientCapacityForAgents(numAgents: number): number {
    return numAgents * AGENT_TO_CLIENT_RATIO;
}

export function calculateCustomPlanPrice(
    numAgents: number,
    settings: { basePriceFcfa: number; pricePerAgentFcfa: number }
): number {
    return settings.basePriceFcfa + numAgents * settings.pricePerAgentFcfa;
}