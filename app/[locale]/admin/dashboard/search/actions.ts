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

For questions about CLIENTS, AGENTS, or APPLICATIONS: always use a tool before answering — never answer from memory or assumption. Keep your reply SHORT — one sentence introducing or summarizing what you found — since the actual data is displayed separately as a card right below your reply. Never restate the full data as text. If nothing matches, say so plainly in one sentence.

For "how do I..." / process questions about using the platform, answer directly from this manual, without calling any tool. Answer using only the relevant section(s) — don't dump the whole manual for a specific question.

OVERVIEW
The dashboard home shows total clients, total agents, total procedures, a breakdown of procedures by status, and recent activity.

MANAGE AGENTS
- Create an agent: "Manage Agents" → "Create Agent" → enter their name and email. A temporary password is generated automatically.
- Suspend or reactivate an agent: find them in the agent list and use the suspend/reactivate action next to their row.
- Each agent's assigned client count is shown in the list.

MANAGE CLIENTS
- Register a new client: "Manage Clients" → "Create Client" → enter their name and email. A temporary password is generated automatically (can be regenerated if needed).
- Assign an agent to a client: open the client and choose an agent from the assignment dropdown. If no agents exist yet, create one first under Manage Agents.
- Suspend, reactivate, or delete a client from the same list.
- If a client has no agent assigned, their procedures can still be created, but should be assigned to an agent afterward.

ALL PROCEDURES (applications)
- Create a new procedure for a client: "All Procedures" → "New Procedure" (or "New Application") → pick the client, pick a workflow, enter the destination country.
- A procedure can also be started from within a specific client's own page.
- Each procedure follows the steps defined by whichever workflow was chosen when it was created — editing that workflow later never changes procedures already in progress.
- Filter procedures by status (pending, in progress, submitted, approved, rejected, etc.) from this page.
- Deleting a procedure: use the delete action on its row; if it's locked because a step has already been submitted, it must be unlocked first.

PROCEDURE STEPS (workflow builder)
- This is where the actual sequence of steps a procedure goes through is defined — completely customizable per agency.
- Create a new workflow: "Procedure Steps" → "New Workflow" → give it a name (e.g. "PR - Canada") → it starts pre-filled with the 11 standard steps (Registration, Contract Signing, Fee Payment, Document Collection, Diploma Equivalence, Language Test Registration, Language Test Results, Profile Creation, Application Submission, Medical Examination, Passport Submission).
- From there: rename any step, delete steps you don't need, reorder them with the up/down arrows, or add brand new custom steps that don't exist by default.
- Some steps (like Document Collection or Profile Creation) can optionally keep a "built-in behavior" — e.g. requiring specific documents before they can be approved. A fully custom step has no such requirement; it's approved manually.
- Add sub-steps to any step for a more detailed checklist — these can be ticked off individually as work progresses on a real procedure.
- Multiple workflows can exist at once (e.g. one for PR, one for Study visas) — whichever one is picked when a procedure is created determines that procedure's steps.
- Removing a workflow that's already been used for a real procedure hides it from future use instead of deleting it, so history isn't lost.

APPROVING / MANAGING AN ACTUAL PROCEDURE'S STEPS
- Open a specific procedure (from All Procedures or from the client's page) to see its step-by-step progress.
- Steps unlock in order — approving one unlocks the next.
- Some steps require documents to be uploaded before they can be approved (this is enforced automatically for steps like Document Collection).
- A step can be marked "Action Required" with a note, which notifies the client by email.

DOCUMENTS MONITORING
- Review every document uploaded across all clients/procedures in one place.
- Mark a document as verified or rejected.

SYSTEM LOGS
- A full audit trail of actions taken across the agency — who created what, approved what, changed what, and when.

BILLING
- View the agency's current subscription plan, its usage limits (agents/clients allowed), and payment history.
- Upgrade or downgrade the plan — upgrades apply immediately via payment, downgrades take effect at the end of the current billing period.

SYSTEM SETTINGS
- General agency-level configuration options.

LANGUAGE
- The EN/FR toggle in the top bar switches the interface language at any time.

AI SEARCH (this assistant)
- Ask in plain language (English or French) to find clients, agents, or procedures, or to ask how to do something on the platform — no need to know exact menu names.

If a question doesn't match anything above and isn't a data lookup either, say plainly that you're not sure and suggest checking the relevant sidebar section.`
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