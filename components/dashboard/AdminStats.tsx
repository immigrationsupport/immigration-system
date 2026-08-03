import Link from "next/link";
import { Users, Briefcase, FileText } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminStats() {
    const session = await auth.api.getSession({ headers: await headers() });
    const agencyId = (session?.user as any)?.agencyId;

    if (!agencyId) {
        return null;
    }

    const [totalClients, totalAgents, totalApplications] = await Promise.all([
        prisma.user.count({ where: { role: "CLIENT", agencyId } }),
        prisma.user.count({ where: { role: "AGENT", agencyId } }),
        prisma.application.count({ where: { agencyId } }),
    ]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Clients Card */}
            <Link
                href="/admin/dashboard/clients"
                className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                style={{ borderRadius: "16px" }}
            >
                <div className="p-4 rounded-2xl bg-blue-50 text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-all duration-300">
                    <Users size={26} color="black"/>
                </div>
                <div>
                    <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">Total Clients</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-0.5">{totalClients.toLocaleString()}</h3>
                </div>
            </Link>

            {/* Total Agents Card */}
            <Link
                href="/admin/dashboard/agents"
                className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                style={{ borderRadius: "16px" }}
            >
                <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white transition-all duration-300">
                    <Briefcase size={26} color="black"  />
                </div>
                <div>
                    <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">Total Agents</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-0.5">{totalAgents.toLocaleString()}</h3>
                </div>
            </Link>

            {/* Total Applications Card */}
            <Link
                href="/admin/dashboard/applications"
                className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                style={{ borderRadius: "16px" }}
            >
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-all duration-300">
                    <FileText size={26} color="black"/>
                </div>
                <div>
                    <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">All Applications</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-0.5">{totalApplications.toLocaleString()}</h3>
                </div>
            </Link>
        </div>
    );
}