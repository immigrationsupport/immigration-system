"use server";

import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/resend";

const RESET_TOKEN_PREFIX = "password-reset:";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordResetAction(email: string, locale: string = "en") {
    if (!email) {
        return { error: "Please provide your email address." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "Please provide a valid email address." };
    }

    const isFr = locale === "fr";

    // Generic message shown regardless of outcome, to avoid leaking which
    // emails have an account (user enumeration).
    const genericMessage = isFr
        ? "Si cet e-mail correspond à un compte, un lien de réinitialisation a été envoyé."
        : "If an account exists for this email, a password reset link has been sent.";

    try {
        const user = await prisma.user.findUnique({
            where: { email },
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

        // Invalidate any previous outstanding reset tokens for this user.
        await prisma.verification.deleteMany({
            where: {
                value: user.id,
                identifier: { startsWith: RESET_TOKEN_PREFIX },
            },
        });

        const token = crypto.randomBytes(32).toString("hex");

        await prisma.verification.create({
            data: {
                identifier: `${RESET_TOKEN_PREFIX}${token}`,
                value: user.id,
                expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/${locale}/reset-password/${token}`;

        // Use the client's own agency name when they belong to one (so the
        // email doesn't say "ATLE Immigration" for another agency's client).
        const agencyName = user.agency?.name || "Procédure Facile";
        const subject = isFr ? `Réinitialisation de mot de passe - ${agencyName}` : `Password Reset - ${agencyName}`;

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">  
                <div style="padding: 30px;">
                    <p style="font-size: 16px; color: #374151;">
                        ${isFr ? "Bonjour" : "Hello"} <strong>${user.name}</strong>,
                    </p>
                    <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                        ${isFr
                            ? "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure."
                            : "We received a request to reset your account password. Click the button below to choose a new password. This link expires in 1 hour."}
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #1E3A8A; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">
                            ${isFr ? "Réinitialiser le mot de passe" : "Reset Password"}
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
                        ${isFr
                            ? "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité — votre mot de passe restera inchangé."
                            : "If you didn't request this, you can safely ignore this email — your password will remain unchanged."}
                    </p>

                </div>
            </div>
        `;

        const emailResult = await sendEmail({ to: user.email, subject, html, fromName: agencyName });
        if (emailResult.error) {
            console.error("Password reset email failed to send:", emailResult.error);
            return { error: isFr ? "Impossible d'envoyer l'e-mail pour le moment. Réessayez plus tard." : "Couldn't send the email right now. Please try again later." };
        }

        return { success: true, message: genericMessage };
    } catch (e: any) {
        console.error("Password reset request error:", e);
        return { error: "Something went wrong. Please try again." };
    }
}