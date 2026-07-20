import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function WelcomePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/sign-in");
    }

    const applications = await prisma.application.findMany({
        where: { clientId: session.user.id },
    });

    if (applications.length > 0) {
        redirect("/dashboard/client");
    }

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <Card className="w-full max-w-lg text-center shadow-lg border-gray-100">
                <CardHeader className="pb-4">
                    <CardTitle className="text-3xl font-bold text-[#1E3A8A] mb-2">Welcome</CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                        Welcome to your Immigration Portal. Start your first application to begin your process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-8">
                    <Link href="/applications/new">
                        <Button className="bg-[#1E3A8A] hover:bg-blue-800 text-white px-8 py-6 text-lg rounded-sm transition-colors shadow-md hover:shadow-lg">
                            Start New Application
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
