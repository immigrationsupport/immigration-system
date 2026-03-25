import "dotenv/config";
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'
import { multiSession } from "better-auth/plugins"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    /*
    plugins: [
        multiSession({
            maximumSessions: 5,
        })
    ],
    */

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
            status: {
                type: "string",
                defaultValue: "PENDING",
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
    baseHooks: {
        session: {
            create: {
                after: async (session: any) => {
                    // Better-Auth hooks usually pass the session object which has userId
                    if (session.userId) {
                        try {
                            // 1. Fetch the actual user to get the 'name'
                            const user = await prisma.user.findUnique({ 
                                where: { id: session.userId } 
                            });

                            
                            await prisma.auditLog.create({
                                data: {
                                    action: "USER_LOGIN",
                                    details: `${user?.name || 'Unknown User'} (${user?.email || 'No Email'}) logged in.`,
                                    userId: session.userId
                                }
                            });

                        } catch (error) {
                            console.error("[AUTH_HOOK_ERROR]:", error);
                        }
                    }
                }
            }
        }

    },
    trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
})