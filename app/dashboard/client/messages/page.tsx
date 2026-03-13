import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Bell, User, Clock, ShieldAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ClientMessagesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const messages = await prisma.officialMessage.findMany({
        where: { receiverId: session.user.id },
        include: {
            sender: {
                select: { name: true, role: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ color: "#1E3A8A" }}>Official Notifications</h1>
                    <p className="text-gray-500 font-medium mt-1">Formal communications regarding your immigration status and applications.</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#1E3A8A]" />
                    <span className="text-sm font-bold text-[#1E3A8A]">{messages.length} Messages</span>
                </div>
            </div>

            <div className="space-y-4">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <Card key={msg.id} className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden hover:shadow-blue-100/50 transition-shadow">
                            <CardHeader className="bg-white border-b border-gray-50 flex flex-row items-center gap-4 py-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base font-black text-gray-900">{msg.subject}</CardTitle>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            <Clock className="h-3 w-3" />
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-bold text-blue-600">From: {msg.sender.name}</span>
                                        <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">{msg.sender.role}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {msg.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Mail className="h-12 w-12 text-gray-200 mb-4" />
                        <h3 className="text-lg font-black text-gray-900">Your inbox is clear</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">Any official announcements or document requests from your agent will appear here.</p>
                    </div>
                )}
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-4 items-start">
                <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Professional Notice</h4>
                    <p className="text-xs text-amber-800 font-medium leading-relaxed mt-1">
                        These messages are considered official legal communications. Please respond to any requests for information promptly to avoid delays in your application processing.
                    </p>
                </div>
            </div>
        </div>
    );
}
