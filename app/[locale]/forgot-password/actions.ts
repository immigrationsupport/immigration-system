"use server";

import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/resend";
import { buildOtpEmailHtml } from "@/lib/otp-email";
import { hashPassword } from "better-auth/crypto";

const RESET_CODE_PREFIX = "password-reset:";
const RESET_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

type ResetCodePayload = {
    code: string;
    userId: string;
    attempts: number;
};

function emailIdentifier(email: string) {
    return `${RESET_CODE_PREFIX}${email.trim().toLowerCase()}`;
}

/**
 * Step 1: the agency/client enters their email. If an account exists, we
 * generate a 6-digit code, store it against the email (not a secret link),
 * and send it by mail. The response is intentionally generic either way so
 * the page can't be used to enumerate which emails have accounts.
 */
export async function requestPasswordResetAction(email: string, locale: string = "en") {
    if (!email) {
        return { error: "Please provide your email address." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "Please provide a valid email address." };
    }

    const isFr = locale === "fr";
    const normalizedEmail = email.trim().toLowerCase();

    const genericMessage = isFr
        ? "Si cet e-mail correspond à un compte, un code a été envoyé."
        : "If an account exists for this email, a code has been sent.";

    try {
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                name: true,
                email: true,
                agency: { select: { name: true } },
            },
        });

        if (!user) {
            return { success: true, message: genericMessage };
        }

        // Invalidate any previous outstanding code for this email.
        const identifier = emailIdentifier(normalizedEmail);
        await prisma.verification.deleteMany({ where: { identifier } });

        const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

        const payload: ResetCodePayload = { code, userId: user.id, attempts: 0 };

        await prisma.verification.create({
            data: {
                identifier,
                value: JSON.stringify(payload),
                expiresAt: new Date(Date.now() + RESET_CODE_TTL_MS),
            },
        });

        const agencyName = user.agency?.name || "Procédure Facile";
        const subject = isFr ? `Code de réinitialisation - ${agencyName}` : `Password Reset Code - ${agencyName}`;
        const html = buildOtpEmailHtml({ otp: code, type: "forget-password" });

        const emailResult = await sendEmail({ to: user.email, subject, html, fromName: agencyName });
        if (emailResult.error) {
            console.error("Password reset email failed to send:", emailResult.error);
            return {
                error: isFr
                    ? "Impossible d'envoyer l'e-mail pour le moment. Réessayez plus tard."
                    : "Couldn't send the email right now. Please try again later.",
            };
        }

        return { success: true, message: genericMessage };
    } catch (e: any) {
        console.error("Password reset request error:", e);
        return { error: "Something went wrong. Please try again." };
    }
}

/**
 * Step 2: the user enters the code they received, plus a new password
 * (and confirmation) on the same page — no link, no separate route.
 */
export async function resetPasswordWithCodeAction(
    email: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
    locale: string = "en"
) {
    const isFr = locale === "fr";
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedCode = (code || "").trim();

    if (!normalizedEmail || !normalizedCode) {
        return { error: isFr ? "Veuillez saisir le code reçu par e-mail." : "Please enter the code sent to your email." };
    }
    if (!newPassword || !confirmPassword) {
        return { error: isFr ? "Veuillez remplir les deux champs de mot de passe." : "Please fill in both password fields." };
    }
    if (newPassword !== confirmPassword) {
        return { error: isFr ? "Les mots de passe ne correspondent pas." : "Passwords do not match." };
    }
    if (newPassword.length < 8) {
        return { error: isFr ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must be at least 8 characters." };
    }

    const identifier = emailIdentifier(normalizedEmail);
    const invalidCodeMessage = isFr
        ? "Ce code est invalide ou a expiré. Veuillez en demander un nouveau."
        : "This code is invalid or has expired. Please request a new one.";

    try {
        const verification = await prisma.verification.findFirst({ where: { identifier } });

        if (!verification) {
            return { error: invalidCodeMessage };
        }

        if (verification.expiresAt < new Date()) {
            await prisma.verification.delete({ where: { id: verification.id } });
            return { error: invalidCodeMessage };
        }

        let payload: ResetCodePayload;
        try {
            payload = JSON.parse(verification.value);
        } catch {
            await prisma.verification.delete({ where: { id: verification.id } });
            return { error: invalidCodeMessage };
        }

        if (payload.attempts >= MAX_ATTEMPTS) {
            await prisma.verification.delete({ where: { id: verification.id } });
            return { error: invalidCodeMessage };
        }

        if (payload.code !== normalizedCode) {
            await prisma.verification.update({
                where: { id: verification.id },
                data: { value: JSON.stringify({ ...payload, attempts: payload.attempts + 1 }) },
            });
            return { error: invalidCodeMessage };
        }

        const userId = payload.userId;
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
            // Single-use code.
            prisma.verification.delete({ where: { id: verification.id } }),
            // Sign the user out everywhere — a password reset should invalidate
            // any session that might have been active (e.g. on a shared device).
            prisma.session.deleteMany({ where: { userId } }),
        ]);

        return { success: true };
    } catch (e: any) {
        console.error("Reset password with code error:", e);
        return { error: isFr ? "Une erreur est survenue. Veuillez réessayer." : "Something went wrong. Please try again." };
    }
}