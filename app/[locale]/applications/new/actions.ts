"use server";

// Clients can no longer create their own applications: new applications are
// now created by the assigned agent from the client's record
// (see app/[locale]/dashboard/agent/clients/[id]/actions.ts,
// createApplicationForClientAction). This action is intentionally disabled
// server-side as defense-in-depth, in case it is ever called directly
// instead of through the UI.
export async function createFullApplicationAction(_data: {
    country: string;
    type: string;
    description: string;
}) {
    return { error: "New applications must be created by your agent. Please contact your assigned specialist." };
}