import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import IntakeFormClient from "./intake-form-client";

export const dynamic = "force-dynamic";

export default async function IntakeFormPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect("/sign-in");
    }

    if ((session.user as any).role !== "CLIENT") {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-4 text-center">
                <p className="text-gray-500 font-medium">
                    Ce formulaire est réservé aux clients.
                </p>
            </div>
        );
    }

    const form = await prisma.intakeFormResponse.findUnique({
        where: { clientId: session.user.id },
    });

    if (!form || !form.invited) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-4 text-center">
                <p className="text-gray-500 font-medium max-w-md">
                    Vous n'êtes pas autorisé à remplir ce formulaire pour le moment. Contactez votre agent si vous pensez qu'il s'agit d'une erreur.
                </p>
            </div>
        );
    }

    const savedAnswers = (form.answers as Record<string, any>) || {};
    const initialAnswers = {
        ...savedAnswers,
        fullName: savedAnswers.fullName ?? session.user.name ?? "",
    };

    const existingDocuments = await prisma.intakeFormDocument.findMany({
        where: { clientId: session.user.id },
        select: { id: true, questionId: true, fileName: true },
    });

    return (
        <IntakeFormClient
            clientName={session.user.name || ""}
            initialAnswers={initialAnswers}
            initialSection={form.currentSection}
            initialStatus={form.status}
            existingDocuments={existingDocuments}
        />
    );
}