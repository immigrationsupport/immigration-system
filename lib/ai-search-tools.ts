import prisma from "@/lib/prisma";

export async function searchClients(agencyId: string, query: string) {
    const clients = await prisma.user.findMany({
        where: {
            agencyId,
            role: "CLIENT",
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { phoneNumber: { contains: query, mode: "insensitive" } }
            ]
        },
        select: {
            id: true, name: true, email: true, phoneNumber: true,
            nationality: true, status: true, isSuspended: true, createdAt: true,
            agent: { select: { name: true } },
            applications: { select: { id: true, country: true, status: true } }
        },
        take: 10
    });
    return clients;
}

export async function searchAgents(agencyId: string, query: string) {
    const agents = await prisma.user.findMany({
        where: {
            agencyId,
            role: "AGENT",
            name: { contains: query, mode: "insensitive" }
        },
        select: {
            id: true, name: true, email: true, isSuspended: true,
            assignedClients: { select: { id: true } }
        },
        take: 10
    });
    return agents;
}

export async function searchApplications(
    agencyId: string,
    query?: string,
    status?: string,
    country?: string
) {
    const applications = await prisma.application.findMany({
        where: {
            agencyId,
            ...(status ? { status: status as any } : {}),
            ...(country ? { country: { contains: country, mode: "insensitive" } } : {}),
            ...(query
                ? { client: { name: { contains: query, mode: "insensitive" } } }
                : {})
        },
        select: {
            id: true, country: true, status: true, type: true, createdAt: true,
            client: { select: { name: true, email: true } },
            agent: { select: { name: true } },
            steps: { select: { label: true, type: true, status: true }, orderBy: { order: "asc" } }
        },
        take: 10
    });
    return applications;
}

export async function getClientDetails(agencyId: string, clientId: string) {
    const client = await prisma.user.findFirst({
        where: { id: clientId, agencyId, role: "CLIENT" },
        include: {
            agent: { select: { name: true, email: true } },
            applications: {
                include: { steps: { orderBy: { order: "asc" } } }
            }
        }
    });
    return client;
}