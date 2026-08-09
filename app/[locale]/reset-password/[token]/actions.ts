"use server";

import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

const RESET_TOKEN_PREFIX = "password-reset:";

export async function resetPasswordAction(token: string, newPassword: string, confirmPassword: string) {
    if (!token) {
        return { error: "Invalid reset link." };
    }
    if (!newPassword || !confirmPassword) {
        return { error: "Please fill in both password fields." };
    }
    if (newPassword !== confirmPassword) {
        return { error: "Passwords do not match." };
    }
    if (newPassword.length < 8) {
        return { error: "Password must be at least 8 characters." };
    }

    try {
        const verification = await prisma.verification.findFirst({
            where: { identifier: `${RESET_TOKEN_PREFIX}${token}` },
        });

        if (!verification) {
            return { error: "This reset link is invalid or has already been used." };
        }

        if (verification.expiresAt < new Date()) {
            await prisma.verification.delete({ where: { id: verification.id } });
            return { error: "This reset link has expired. Please request a new one." };
        }

        const userId = verification.value;
        const hashedPassword = await hashPassword(newPassword);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword, mustChangePassword: false },
            }),
            prisma.account.updateMany({
                where: { userId, providerId: "credential" },
                data: { password: hashedPassword },
            }),
            // Single-use token.
            prisma.verification.delete({ where: { id: verification.id } }),
            // Sign the user out everywhere — a password reset should invalidate
            // any session that might have been active (e.g. on a shared device).
            prisma.session.deleteMany({ where: { userId } }),
        ]);

        return { success: true };
    } catch (e: any) {
        console.error("Reset password error:", e);
        return { error: "Something went wrong. Please try again." };
    }
}