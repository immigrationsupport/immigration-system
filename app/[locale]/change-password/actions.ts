"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";

export async function changePasswordAction(formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { error: "Unauthorized." };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required." };
    }
    if (newPassword !== confirmPassword) {
        return { error: "The new passwords do not match." };
    }
    if (newPassword.length < 8) {
        return { error: "Password must be at least 8 characters." };
    }
    if (newPassword === currentPassword) {
        return { error: "New password must be different from the temporary one." };
    }

    try {
        const account = await prisma.account.findFirst({
            where: { userId: session.user.id, providerId: "credential" }
        });

        if (!account?.password) {
            return { error: "No password set on this account." };
        }

        const isValid = await verifyPassword({ password: currentPassword, hash: account.password });
        if (!isValid) {
            return { error: "Current password is incorrect." };
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: { password: hashedPassword, mustChangePassword: false }
            }),
            prisma.account.updateMany({
                where: { userId: session.user.id, providerId: "credential" },
                data: { password: hashedPassword }
            }),
        ]);

        revalidatePath("/");
        return { success: true };
    } catch (e: any) {
        console.error("Change password error:", e);
        return { error: "Failed to change password." };
    }
}