import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CreateAgentModal from "./create-agent-modal";
import AgentTable from "./agent-table";
import { getTranslations } from "next-intl/server";
import { HelpGuideButton } from "@/components/ui/help-guide-button";

export const dynamic = "force-dynamic";

export default async function ManageAgentsPage() {
    const t = await getTranslations("adminAgents");
    const tHelp = await getTranslations("adminHelpGuides");

    const session = await auth.api.getSession({
        headers: await headers()
    });

    const agencyId = (session?.user as any)?.agencyId;

    if (!agencyId) {
        return (
            <div className="max-w-7xl mx-auto p-8 text-center text-gray-500">
                {t("noAgencyLinked")}
            </div>
        );
    }

    const agents = await prisma.user.findMany({
        where: {
            role: Role.AGENT,
            agencyId
        },
        include: {
            assignedClients: {
                select: {
                    id: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1
                        className="text-2xl font-semibold"
                        style={{ color: "#1E3A8A" }}
                    >
                        {t("pageTitle")}
                    </h1>
                    <HelpGuideButton
                        title={tHelp("createAgentTitle")}
                        description={tHelp("createAgentDescription")}
                        label={tHelp("createAgentHelpLabel")}
                        steps={[
                            { title: tHelp("createAgentStep1Title"), description: tHelp("createAgentStep1Desc") },
                            { title: tHelp("createAgentStep2Title"), description: tHelp("createAgentStep2Desc") },
                            { title: tHelp("createAgentStep3Title"), description: tHelp("createAgentStep3Desc") }
                        ]}
                    />
                </div>

                <CreateAgentModal />
            </div>

            <div className="bg-[#F9FAFB] p-6 lg:p-8 shadow-sm border border-gray-200 rounded-xl">
                <AgentTable agents={agents} />
            </div>
        </div>
    );
}