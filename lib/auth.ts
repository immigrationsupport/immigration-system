import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,

    debug: true,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PLACEHOLDER",
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }: any) => {
            console.log(`[Email Verification] Send to ${user.email}: ${url}`);
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "CLIENT",
            },

            isSuspended: {
                type: "boolean",
                defaultValue: false
            },
            profileCompleted: {
                type: "boolean",
                defaultValue: false
            },
            dateOfBirth: {
                type: "date",
                required: false
            },
            nationality: {
                type: "string",
                required: false
            },
            maritalStatus: {
                type: "string",
                required: false
            },
            numberOfChildren: {
                type: "number",
                defaultValue: 0,
                required: false
            },
            phoneNumber: {
                type: "string",
                required: false
            },
            address: {
                type: "string",
                required: false
            }
        },
    },
    databaseHooks: {
        session: {
            create: {
                after: async (session: any) => {
                    if (session.user) {
                        await prisma.auditLog.create({
                            data: {
                                action: "USER_LOGIN",
                                details: `${session.user.name} (${session.user.email}) logged in.`,
                                userId: session.user.id
                            }
                        });
                    }
                }
            }
        }
    },
    trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
})