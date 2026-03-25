import { inferAdditionalFields, multiSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { auth } from './auth'

export const { signIn, signUp, signOut, useSession } = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
    plugins: [
        inferAdditionalFields<typeof auth>(),
        // multiSessionClient()
    ]
})