"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getIntakeFormDocumentUrlAction } from "@/app/[locale]/intake-form/actions";

export default function IntakeFormDocumentLink({ documentId, fileName }: { documentId: string; fileName: string }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const result = await getIntakeFormDocumentUrlAction(documentId);
            if (result?.error || !result.url) {
                toast.error(result?.error || "Impossible d'ouvrir ce fichier.");
                return;
            }
            window.open(result.url, "_blank");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:underline"
        >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            {fileName}
        </button>
    );
}