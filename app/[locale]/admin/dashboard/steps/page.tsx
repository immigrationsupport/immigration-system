import React from "react";
import { getTemplates } from "./actions";
import TemplateList from "./template-list";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ApplicationStepsPage() {
    const t = await getTranslations("adminSteps");
    const result = await getTemplates();

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>{t("pageTitle")}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {t("pageSubtitle")}
                </p>
            </div>

            {"error" in result ? (
                <p className="text-center text-gray-500 py-12">{result.error}</p>
            ) : (
                <TemplateList initialTemplates={result.templates} />
            )}
        </div>
    );
}