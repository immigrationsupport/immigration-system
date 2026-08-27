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

import EditAgentModal from "./edit-agent-modal";

export default function AgentActionButtons({ agentId, agentName, agentEmail, isSuspended }: { agentId: string, agentName: string, agentEmail: string, isSuspended: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleToggleSuspend = async () => {
        setLoading(true);
        const result = await toggleSuspendAgentAction(agentId, isSuspended);
        setLoading(false);
        if (result.success) {
            toast.success(isSuspended ? "Agent unsuspended" : "Agent suspended");
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        const result = await deleteAgentAction(agentId);
        setLoading(false);
        if (result.success) {
            toast.success("Agent deleted successfully");
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
                title={isSuspended ? "Unsuspend Agent" : "Suspend Agent"}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (isSuspended ? <CheckCircle2 size={16} /> : <Ban size={16} />)}
            </button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button 
                        className="p-2 text-gray-400 text-red-500 transition-all rounded-lg" 
                        title="Delete Agent"
                    >
                        <Trash2 size={16} />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-none shadow-2xl rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-gray-900">Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-medium pt-2">
                            This action cannot be undone. This will permanently delete the agent's account. This may fail if the agent has assigned clients or active applications.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="font-bold border-none bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl px-6"
                        >
                            Delete Agent
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
