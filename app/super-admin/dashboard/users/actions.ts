"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return null;
    }
    return session;
}

export async function getAllUsers() {
    const session = await requireSuperAdmin();
    if (!session) throw new Error("Unauthorized");

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            isSuspended: true,
            createdAt: true,
            agency: { select: { id: true, name: true } },
        },
    });

    return users;
}

export async function toggleSuspendUserAction(userId: string, currentlySuspended: boolean) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    if (userId === session.user.id) {
        return { error: "You cannot suspend your own account." };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: "User not found." };
        if (user.role === "SUPER_ADMIN") {
            return { error: "Super Admin accounts cannot be suspended." };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isSuspended: !currentlySuspended },
        });

        await prisma.auditLog.create({
            data: {
                action: currentlySuspended ? "UNSUSPEND_USER" : "SUSPEND_USER",
                details: `User ${user.name} (${user.email}) ${currentlySuspended ? "unsuspended" : "suspended"} by Super Admin.`,
                userId: session.user.id,
                agencyId: user.agencyId,
                targetId: userId,
            },
        });

        revalidatePath("/super-admin/dashboard/users");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to update user status." };
    }
}

export async function changeUserRoleAction(userId: string, role: string) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    if (!["ADMIN", "AGENT", "CLIENT"].includes(role)) {
        return { error: "Invalid role." };
    }

    if (userId === session.user.id) {
        return { error: "You cannot change your own role." };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: "User not found." };
        if (user.role === "SUPER_ADMIN") {
            return { error: "Super Admin roles cannot be changed here." };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: role as any },
        });

        await prisma.auditLog.create({
            data: {
                action: "CHANGE_USER_ROLE",
                details: `User ${user.name} (${user.email}) role changed from ${user.role} to ${role} by Super Admin.`,
                userId: session.user.id,
                agencyId: user.agencyId,
                targetId: userId,
            },
        });

        revalidatePath("/super-admin/dashboard/users");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to update user role." };
    }
}

export async function deleteUserAction(userId: string) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    if (userId === session.user.id) {
        return { error: "You cannot delete your own account." };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: "User not found." };
        if (user.role === "SUPER_ADMIN") {
            return { error: "Super Admin accounts cannot be deleted." };
        }

        await prisma.user.delete({ where: { id: userId } });

        await prisma.auditLog.create({
            data: {
                action: "DELETE_USER",
                details: `User ${user.name} (${user.email}) deleted by Super Admin.`,
                userId: session.user.id,
                agencyId: user.agencyId,
                targetId: userId,
            },
        });

        revalidatePath("/super-admin/dashboard/users");
        return { success: true };
    } catch (e: any) {
        console.error("Delete user error:", e);
        return { error: "Failed to delete user. They may have linked applications or records." };
    }
}