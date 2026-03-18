import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
    let session = null;
    try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });
        if (response.ok) {
            session = await response.json();
        }
    } catch (e) {
        console.error("[Middleware] Fetch session error:", e);
    }

    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    console.log(`[Middleware] Path: ${pathname}, Session: ${!!session}`);
    if (session && session.user) {
        console.log(`[Middleware] User: ${JSON.stringify(session.user)}`);
    }

    // Allow public admin routes
    const publicAdminRoutes = ["/admin/login", "/admin/register"];
    if (publicAdminRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // 1. If no session, allow access to landing pages / sign-in / sign-up
    if (!session) {
        if (pathname.startsWith("/admin") ||
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/complete-profile") ||
            pathname.startsWith("/applications")) {

            // Allow /admin/login though it starts with /admin
            if (publicAdminRoutes.includes(pathname)) {
                return NextResponse.next();
            }

            url.pathname = "/sign-in";
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    const { role, profileCompleted, isSuspended } = session.user as any;
    const userRole = (role || "CLIENT").toUpperCase();

    // 2. Suspension Check
    if (isSuspended && pathname !== "/sign-in") {
        url.pathname = "/sign-in";
        url.searchParams.set("suspended", "true");
        return NextResponse.redirect(url);
    }

    // 3. Profile Completion Check (Only for CLIENT role)
    if (userRole === "CLIENT" && !profileCompleted && pathname !== "/complete-profile" && !pathname.startsWith("/api")) {
        url.pathname = "/complete-profile";
        return NextResponse.redirect(url);
    }

    // 4. Role-based Protections
    // Protect /admin routes (except public ones)
    if (pathname.startsWith("/admin") && !publicAdminRoutes.includes(pathname)) {
        if (userRole !== "ADMIN") {
            console.log(`[Middleware] Redirecting ${userRole} away from admin: ${pathname}`);
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    // Protect /dashboard/agent routes
    if (pathname.startsWith("/dashboard/agent")) {
        if (userRole !== "AGENT" && userRole !== "ADMIN") {
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    // 5. If they are already on /complete-profile but actually completed it
    if (pathname === "/complete-profile" && profileCompleted) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/complete-profile",
        "/applications/:path*",
    ],
};