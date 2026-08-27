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

export async function aiSearchAction(userQuery: string) {
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
                content: "You are a helpful assistant for an immigration agency's admin dashboard. Always use a tool before answering any question about clients, agents, or applications — never answer from memory or assumption. Report only what the tools actually return. If nothing matches, say so plainly."
            },
            { role: "user", content: userQuery }
        ];

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
                return { success: true, answer: choice.message.content || "" };
            }

            messages.push(choice.message);

            for (const toolCall of toolCalls) {
                const args = JSON.parse(toolCall.function.arguments || "{}");
                const result = await runTool(toolCall.function.name, args, agencyId);
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