import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { auditDetails } from "@/lib/audit-log";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    baseURL:
        process.env.BETTER_AUTH_URL ||
        "http://localhost:3000",

    secret: process.env.BETTER_AUTH_SECRET,

    session: {
        expiresIn: 60 * 60 * 24 * 90,
        updateAge: 60 * 60 * 24 * 1,
    },

    advanced: {
        defaultCookieAttributes: {
            maxAge: 60 * 60 * 24 * 90,
        },
    },

    plugins: [],

    debug: true,

    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },

    emailVerification: {
        sendOnSignUp: false,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }: any) => {
            console.log(
                `[Email Verification] Send to ${user.email}: ${url}`
            );
        },
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "CLIENT",
            },

            agencyId: {
                type: "string",
                required: false,
            },

            mustChangePassword: {
                type: "boolean",
                defaultValue: false,
                required: false,
            },

            status: {
                type: "string",
                defaultValue: "ACTIVE",
            },

            isSuspended: {
                type: "boolean",
                defaultValue: false,
            },

            profileCompleted: {
                type: "boolean",
                defaultValue: false,
            },

            dateOfBirth: {
                type: "date",
                required: false,
            },

            nationality: {
                type: "string",
                required: false,
            },

            maritalStatus: {
                type: "string",
                required: false,
            },

            numberOfChildren: {
                type: "number",
                defaultValue: 0,
                required: false,
            },

            phoneNumber: {
                type: "string",
                required: false,
            },

            profession: {
                type: "string",
                required: false,
            },

            address: {
                type: "string",
                required: false,
            },
        },
    },

    baseHooks: {
        session: {
            create: {
                after: async (session: any) => {
                    if (session.userId) {
                        try {
                            const user =
                                await prisma.user.findUnique({
                                    where: {
                                        id: session.userId,
                                    },
                                });

                            await prisma.auditLog.create({
                                data: {
                                    action: "USER_LOGIN",
                                    details: auditDetails(
                                        "userLoggedIn",
                                        {
                                            name:
                                                user?.name ||
                                                "Unknown User",
                                            email:
                                                user?.email ||
                                                "No Email",
                                        }
                                    ),
                                    userId: session.userId,
                                },
                            });
                        } catch (error) {
                            console.error(
                                "[AUTH_HOOK_ERROR]:",
                                error
                            );
                        }
                    }
                },
            },
        },
    },

    trustedOrigins: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
});