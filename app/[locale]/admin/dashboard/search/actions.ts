"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Groq from "groq-sdk";
import { searchClients, searchAgents, searchApplications, getClientDetails } from "@/lib/ai-search-tools";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "search_clients",
            description: "Search for clients by name, email, or phone number within this agency.",
            parameters: {
                type: "object",
                properties: { query: { type: "string", description: "Name, email, or phone to search for" } },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_agents",
            description: "Search for agents by name within this agency.",
            parameters: {
                type: "object",
                properties: { query: { type: "string" } },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_applications",
            description: "Search applications, optionally filtered by client name, status, or destination country.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Client name to filter by (optional)" },
                    status: { type: "string", description: "e.g. PENDING, IN_PROGRESS, APPROVED, REJECTED, COMPLETED (optional)" },
                    country: { type: "string", description: "Destination country (optional)" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_client_details",
            description: "Get full details for one specific client, including all their applications and steps.",
            parameters: {
                type: "object",
                properties: { clientId: { type: "string" } },
                required: ["clientId"]
            }
        }
    }
];

async function runTool(name: string, input: any, agencyId: string) {
    switch (name) {
        case "search_clients": return searchClients(agencyId, input.query);
        case "search_agents": return searchAgents(agencyId, input.query);
        case "search_applications": return searchApplications(agencyId, input.query, input.status, input.country);
        case "get_client_details": return getClientDetails(agencyId, input.clientId);
        default: return { error: "Unknown tool" };
    }
}

export interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

export interface ToolResultPayload {
    tool: string;
    result: any;
}

export async function aiSearchAction(userQuery: string, history: ChatTurn[] = []) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }
    const agencyId = (session.user as any).agencyId;
    if (!agencyId) return { error: "Your account is not linked to an agency." };

    if (!process.env.GROQ_API_KEY) {
        return { error: "AI search is not configured." };
    }

    try {
        const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `You are a helpful assistant for an immigration agency's admin dashboard. Always reply in the SAME language the admin used — if they wrote in French, reply in French; if in English, reply in English.

IMPORTANT LOCALIZED UI TERMINOLOGY:
When replying in French, ALWAYS use the EXACT French labels as they appear in the UI:
- Sidebar Menus:
  • Overview → « Vue d'ensemble »
  • Manage Agents → « Gérer les agents »
  • Manage Clients → « Gérer les clients »
  • All Procedures → « Toutes les procédures »
  • Procedure Steps → « Étapes de procédure »
  • Documents Monitoring → « Suivi des documents »
  • System Logs → « Journaux système »
  • Billing → « Facturation »
  • System Settings → « Paramètres système »
- Buttons & Actions:
  • New Workflow / Create Workflow → « Nouveau workflow »
  • Create Agent → « Créer un agent »
  • Create Client → « Créer un client »
  • New Procedure → « Nouvelle procédure »
  • Finalize Procedure → « Finaliser la procédure »

When replying in English, use the exact English UI labels:
- « Overview », « Manage Agents », « Manage Clients », « All Procedures », « Procedure Steps », « Documents Monitoring », « System Logs », « Billing », « System Settings »
- Buttons: « New Workflow », « Create Agent », « Create Client », « New Procedure », « Finalize Procedure »

For questions about CLIENTS, AGENTS, or APPLICATIONS: always use a tool before answering — never answer from memory or assumption. Keep your reply SHORT — one sentence introducing or summarizing what you found — since the actual data is displayed separately as a card/table right below your reply. Never restate the full data as text. If nothing matches, say so plainly in one sentence.

For "how do I..." / process questions about using the platform, answer directly from this manual using the corresponding language and UI terminology, without calling any tool:

OVERVIEW / VUE D'ENSEMBLE
The dashboard home shows total clients, total agents, total procedures, a breakdown of procedures by status, and recent activity.

MANAGE AGENTS / GÉRER LES AGENTS
- Create an agent: "Manage Agents" (« Gérer les agents ») → "Create Agent" (« Créer un agent ») → enter name and email. A temporary password is generated automatically.
- Suspend, reactivate, or edit an agent: find them in the agent list and use the action buttons next to their row.

MANAGE CLIENTS / GÉRER LES CLIENTS
- Register a new client: "Manage Clients" (« Gérer les clients ») → "Create Client" (« Créer un client ») → enter name and email.
- Assign an agent to a client: select an agent from the assignment dropdown in the client list.
- Edit, suspend, or delete a client using the actions next to their row.

ALL PROCEDURES / TOUTES LES PROCÉDURES
- Create a new procedure for a client: "All Procedures" (« Toutes les procédures ») → "New Procedure" (« Nouvelle procédure ») → select client, workflow, and destination country.
- A procedure can also be started from within a specific client's page.
- Finalize a procedure: open the procedure's step management and click "Finalize Procedure" (« Finaliser la procédure ») to complete it and send a congratulatory message to the client.

PROCEDURE STEPS / ÉTAPES DE PROCÉDURE (workflow builder)
- Define and customize step-by-step workflows for your agency.
- Create a new workflow: "Procedure Steps" (« Étapes de procédure ») → "New Workflow" (« Nouveau workflow ») → enter a name (e.g. "PR - Canada"). It starts pre-filled with standard steps that you can rename, reorder, delete, or extend with custom steps and sub-steps.

DOCUMENTS MONITORING / SUIVI DES DOCUMENTS
- Review uploaded documents across all clients and procedures in one place, and verify or reject them.

SYSTEM LOGS / JOURNAUX SYSTÈME
- Complete audit trail of administrative and agent actions across the agency.

BILLING / FACTURATION
- View subscription plans, quotas, and upgrade or manage billing.

If a question doesn't match anything above and isn't a data lookup either, say plainly that you're not sure and suggest checking the relevant section in the navigation menu.`
            },
            ...history.map((h) => ({ role: h.role, content: h.content } as Groq.Chat.Completions.ChatCompletionMessageParam)),
            { role: "user", content: userQuery }
        ];

        const toolResults: ToolResultPayload[] = [];

        // Tool-use loop: the model may need several rounds of "call a tool,
        // see the result, call another" before it has enough to answer.
        for (let i = 0; i < 5; i++) {
            const response = await groq.chat.completions.create({
                model: "openai/gpt-oss-120b",
                max_tokens: 1024,
                tools,
                messages
            });

            const choice = response.choices[0];
            const toolCalls = choice.message.tool_calls;

            if (!toolCalls || toolCalls.length === 0) {
                return {
                    success: true,
                    answer: choice.message.content || "",
                    results: toolResults
                };
            }

            messages.push(choice.message);

            for (const toolCall of toolCalls) {
                const args = JSON.parse(toolCall.function.arguments || "{}");
                const result = await runTool(toolCall.function.name, args, agencyId);
                toolResults.push({ tool: toolCall.function.name, result });
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            }
        }

        return { error: "Search took too many steps — try a more specific question." };
    } catch (e: any) {
        console.error("AI search error:", e);
        return { error: "Something went wrong running that search." };
    }
}