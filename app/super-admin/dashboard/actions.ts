"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return null;
    }
    return session;
}

export async function getAgencies() {
    const session = await requireSuperAdmin();
    if (!session) throw new Error("Unauthorized");

    const agencies = await prisma.agency.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { users: true, applications: true }
            },
            subscription: {
                include: { plan: true }
            }
        }
    });

    return agencies;
}

export async function createAgencyAction(formData: FormData) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    const agencyName = (formData.get("agencyName") as string)?.trim();
    const adminName = (formData.get("adminName") as string)?.trim();
    const adminEmail = (formData.get("adminEmail") as string)?.trim()?.toLowerCase();
    const adminPassword = formData.get("adminPassword") as string;

    if (!agencyName || !adminName || !adminEmail || !adminPassword) {
        return { error: "All fields are required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
        return { error: "Invalid email format." };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (existingUser) {
            return { error: "A user with this email already exists." };
        }

        const hashedPassword = await hashPassword(adminPassword);

        const result = await prisma.$transaction(async (tx) => {
            const agency = await tx.agency.create({
                data: {
                    name: agencyName,
                    status: "ACTIVE",
                    isInternal: false,
                }
            });

            const admin = await tx.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: "ADMIN" as any,
                    agencyId: agency.id,
                    emailVerified: true,
                    accounts: {
                        create: {
                            providerId: "credential",
                            accountId: adminEmail,
                            password: hashedPassword,
                        }
                    }
                }
            });

            const freePlan = await tx.plan.findUnique({ where: { slug: "free" } });
            if (freePlan) {
                await tx.subscription.create({
                    data: {
                        agencyId: agency.id,
                        planId: freePlan.id,
                        status: "ACTIVE",
                        autoRenew: true,
                        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    }
                });
            }

            await tx.auditLog.create({
                data: {
                    action: "CREATE_AGENCY",
                    details: `Agency "${agencyName}" created with admin ${adminName} (${adminEmail}) by Super Admin.`,
                    userId: session.user.id,
                    agencyId: agency.id,
                    targetId: agency.id,
                }
            });

            return { agency, admin };
        });

        revalidatePath("/super-admin/dashboard");
        return { success: true, agencyId: result.agency.id };
    } catch (e: any) {
        console.error("Agency creation error:", e);
        return { error: e.message || "Failed to create agency." };
    }
}

export async function toggleSuspendAgencyAction(agencyId: string, currentlySuspended: boolean) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    try {
        const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
        if (!agency) return { error: "Agency not found." };
        if (agency.isInternal) return { error: "The internal agency cannot be suspended." };

        await prisma.agency.update({
            where: { id: agencyId },
            data: { status: currentlySuspended ? "ACTIVE" : "SUSPENDED" }
        });

        await prisma.auditLog.create({
            data: {
                action: currentlySuspended ? "UNSUSPEND_AGENCY" : "SUSPEND_AGENCY",
                details: `Agency "${agency.name}" ${currentlySuspended ? "reactivated" : "suspended"} by Super Admin.`,
                userId: session.user.id,
                agencyId: agencyId,
                targetId: agencyId,
            }
        });

        revalidatePath("/super-admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to update agency status." };
    }
}

export async function getPlans() {
    const session = await requireSuperAdmin();
    if (!session) throw new Error("Unauthorized");
    return prisma.plan.findMany({ orderBy: { priceFcfa: "asc" } });
}

export async function setAgencyPlanAction(agencyId: string, planId: string) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    try {
        const [agency, plan] = await Promise.all([
            prisma.agency.findUnique({ where: { id: agencyId } }),
            prisma.plan.findUnique({ where: { id: planId } }),
        ]);
        if (!agency) return { error: "Agency not found." };
        if (!plan) return { error: "Plan not found." };

        await prisma.subscription.upsert({
            where: { agencyId },
            update: { planId, pendingPlanId: null, status: "ACTIVE" },
            create: {
                agencyId,
                planId,
                status: "ACTIVE",
                autoRenew: true,
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });

        await prisma.auditLog.create({
            data: {
                action: "SET_AGENCY_PLAN",
                details: `Agency "${agency.name}" moved to plan "${plan.name}" by Super Admin.`,
                userId: session.user.id,
                agencyId,
                targetId: agencyId,
            }
        });

        revalidatePath("/super-admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to set agency plan." };
    }
}

export async function updateAgencyAction(agencyId: string, formData: FormData) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim() || null;
    const phone = (formData.get("phone") as string)?.trim() || null;
    const address = (formData.get("address") as string)?.trim() || null;

    if (!name) return { error: "Agency name is required." };

    try {
        const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
        if (!agency) return { error: "Agency not found." };

        await prisma.agency.update({
            where: { id: agencyId },
            data: { name, email, phone, address },
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_AGENCY",
                details: `Agency "${name}" details updated by Super Admin.`,
                userId: session.user.id,
                agencyId,
                targetId: agencyId,
            }
        });

        revalidatePath("/super-admin/dashboard");
        return { success: true };
    } catch (e: any) {
        console.error("Update agency error:", e);
        return { error: e.message || "Failed to update agency." };
    }
}

export async function deleteAgencyAction(agencyId: string, confirmationName: string) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    try {
        const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
        if (!agency) return { error: "Agency not found." };
        if (agency.isInternal) return { error: "The internal agency cannot be deleted." };

        if (confirmationName.trim().toLowerCase() !== agency.name.trim().toLowerCase()) {
            return { error: "Confirmation name does not match the agency name." };
        }

        await prisma.$transaction(async (tx) => {
            // Find apps for this agency
            const apps = await tx.application.findMany({
                where: { agencyId },
                select: { id: true }
            });
            const appIds = apps.map((a) => a.id);

            if (appIds.length > 0) {
                // Find steps
                const steps = await tx.applicationStep.findMany({
                    where: { applicationId: { in: appIds } },
                    select: { id: true }
                });
                const stepIds = steps.map((s) => s.id);

                if (stepIds.length > 0) {
                    await tx.document.deleteMany({ where: { procedureId: { in: stepIds } } });
                    await tx.message.deleteMany({ where: { procedureId: { in: stepIds } } });
                }

                await tx.applicationStep.deleteMany({ where: { applicationId: { in: appIds } } });
                await tx.application.deleteMany({ where: { agencyId } });
            }

            // Application templates & steps
            const templates = await tx.applicationTemplate.findMany({
                where: { agencyId },
                select: { id: true }
            });
            const templateIds = templates.map((t) => t.id);
            if (templateIds.length > 0) {
                await tx.stepTemplate.deleteMany({
                    where: { applicationTemplateId: { in: templateIds } }
                });
                await tx.applicationTemplate.deleteMany({ where: { agencyId } });
            }

            // Subscription & payments
            const sub = await tx.subscription.findUnique({ where: { agencyId } });
            if (sub) {
                await tx.payment.deleteMany({ where: { subscriptionId: sub.id } });
                await tx.subscription.delete({ where: { agencyId } });
            }

            // Users of this agency
            const users = await tx.user.findMany({
                where: { agencyId },
                select: { id: true }
            });
            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                await tx.officialMessage.deleteMany({
                    where: {
                        OR: [
                            { senderId: { in: userIds } },
                            { receiverId: { in: userIds } }
                        ]
                    }
                });
                await tx.document.deleteMany({ where: { uploaderId: { in: userIds } } });
                await tx.account.deleteMany({ where: { userId: { in: userIds } } });
                await tx.session.deleteMany({ where: { userId: { in: userIds } } });
                await tx.auditLog.deleteMany({ where: { userId: { in: userIds } } });
                await tx.user.deleteMany({ where: { agencyId } });
            }

            // Agency audit logs
            await tx.auditLog.deleteMany({ where: { agencyId } });

            // Delete agency
            await tx.agency.delete({ where: { id: agencyId } });

            // Log final deletion event (without agencyId constraint)
            await tx.auditLog.create({
                data: {
                    action: "DELETE_AGENCY",
                    details: `Agency "${agency.name}" was permanently deleted by Super Admin.`,
                    userId: session.user.id,
                    targetId: agencyId,
                }
            });
        });

        revalidatePath("/super-admin/dashboard");
        return { success: true };
    } catch (e: any) {
        console.error("Delete agency error:", e);
        return { error: e.message || "Failed to delete agency." };
    }
}