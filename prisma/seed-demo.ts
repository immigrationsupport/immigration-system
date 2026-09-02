import "dotenv/config";
import prisma from "../lib/prisma";
import { hashPassword } from "better-auth/crypto";


const DEMO_PASSWORD = "Demo2026!";

const STEP_LABELS: Record<string, string> = {
    REGISTRATION: "Registration",
    CONTRACT_SIGNING: "Contract Signing",
    FEE_PAYMENT: "Fee Payment",
    DOCUMENT_COLLECTION: "Document Collection",
    DIPLOMA_EQUIVALENCE: "Diploma Equivalence",
    LANGUAGE_TEST_REGISTRATION: "Language Test Registration",
    LANGUAGE_TEST_RESULTS: "Language Test Results",
    PROFILE_CREATION: "Profile Creation",
    APPLICATION_SUBMISSION: "Application Submission",
    MEDICAL_EXAMINATION: "Medical Examination",
    PASSPORT_SUBMISSION: "Passport Submission & Visa Processing"
};
const STEP_TYPES = Object.keys(STEP_LABELS);

const CLIENT_NAMES = [
    "Marie Ngo Bidjo", "Jean-Paul Fotso", "Aïcha Moussa", "Bernard Ateba",
    "Sandrine Ekwalla", "Christian Mballa", "Fatima Njoya", "Serge Tchamba",
    "Odile Kamga", "Hervé Nguemo"
];

const AGENT_NAME = "Steve Ondoa";
const ADMIN_NAME = "Paul Barga";
const AGENCY_NAME = "Objectif Canada";

async function main() {
    console.log("🌱 Création des données de démonstration pour", AGENCY_NAME);

    const hashed = await hashPassword(DEMO_PASSWORD);

    // 1. Agence
    const agency = await prisma.agency.upsert({
        where: { id: "demo-objectif-canada" },
        update: {},
        create: {
            id: "demo-objectif-canada",
            name: AGENCY_NAME,
            email: "contact@objectifcanada.cm",
            phone: "+237 6 90 00 00 00",
            address: "Yaoundé, Cameroun",
            status: "ACTIVE",
            isInternal: false
        }
    });

    // 2. Plan + Abonnement (pour que la page Billing soit garnie aussi)
    const plan = await prisma.plan.upsert({
        where: { slug: "standard" },
        update: {},
        create: {
            name: "Standard",
            slug: "standard",
            priceFcfa: 150000,
            maxAgents: 5,
            maxClients: 50,
            isPublic: true
        }
    });

    const subscription = await prisma.subscription.upsert({
        where: { agencyId: agency.id },
        update: {},
        create: {
            agencyId: agency.id,
            planId: plan.id,
            status: "ACTIVE",
            autoRenew: true,
            currentPeriodEnd: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000)
        }
    });

    // Historique de paiement (pour la page Billing)
    await prisma.payment.createMany({
        data: [
            {
                subscriptionId: subscription.id,
                amountFcfa: 150000,
                method: "MTN_MOBILE_MONEY",
                status: "SUCCESS",
                reference: "DEMO-PAY-001"
            },
            {
                subscriptionId: subscription.id,
                amountFcfa: 150000,
                method: "ORANGE_MONEY",
                status: "SUCCESS",
                reference: "DEMO-PAY-002"
            }
        ],
        skipDuplicates: true
    });

    // 3. Admin
    const admin = await prisma.user.upsert({
        where: { email: "admin@objectifcanada.cm" },
        update: {},
        create: {
            name: ADMIN_NAME,
            email: "admin@objectifcanada.cm",
            role: "ADMIN",
            status: "ACTIVE",
            emailVerified: true,
            agencyId: agency.id,
            password: hashed,
            accounts: {
                create: { providerId: "credential", accountId: "admin@objectifcanada.cm", password: hashed }
            }
        }
    });

    // 4. Agent
    const agent = await prisma.user.upsert({
        where: { email: "agent@objectifcanada.cm" },
        update: {},
        create: {
            name: AGENT_NAME,
            email: "agent@objectifcanada.cm",
            role: "AGENT",
            status: "ACTIVE",
            emailVerified: true,
            agencyId: agency.id,
            password: hashed,
            accounts: {
                create: { providerId: "credential", accountId: "agent@objectifcanada.cm", password: hashed }
            }
        }
    });

    // 5. Workflow standard (11 étapes)
    let template = await prisma.applicationTemplate.findFirst({
        where: { agencyId: agency.id, name: "Standard PR - Canada" }
    });
    if (!template) {
        template = await prisma.applicationTemplate.create({
            data: {
                agencyId: agency.id,
                name: "Standard PR - Canada",
                description: "Workflow standard pour les résidences permanentes.",
                steps: {
                    create: STEP_TYPES.map((type, index) => ({
                        type: type as any,
                        label: STEP_LABELS[type],
                        order: index
                    }))
                }
            }
        });
    }

    // 6. 10 clients
    const clients = [];
    for (let i = 0; i < CLIENT_NAMES.length; i++) {
        const name = CLIENT_NAMES[i];
        const email = `client${i + 1}@objectifcanada.cm`;
        const isAssigned = i < 8; // 8 avec agent, 2 sans (réalisme)

        const client = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                name,
                email,
                role: "CLIENT",
                status: "ACTIVE",
                emailVerified: true,
                agencyId: agency.id,
                agentId: isAssigned ? agent.id : null,
                nationality: "Camerounaise",
                phoneNumber: `+237 6${70 + i} 00 00 0${i}`,
                password: hashed,
                mustChangePassword: true,
                accounts: {
                    create: { providerId: "credential", accountId: email, password: hashed }
                }
            }
        });
        clients.push(client);
    }

    // 7. Procédures : 4 "en cours" + 3 autres statuts pour la variété
    const templateSteps = await prisma.stepTemplate.findMany({
        where: { applicationTemplateId: template.id },
        orderBy: { order: "asc" }
    });

    const countries = ["Canada", "Canada", "Canada", "Canada", "Canada", "Canada", "Canada"];
    const progressPlan = [
        { clientIdx: 0, status: "IN_PROGRESS", approvedCount: 3 },
        { clientIdx: 1, status: "IN_PROGRESS", approvedCount: 5 },
        { clientIdx: 2, status: "IN_PROGRESS", approvedCount: 2 },
        { clientIdx: 3, status: "IN_PROGRESS", approvedCount: 7 },
        { clientIdx: 4, status: "COMPLETED", approvedCount: 11 },
        { clientIdx: 5, status: "PENDING", approvedCount: 0 },
        { clientIdx: 6, status: "REJECTED", approvedCount: 1 }
    ];

    const createdApplications = [];
    for (let i = 0; i < progressPlan.length; i++) {
        const plan_ = progressPlan[i];
        const client = clients[plan_.clientIdx];

        const app = await prisma.application.create({
            data: {
                country: countries[i],
                type: "PR",
                clientId: client.id,
                agentId: agent.id,
                agencyId: agency.id,
                applicationTemplateId: template.id,
                status: plan_.status as any,
                steps: {
                    create: templateSteps.map((s, idx) => ({
                        type: s.type,
                        label: s.label,
                        order: idx,
                        status: idx < plan_.approvedCount ? "APPROVED" : idx === plan_.approvedCount ? "IN_PROGRESS" : "PENDING",
                        isLocked: idx > plan_.approvedCount,
                        description: idx < plan_.approvedCount ? "Automatiquement vérifié." : null
                    }))
                }
            },
            include: { steps: true }
        });
        createdApplications.push(app);
    }

    // 8. Quelques documents réalistes sur les procédures les plus avancées
    const docNames = ["Passeport.pdf", "Certificat_Naissance.pdf", "Diplome.pdf", "CV.pdf"];
    for (const app of createdApplications.slice(0, 3)) {
        const docStep = app.steps.find((s) => s.type === "DOCUMENT_COLLECTION");
        if (docStep) {
            for (const docName of docNames.slice(0, 2)) {
                await prisma.document.create({
                    data: {
                        name: docName,
                        fileUrl: "https://example.com/demo/" + docName,
                        type: docName.includes("Passeport") ? "PASSPORT" : "OTHER",
                        status: "VERIFIED",
                        procedureId: docStep.id,
                        uploaderId: agent.id
                    }
                });
            }
        }
    }

    // 9. Journal d'activité — pour que "Activité Récente" et "Journaux Système" soient garnis
    const now = Date.now();
    const activityLog: { action: string; details: string; hoursAgo: number; userId?: string }[] = [
        { action: "CREATE_CLIENT", details: `Client ${clients[0].name} créé par Admin ${ADMIN_NAME}.`, hoursAgo: 96, userId: admin.id },
        { action: "CREATE_CLIENT", details: `Client ${clients[1].name} créé par Admin ${ADMIN_NAME}.`, hoursAgo: 90, userId: admin.id },
        { action: "CREATE_APPLICATION", details: `Procédure (Standard PR - Canada) créée pour ${clients[0].name} par ${AGENT_NAME}.`, hoursAgo: 88, userId: agent.id },
        { action: "DOCUMENT_UPLOAD", details: `${AGENT_NAME} a téléversé "Passeport.pdf" pour l'étape Document Collection de ${clients[0].name}.`, hoursAgo: 70, userId: agent.id },
        { action: "STEP_UPDATE", details: `Agent ${AGENT_NAME} a mis à jour l'étape REGISTRATION (statut: APPROVED).`, hoursAgo: 65, userId: agent.id },
        { action: "CREATE_CLIENT", details: `Client ${clients[2].name} créé par Admin ${ADMIN_NAME}.`, hoursAgo: 60, userId: admin.id },
        { action: "STEP_UPDATE", details: `Agent ${AGENT_NAME} a mis à jour l'étape CONTRACT_SIGNING (statut: APPROVED).`, hoursAgo: 48, userId: agent.id },
        { action: "DOCUMENT_UPLOAD", details: `${AGENT_NAME} a téléversé "Diplome.pdf" pour l'étape Document Collection de ${clients[1].name}.`, hoursAgo: 40, userId: agent.id },
        { action: "CREATE_APPLICATION", details: `Procédure (Standard PR - Canada) créée pour ${clients[3].name} par ${AGENT_NAME}.`, hoursAgo: 36, userId: agent.id },
        { action: "STEP_UPDATE", details: `Agent ${AGENT_NAME} a mis à jour l'étape FEE_PAYMENT (statut: APPROVED).`, hoursAgo: 30, userId: agent.id },
        { action: "CREATE_CLIENT", details: `Client ${clients[3].name} créé par Admin ${ADMIN_NAME}.`, hoursAgo: 24, userId: admin.id },
        { action: "UPGRADE_SUBSCRIPTION", details: `Agence a mis à niveau vers le plan "Standard" (150 000 FCFA) via MTN_MOBILE_MONEY.`, hoursAgo: 20 },
        { action: "STEP_UPDATE", details: `Agent ${AGENT_NAME} a mis à jour l'étape DOCUMENT_COLLECTION (statut: APPROVED).`, hoursAgo: 15, userId: agent.id },
        { action: "DOCUMENT_UPLOAD", details: `${AGENT_NAME} a téléversé "CV.pdf" pour l'étape Document Collection de ${clients[3].name}.`, hoursAgo: 10, userId: agent.id },
        { action: "STEP_UPDATE", details: `Agent ${AGENT_NAME} a mis à jour l'étape DIPLOMA_EQUIVALENCE (statut: IN_PROGRESS).`, hoursAgo: 6, userId: agent.id },
        { action: "CREATE_CLIENT", details: `Client ${clients[4].name} créé par Admin ${ADMIN_NAME}.`, hoursAgo: 4, userId: admin.id },
        { action: "STEP_UPDATE", details: `Agent ${AGENT_NAME} a approuvé l'étape finale (PASSPORT_SUBMISSION) pour ${clients[4].name}.`, hoursAgo: 2, userId: agent.id }
    ];

    for (const entry of activityLog) {
        await prisma.auditLog.create({
            data: {
                action: entry.action,
                details: entry.details,
                userId: entry.userId,
                agencyId: agency.id,
                createdAt: new Date(now - entry.hoursAgo * 60 * 60 * 1000)
            }
        });
    }

    console.log("");
    console.log("✅ Données de démonstration créées !");
    console.log("");
    console.log("Agence :", AGENCY_NAME);
    console.log("Connexion Admin  → admin@objectifcanada.cm / " + DEMO_PASSWORD);
    console.log("Connexion Agent  → agent@objectifcanada.cm / " + DEMO_PASSWORD);
    console.log("10 clients créés, emails : client1@objectifcanada.cm à client10@objectifcanada.cm / " + DEMO_PASSWORD);
    console.log("7 procédures créées (4 en cours, 1 terminée, 1 en attente, 1 rejetée)");
    console.log("17 entrées dans le journal d'activité, étalées sur les 4 derniers jours");
}

main()
    .catch((e) => {
        console.error("❌ Erreur:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });