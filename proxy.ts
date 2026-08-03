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
    // /super-admin is also outside the [locale] tree, same reasoning as /admin above.
    const isSuperAdminRoute = pathname === "/super-admin" || pathname.startsWith("/super-admin/");
    const isOutsideLocaleTree = isAdminRoute || isSuperAdminRoute;

    // Strip leading locale prefix to get the "bare" pathname for auth checks
    // e.g. /en/dashboard/client -> /dashboard/client
    const localePattern = /^\/(en|fr)(\/|$)/;
    const barePathname = pathname.replace(localePattern, "/");

    const url = request.nextUrl.clone();

    // Redirect root URL and public landing pages directly to Login page
    const landingRoutes = ["/", "/about", "/services", "/contact"];
    if (landingRoutes.includes(barePathname)) {
        const localeMatch = pathname.match(/^\/(en|fr)/);
        const localePrefix = localeMatch ? localeMatch[0] : "";
        url.pathname = `${localePrefix}/sign-in`;
        return NextResponse.redirect(url);
    }

    // ── AUTH GUARD ──────────────────────────────────────────────────
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: request.headers,
        });
    } catch (e) {
        console.error("[Middleware] getSession error:", e);
    }

    const publicAdminRoutes = ["/admin/login", "/admin/register", "/super-admin/login"];

    if (!session) {
        const protectedPaths = ["/admin", "/super-admin", "/dashboard", "/complete-profile", "/applications"];
        const needsAuth = protectedPaths.some(p => barePathname.startsWith(p));

        if (needsAuth) {
            if (publicAdminRoutes.includes(barePathname)) {
                // /admin and /super-admin aren't part of the [locale] tree — don't
                // let next-intl redirect them to a locale-prefixed URL that doesn't exist.
                return NextResponse.next();
            }
            url.pathname = `/sign-in`;
            return NextResponse.redirect(url);
        }
        // Not protected — let next-intl handle locale routing (skip for /admin, /super-admin)
        return isOutsideLocaleTree ? NextResponse.next() : intlMiddleware(request);
    }

    const { role, profileCompleted, isSuspended, status } = session.user as any;
    const userRole = (role || "CLIENT").toUpperCase();

    if (isSuspended && barePathname !== "/sign-in") {
        url.pathname = `/sign-in`;
        url.searchParams.set("suspended", "true");
        return NextResponse.redirect(url);
    }

    const { mustChangePassword } = session.user as any;
    if (mustChangePassword && barePathname !== "/change-password") {
        url.pathname = `/change-password`;
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

    if (barePathname.startsWith("/super-admin") && !publicAdminRoutes.includes(barePathname)) {
        if (userRole !== "SUPER_ADMIN") {
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

    if (barePathname === "/change-password" && !mustChangePassword) {
        url.pathname = `/dashboard`;
        return NextResponse.redirect(url);
    }

    // All auth checks passed — let next-intl finalize locale routing
    // (skip for /admin and /super-admin, which aren't part of the [locale] tree)
    return isOutsideLocaleTree ? NextResponse.next() : intlMiddleware(request);
}

export const config = {
    matcher: [
        "/",
        "/(en|fr)/:path*",
        "/((?!api|_next|_vercel|.*\\..*).*)",
    ],
};