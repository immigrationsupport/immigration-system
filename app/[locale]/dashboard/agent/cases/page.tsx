import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function AgentCasesPage() {
    const t = await getTranslations("agentCases");
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">{t("title")}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t("caseList")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">{t("placeholder")}</p>
                    {/* Reusing the table structure from overview would be ideal here */}
                </CardContent>
            </Card>
        </div>
    );
}