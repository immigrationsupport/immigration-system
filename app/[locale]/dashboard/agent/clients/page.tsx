import { Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import NewClientButton from "./new-client-button";
import AgentClientTable from "./agent-client-table";
import { getTranslations } from "next-intl/server";

export default async function AssignedClientsPage() {
    const t = await getTranslations("clients");

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return null;
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const agencyId = (session.user as any).agencyId;

    if (isAdmin && !agencyId) {
        return null;
    }

    const clients = await prisma.user.findMany({
        where: isAdmin
            ? {
                  role: "CLIENT",
                  agencyId
              }
            : {
                  role: "CLIENT",
                  agentId: session.user.id
              },
        include: {
            applications: {
                orderBy: {
                    updatedAt: "desc"
                },
                take: 1,
                include: {
                    template: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    documents: true
                }
            }
        },
        orderBy: {
            name: "asc"
        }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1
                        className="text-2xl font-semibold"
                        style={{ color: "#1E3A8A" }}
                    >
                        {isAdmin
                            ? t("allClients")
                            : t("assignedClients")}
                    </h1>

                    <p className="text-gray-500 mt-1">
                        {isAdmin
                            ? t("manageAllAgency")
                            : t("subtitle")}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                        <Users className="h-5 w-5 text-[#1E3A8A]" />

                        <span className="font-bold text-[#1E3A8A]">
                            {clients.length} {t("activeClients")}
                        </span>
                    </div>

                    <NewClientButton isAgent={!isAdmin} />
                </div>
            </div>

            <div className="bg-[#F9FAFB] shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-gray-200">
                    <h2 className="flex items-center gap-3 text-xl font-extrabold text-[#1E3A8A]">
                        <Users className="h-6 w-6" />
                        {t("myClients")}
                    </h2>
                </div>

                <div className="p-6 lg:p-8">
                    <AgentClientTable clients={clients} />
                </div>
            </div>
        </div>
    );
}