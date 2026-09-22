import { sendEmail } from "@/lib/resend";

const SYSTEM_URL = process.env.NEXT_PUBLIC_APP_URL || "https://procedure-facile.com";

/**
 * Send welcome email to a newly created client via Resend.
 */
export async function sendClientWelcomeEmail({
    clientEmail,
    clientName,
    password,
}: {
    clientEmail: string;
    clientName: string;
    password?: string;
}) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #1E3A8A; padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Bienvenue sur Procédure Facile</h1>
                <p style="color: #93c5fd; margin: 8px 0 0; font-size: 14px;">Votre espace d'accompagnement immigration</p>
            </div>
            <div style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                <p style="margin-top: 0;">Bonjour <strong>${clientName}</strong>,</p>
                <p>Votre compte a été créé avec succès sur notre plateforme <strong>Procédure Facile</strong>.</p>
                <p>Vous pouvez dès à présent accéder à votre espace client pour suivre l'avancement de votre dossier, soumettre des documents et communiquer avec votre conseiller.</p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #1E3A8A;">Vos identifiants d'accès :</p>
                    <p style="margin: 4px 0;"><strong>Email :</strong> ${clientEmail}</p>
                    ${password ? `<p style="margin: 4px 0;"><strong>Mot de passe :</strong> ${password}</p>` : ""}
                    <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><em>Note : Vous pourrez modifier votre mot de passe après la première connexion.</em></p>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="${SYSTEM_URL}" style="background-color: #1E3A8A; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Accéder à mon espace client
                    </a>
                </div>

                <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
                    Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :<br/>
                    <a href="${SYSTEM_URL}" style="color: #1E3A8A;">${SYSTEM_URL}</a>
                </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                &copy; ${new Date().getFullYear()} Procédure Facile. Tous droits réservés.
            </div>
        </div>
    `;

    const result = await sendEmail({
        to: clientEmail,
        subject: "Bienvenue sur Procédure Facile – Vos identifiants d'accès",
        html,
        fromName: "Procédure Facile",
    });

    if (result.error) {
        console.error("[Email] Failed to send client welcome email:", result.error);
    } else {
        console.log(`[Email] Welcome email sent to ${clientEmail}`);
    }

    return result;
}

/**
 * Send welcome email to a newly created agent via Resend. Mirrors
 * sendClientWelcomeEmail above — agents were being created silently with
 * no notification while clients always got one.
 */
export async function sendAgentWelcomeEmail({
    agentEmail,
    agentName,
    password,
}: {
    agentEmail: string;
    agentName: string;
    password?: string;
}) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #1E3A8A; padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Bienvenue sur Procédure Facile</h1>
                <p style="color: #93c5fd; margin: 8px 0 0; font-size: 14px;">Votre espace agent</p>
            </div>
            <div style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                <p style="margin-top: 0;">Bonjour <strong>${agentName}</strong>,</p>
                <p>Un compte agent a été créé pour vous sur la plateforme <strong>Procédure Facile</strong>.</p>
                <p>Vous pouvez dès à présent accéder à votre espace agent pour gérer vos clients et suivre l'avancement de leurs dossiers.</p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #1E3A8A;">Vos identifiants d'accès :</p>
                    <p style="margin: 4px 0;"><strong>Email :</strong> ${agentEmail}</p>
                    ${password ? `<p style="margin: 4px 0;"><strong>Mot de passe :</strong> ${password}</p>` : ""}
                    <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><em>Note : Vous pourrez modifier votre mot de passe après la première connexion.</em></p>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="${SYSTEM_URL}" style="background-color: #1E3A8A; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Accéder à mon espace agent
                    </a>
                </div>

                <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
                    Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :<br/>
                    <a href="${SYSTEM_URL}" style="color: #1E3A8A;">${SYSTEM_URL}</a>
                </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                &copy; ${new Date().getFullYear()} Procédure Facile. Tous droits réservés.
            </div>
        </div>
    `;

    const result = await sendEmail({
        to: agentEmail,
        subject: "Bienvenue sur Procédure Facile – Vos identifiants d'accès",
        html,
        fromName: "Procédure Facile",
    });

    if (result.error) {
        console.error("[Email] Failed to send agent welcome email:", result.error);
    } else {
        console.log(`[Email] Welcome email sent to ${agentEmail}`);
    }

    return result;
}

/**
 * Send notification email when a new agency is created.
 * Sends to immigrationsupport106@gmail.com and contact@procedure-facile.com
 */
export async function sendAgencyCreatedNotificationEmail({
    agencyName,
    adminName,
    adminEmail,
}: {
    agencyName: string;
    adminName: string;
    adminEmail: string;
}) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #1E3A8A; padding: 32px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold;">Nouvelle Agence Créée</h1>
                <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Notification d'inscription partenaire — Procédure Facile</p>
            </div>
            <div style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                <p>Une nouvelle agence a été enregistrée sur le système Procédure Facile.</p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold; width: 140px;">Nom de l'Agence:</td>
                            <td style="padding: 8px 0; font-size: 15px; color: #0f172a; font-weight: bold;">${agencyName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold;">Administrateur:</td>
                            <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">${adminName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold;">Email Admin:</td>
                            <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">
                                <a href="mailto:${adminEmail}" style="color: #1E3A8A;">${adminEmail}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold;">Date de création:</td>
                            <td style="padding: 8px 0; font-size: 14px; color: #0f172a;">${new Date().toLocaleString("fr-FR")}</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin: 28px 0;">
                    <a href="${SYSTEM_URL}" style="background-color: #1E3A8A; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                        Accéder au système
                    </a>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                Procédure Facile — Notification Système Automatique
            </div>
        </div>
    `;

    const result = await sendEmail({
        to: ["immigrationsupport106@gmail.com", "contact@procedure-facile.com"],
        subject: `[Procédure Facile] Nouvelle Agence créée : ${agencyName}`,
        html,
        fromName: "Procédure Facile System",
    });

    if (result.error) {
        console.error("[Email] Failed to send agency creation notification:", result.error);
    } else {
        console.log(`[Email] Agency notification sent for agency: ${agencyName}`);
    }

    return result;
}