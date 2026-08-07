"use server";

import prisma from "@/lib/prisma";
import crypto from "crypto";

const RESET_TOKEN_PREFIX = "password-reset:";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordResetAction(email: string) {
    if (!email) {
        return { error: "Please provide your email address." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "Please provide a valid email address." };
    }

    // Generic message shown regardless of outcome, to avoid leaking which
    // emails have an account (user enumeration).
    const genericMessage = "If an account exists for this email, a password reset link has been sent.";

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true }
        });

        if (!user) {
            return { success: true, message: genericMessage };
        }

        // Invalidate any previous outstanding reset tokens for this user.
        await prisma.verification.deleteMany({
            where: {
                value: user.id,
                identifier: { startsWith: RESET_TOKEN_PREFIX }
            }
        });

        const token = crypto.randomBytes(32).toString("hex");

        await prisma.verification.create({
            data: {
                identifier: `${RESET_TOKEN_PREFIX}${token}`,
                value: user.id,
                expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
            }
        });

        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password/${token}`;

        // TODO: Wire this up to a real email provider (Resend, SES, etc.).
        // For now this mirrors the existing sendVerificationEmail placeholder
        // in lib/auth.ts and just logs the link server-side.
        console.log(`[Password Reset] Send to ${email}: ${resetUrl}`);

        return { success: true, message: genericMessage };
    } catch (e: any) {
        console.error("Password reset request error:", e);
        return { error: "Something went wrong. Please try again." };
    }
}