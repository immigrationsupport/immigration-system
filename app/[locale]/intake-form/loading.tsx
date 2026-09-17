import { Loader2 } from "lucide-react";

export default function IntakeFormLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="h-8 w-8 text-[#1E3A8A] animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Formulaire en cours de chargement...</p>
        </div>
    );
}