"use client";

import { useState } from "react";
import { Ban, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toggleSuspendAgentAction, deleteAgentAction } from "./actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import EditAgentModal from "./edit-agent-modal";

export default function AgentActionButtons({
    agentId,
    agentName,
    agentEmail,
    isSuspended,
}: {
    agentId: string;
    agentName: string;
    agentEmail: string;
    isSuspended: boolean;
}) {
    const t = useTranslations("adminAgents.actions");
    const [loading, setLoading] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isSuspendOpen, setIsSuspendOpen] = useState(false);
    const [error, setError] = useState("");

    const handleToggleSuspend = async () => {
        setLoading(true);
        setError("");
        const result = await toggleSuspendAgentAction(agentId, isSuspended);
        setLoading(false);
        if (result.success) {
            toast.success(
                isSuspended ? t("toastUnsuspended") : t("toastSuspended")
            );
            setIsSuspendOpen(false);
        } else {
            setError(result.error || "Failed to update agent status.");
            toast.error(result.error);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError("");
        const result = await deleteAgentAction(agentId);
        setLoading(false);
        if (result.success) {
            toast.success(t("toastDeleteSuccess"));
            setIsDeleteOpen(false);
        } else {
            setError(result.error || "Failed to delete agent.");
            toast.error(result.error);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <EditAgentModal
                agentId={agentId}
                currentName={agentName}
                currentEmail={agentEmail}
            />

            <button
                onClick={() => {
                    setError("");
                    setIsSuspendOpen(true);
                }}
                disabled={loading}
                className={`p-2 transition-all rounded-lg ${
                    isSuspended
                        ? "text-green-600 hover:bg-green-50"
                        : "text-amber-500 hover:bg-amber-50"
                }`}
                title={
                    isSuspended
                        ? t("unsuspendTooltip")
                        : t("suspendTooltip")
                }
            >
                {isSuspended ? (
                    <CheckCircle2 size={16} />
                ) : (
                    <Ban size={16} />
                )}
            </button>

            <button
                onClick={() => {
                    setError("");
                    setIsDeleteOpen(true);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                title={t("deleteTooltip")}
            >
                <Trash2 size={16} />
            </button>

            {/* Delete Agent Confirmation Dialog (with Typed Name) */}
            <ConfirmActionDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleDelete}
                title="Delete Agent"
                description={`Are you sure you want to permanently delete the agent account for "${agentName}" (${agentEmail})? This action cannot be undone.`}
                confirmTargetName={agentName}
                confirmButtonText="Delete Agent"
                actionType="delete"
                variant="danger"
                isPending={loading}
                error={error}
            />

            {/* Suspend Agent Confirmation Dialog (with Typed Name) */}
            <ConfirmActionDialog
                open={isSuspendOpen}
                onOpenChange={setIsSuspendOpen}
                onConfirm={handleToggleSuspend}
                title={isSuspended ? "Reactivate Agent" : "Suspend Agent"}
                description={
                    isSuspended
                        ? `This will restore platform access for agent "${agentName}".`
                        : `This will immediately block agent "${agentName}" from signing in and managing applications.`
                }
                confirmTargetName={agentName}
                confirmButtonText={
                    isSuspended ? "Reactivate Agent" : "Suspend Agent"
                }
                actionType="suspend"
                variant="warning"
                isPending={loading}
                error={error}
            />
        </div>
    );
}