import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export const POST = async (req: Request) => {
    try {
        return await handler.POST(req);
    } catch (e: any) {
        console.error("AUTH POST ERROR:", e);
        return new NextResponse(JSON.stringify({ error: e.message || "Internal Server Error", stack: e.stack }), { status: 500 });
    }
};

export const GET = async (req: Request) => {
    try {
        return await handler.GET(req);
    } catch (e: any) {
        console.error("AUTH GET ERROR:", e);
        return new NextResponse(JSON.stringify({ error: e.message || "Internal Server Error", stack: e.stack }), { status: 500 });
    }
};