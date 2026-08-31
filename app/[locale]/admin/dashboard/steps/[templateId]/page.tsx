import React from "react";
import Link from "next/link";
import { getTemplateForEditing, getBuiltInTypeOptions } from "../actions";
import StepEditor from "./step-editor";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function TemplateEditorPage({
    params
}: {
    params: Promise<{ templateId: string }>;
}) {
    const t = await getTranslations("adminSteps");
    const { templateId } = await params;
    const result = await getTemplateForEditing(templateId);

    if ("error" in result) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center text-gray-500">
                {result.error}
            </div>
        );
    }

    const builtInTypes = await getBuiltInTypeOptions();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <Link href="/admin/dashboard/steps" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-[#1E3A8A] mb-3">
                    <ArrowLeft className="h-4 w-4" /> {t("allWorkflows")}
                </Link>
                <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>{result.template.name}</h1>
                {result.template.description && <p className="text-gray-500 text-sm mt-1">{result.template.description}</p>}
            </div>

            <StepEditor
                templateId={result.template.id}
                initialSteps={result.steps}
                builtInTypes={builtInTypes}
            />
        </div>
    );
}