import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "@/lib/auth";

// Create the next-intl locale routing middleware
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip entirely for API routes and static assets
    if (pathname.startsWith("/api") || pathname.includes(".")) {
        return NextResponse.next();
    }

    // The /admin section lives outside the [locale] route tree (app/admin/...,
    // not app/[locale]/admin/...), so it must never be handed off to the
    // next-intl middleware — that middleware defaults to localePrefix "always"
    // and would redirect e.g. /admin/login -> /en/admin/login, a route that
    // doesn't exist, which is why every /admin route was unreachable.
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

    // Strip leading locale prefix to get the "bare" pathname for auth checks
    // e.g. /en/dashboard/client -> /dashboard/client
    const localePattern = /^\/(en|fr)(\/|$)/;
    const barePathname = pathname.replace(localePattern, "/");

    // ── AUTH GUARD ──────────────────────────────────────────────────
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: request.headers,
        });
    } catch (e) {
        console.error("[Middleware] getSession error:", e);
    }

    const url = request.nextUrl.clone();
    const publicAdminRoutes = ["/admin/login", "/admin/register"];

    if (!session) {
        const protectedPaths = ["/admin", "/dashboard", "/complete-profile", "/applications"];
        const needsAuth = protectedPaths.some(p => barePathname.startsWith(p));

        if (needsAuth) {
            if (publicAdminRoutes.includes(barePathname)) {
                // /admin isn't part of the [locale] tree — don't let next-intl
                // redirect it to a locale-prefixed URL that doesn't exist.
                return NextResponse.next();
            }
            url.pathname = `/sign-in`;
            return NextResponse.redirect(url);
        }
        // Not protected — let next-intl handle locale routing (skip for /admin)
        return isAdminRoute ? NextResponse.next() : intlMiddleware(request);
    }

    const { role, profileCompleted, isSuspended, status } = session.user as any;
    const userRole = (role || "CLIENT").toUpperCase();

    if (isSuspended && barePathname !== "/sign-in") {
        url.pathname = `/sign-in`;
        url.searchParams.set("suspended", "true");
        return NextResponse.redirect(url);
    }

    if (userRole === "CLIENT" && !profileCompleted && barePathname !== "/complete-profile") {
        url.pathname = `/complete-profile`;
        return NextResponse.redirect(url);
    }

    if (userRole === "CLIENT" && status === "PENDING") {
        const restrictedPaths = [
            "/dashboard/client/submit-application",
            "/applications/new",
            "/dashboard/client/applications/new",
        ];
        if (restrictedPaths.some(p => barePathname.startsWith(p))) {
            url.pathname = `/dashboard/client`;
            url.searchParams.set("restricted", "true");
            return NextResponse.redirect(url);
        }
    }

    if (barePathname.startsWith("/admin") && !publicAdminRoutes.includes(barePathname)) {
        if (userRole !== "ADMIN") {
            url.pathname = `/dashboard`;
            return NextResponse.redirect(url);
        }
    }

    if (barePathname.startsWith("/dashboard/agent")) {
        if (userRole !== "AGENT" && userRole !== "ADMIN") {
            url.pathname = `/dashboard`;
            return NextResponse.redirect(url);
        }
    }

    if (barePathname === "/complete-profile" && profileCompleted) {
        url.pathname = `/dashboard`;
        return NextResponse.redirect(url);
    }

    // All auth checks passed — let next-intl finalize locale routing
    // (skip for /admin, which isn't part of the [locale] tree)
    return isAdminRoute ? NextResponse.next() : intlMiddleware(request);
}

export const config = {
    matcher: [
        "/",
        "/(en|fr)/:path*",
        "/((?!api|_next|_vercel|.*\\..*).*)",
    ],
};