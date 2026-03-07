import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AgentCasesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">Assigned Cases</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Case List</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">Full list of assigned cases would go here.</p>
                    {/* Reusing the table structure from overview would be ideal here */}
                </CardContent>
            </Card>
        </div>
    );
}
