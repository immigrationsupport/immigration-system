"use client";

import { useState } from "react";
import { Edit2, Ban, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toggleSuspendAgentAction, deleteAgentAction } from "./actions";
import { toast } from "sonner";
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

import EditAgentModal from "./edit-agent-modal";

export default function AgentActionButtons({ agentId, agentName, agentEmail, isSuspended }: { agentId: string, agentName: string, agentEmail: string, isSuspended: boolean }) {
    const t = useTranslations("adminAgents.actions");
    const [loading, setLoading] = useState(false);

    const handleToggleSuspend = async () => {
        setLoading(true);
        const result = await toggleSuspendAgentAction(agentId, isSuspended);
        setLoading(false);
        if (result.success) {
            toast.success(isSuspended ? t("toastUnsuspended") : t("toastSuspended"));
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        const result = await deleteAgentAction(agentId);
        setLoading(false);
        if (result.success) {
            toast.success(t("toastDeleteSuccess"));
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <EditAgentModal agentId={agentId} currentName={agentName} currentEmail={agentEmail} />

            <button 
                onClick={handleToggleSuspend}
                disabled={loading}
                className={`p-2 transition-all rounded-lg ${
                    isSuspended 
                    ? "text-green-600 hover:bg-green-50" 
                    : "text-gray-400 text-orange-500"
                }`} 
                title={isSuspended ? t("unsuspendTooltip") : t("suspendTooltip")}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (isSuspended ? <CheckCircle2 size={16} /> : <Ban size={16} />)}
            </button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button 
                        className="p-2 text-gray-400 text-red-500 transition-all rounded-lg" 
                        title={t("deleteTooltip")}
                    >
                        <Trash2 size={16} />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-none shadow-2xl rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-gray-900">{t("confirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-medium pt-2">
                            {t("confirmDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="font-bold border-none bg-gray-100 hover:bg-gray-200 rounded-xl">{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl px-6"
                        >
                            {t("confirmDelete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}