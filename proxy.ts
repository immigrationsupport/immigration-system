import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip auth for API routes and public assets
    if (pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    let session = null;
    try {
        const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });
        if (sessionResponse.ok) {
            session = await sessionResponse.json();
        }
    } catch (e) {
        console.error("[Middleware] Fetch session error:", e);
    }

    const url = request.nextUrl.clone();
    const publicAdminRoutes = ["/admin/login", "/admin/register"];

    if (!session) {
        if (pathname.startsWith("/admin") ||
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/complete-profile") ||
            pathname.startsWith("/applications")) {

            if (publicAdminRoutes.includes(pathname)) {
                return NextResponse.next();
            }

            url.pathname = `/sign-in`;
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    const { role, profileCompleted, isSuspended, status } = session.user as any;
    const userRole = (role || "CLIENT").toUpperCase();

    if (isSuspended && pathname !== "/sign-in") {
        url.pathname = `/sign-in`;
        url.searchParams.set("suspended", "true");
        return NextResponse.redirect(url);
    }

    if (userRole === "CLIENT" && !profileCompleted && pathname !== "/complete-profile") {
        url.pathname = `/complete-profile`;
        return NextResponse.redirect(url);
    }

    if (userRole === "CLIENT" && status === "PENDING") {
        const restrictedPaths = ["/dashboard/client/submit-application", "/applications/new", "/dashboard/client/applications/new"];
        if (restrictedPaths.some(p => pathname.startsWith(p))) {
            url.pathname = `/dashboard/client`;
            url.searchParams.set("restricted", "true");
            return NextResponse.redirect(url);
        }
    }

    if (pathname.startsWith("/admin") && !publicAdminRoutes.includes(pathname)) {
        if (userRole !== "ADMIN") {
            url.pathname = `/dashboard`;
            return NextResponse.redirect(url);
        }
    }

    if (pathname.startsWith("/dashboard/agent")) {
        if (userRole !== "AGENT" && userRole !== "ADMIN") {
            url.pathname = `/dashboard`;
            return NextResponse.redirect(url);
        }
    }

    if (pathname === "/complete-profile" && profileCompleted) {
        url.pathname = `/dashboard`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/((?!api|_next|_vercel|.*\\..*).*)",
    ],
};