export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export const POST = async (req: Request) => {
    console.log(`[AUTH-API] POST request to: ${req.url}`);
    try {
        const response = await handler.POST(req);
        console.log(`[AUTH-API] POST Response status: ${response.status}`);
        return response;
    } catch (e: any) {
        console.error("AUTH POST ERROR:", e);
        return new NextResponse(JSON.stringify({ error: e.message || "Internal Server Error", stack: e.stack }), { status: 500 });
    }
};

export const GET = async (req: Request) => {
    console.log(`[AUTH-API] GET request to: ${req.url}`);
    try {
        const response = await handler.GET(req);
        console.log(`[AUTH-API] GET Response status: ${response.status}`);
        return response;
    } catch (e: any) {
        console.error("AUTH GET ERROR:", e);
        return new NextResponse(JSON.stringify({ error: e.message || "Internal Server Error", stack: e.stack }), { status: 500 });
    }
};