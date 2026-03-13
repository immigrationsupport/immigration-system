import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { fullName, email, phone, message } = await req.json();

        if (!fullName || !email || !message) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key_here") {
            console.error("[Contact API] RESEND_API_KEY not configured in .env");
            return NextResponse.json(
                { error: "Email service not configured. Please use a valid RESEND_API_KEY." },
                { status: 503 }
            );
        }

        const { error } = await resend.emails.send({
            from: "ATLE Immigration <onboarding@resend.dev>",
            to: ["emlieag573@gmail.com"],
            replyTo: email,
            subject: `New Inquiry from ${fullName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1E3A8A; padding: 24px 32px;">
                        <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Inquiry</h1>
                        <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">ATLE Immigration — Contact Form</p>
                    </div>
                    <div style="padding: 32px; background: white;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; font-size: 13px; color: #6b7280; font-weight: 600; width: 130px; border-bottom: 1px solid #f1f5f9;">Full Name</td>
                                <td style="padding: 10px 0; font-size: 14px; color: #111827; border-bottom: 1px solid #f1f5f9;">${fullName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Email</td>
                                <td style="padding: 10px 0; font-size: 14px; color: #111827; border-bottom: 1px solid #f1f5f9;">
                                    <a href="mailto:${email}" style="color: #1E3A8A;">${email}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Phone</td>
                                <td style="padding: 10px 0; font-size: 14px; color: #111827;">${phone || "Not provided"}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 13px; color: #6b7280; font-weight: 600; margin: 0 0 10px;">Message</p>
                            <p style="font-size: 14px; color: #111827; line-height: 1.7; margin: 0; white-space: pre-wrap; background: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0;">${message}</p>
                        </div>
                    </div>
                    <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                            Sent from the ATLE Immigration contact form. Hit Reply to respond directly to ${fullName}.
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error("[Contact API] Resend error:", error);
            return NextResponse.json(
                { error: "Failed to send your message. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err: any) {
        console.error("[Contact API] Unexpected error:", err?.message || err);
        return NextResponse.json(
            { error: "Something went wrong. Please email us directly at emlieag573@gmail.com" },
            { status: 500 }
        );
    }
}

