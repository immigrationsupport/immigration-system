import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Calendar, Shield, Globe, ExternalLink, ClipboardList } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import NewApplicationModal from "./new-application-modal";
import EditClientProfileModal from "./edit-client-profile-modal";
import { getLocale, getTranslations } from "next-intl/server";
import { getFriendlyStatus } from "@/lib/steps";
import { getAllQuestions, getAnsweredQuestionsBySection, formatAnswerForDisplay } from "@/lib/intake-form/engine";
import IntakeFormDocumentLink from "./questionnaire/intake-form-document-link";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    const locale = await getLocale();
    const t = await getTranslations("agentClientDetail");
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return null;
    }

    const { id } = await params;
    const isAdmin = (session.user as any).role === "ADMIN";
    const agencyId = (session.user as any).agencyId;

    const client = await prisma.user.findUnique({
        where: isAdmin ? { id, agencyId } : { id, agentId: session.user.id },
        include: {
            applications: {
                include: {
                    steps: true
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!client) {
        notFound();
    }

    // Everything the client already submitted via the intake form. This is
    // the same for every one of the client's procedures, so it's shown
    // once here rather than repeated inside each procedure card.
    const [intakeFormResponse, intakeFormDocuments, documentsCount] = await Promise.all([
        prisma.intakeFormResponse.findUnique({ where: { clientId: id } }),
        prisma.intakeFormDocument.findMany({ where: { clientId: id } }),
        prisma.document.count({ where: { Procedure: { application: { clientId: id } } } })
    ]);

    const intakeAnswers = (intakeFormResponse?.answers as Record<string, any>) || {};
    const intakeCountry = intakeFormResponse?.country || null;
    const allQuestions = getAllQuestions(intakeCountry);

    const intakeDocumentsForDisplay = intakeFormDocuments.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        questionId: doc.questionId
    }));

    const questionnaireSections = intakeFormResponse
        ? getAnsweredQuestionsBySection(intakeCountry, intakeAnswers).map((section) => ({
              section: section.section,
              label: section.label,
              questions: section.questions.map((q) => ({
                  id: q.id,
                  label: q.label,
                  value: formatAnswerForDisplay(q, intakeAnswers[q.id]),
                  document: intakeDocumentsForDisplay.find((d) => d.questionId === q.id) || null
              }))
          }))
        : [];

    const questionnaireStatus = intakeFormResponse?.status || null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">
                        {client.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{client.name}</h1>
                        <p className="text-gray-500 font-medium flex items-center gap-2">
                           <Shield className="h-4 w-4 text-blue-500" /> {t("assignedClient")}
                        </p>
                    </div>
                </div>
                <NewApplicationModal clientId={id} clientName={client.name} />
            </div>

            {/* Profile Card */}
            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 py-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" /> {t("personalProfile")}
                    </CardTitle>
                    <EditClientProfileModal clientId={id} client={client} />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("emailAddress")}</label>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Mail className="h-4 w-4 text-gray-400" /> {client.email}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("phoneNumber")}</label>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Phone className="h-4 w-4 text-gray-400" /> {client.phoneNumber || t("notProvided")}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("nationality")}</label>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <MapPin className="h-4 w-4 text-gray-400" /> {client.nationality || t("notSpecified")}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("dateOfBirth")}</label>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Calendar className="h-4 w-4 text-gray-400" /> {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString(locale) : t("notProvided")}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("procedures")}</div>
                            <div className="text-lg font-black text-gray-900">{client.applications.length}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("documents")}</div>
                            <div className="text-lg font-black text-gray-900">{documentsCount}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Procedures — a compact summary per application (status,
                progress) with a link to the full step-by-step roadmap.
                Kept short on purpose: the full step table already lives
                on that page, so it isn't repeated here, especially since
                a client can have more than one procedure. */}
            <div className="space-y-3">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Globe className="h-4 w-4 text-blue-500" /> {t("procedures")}
                </h2>

                {client.applications.length === 0 ? (
                    <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl">
                        <CardContent className="p-10 text-center space-y-1">
                            <p className="font-black text-gray-700">{t("noActiveJourneys")}</p>
                            <p className="text-sm text-gray-400 font-medium">{t("noActiveJourneysDescription")}</p>
                        </CardContent>
                    </Card>
                ) : (
                    client.applications.map((application: any) => {
                        const completedSteps = application.steps.filter((s: any) => s.status === "APPROVED").length;
                        const progress = application.steps.length > 0
                            ? Math.round((completedSteps / application.steps.length) * 100)
                            : 0;
                        const friendlyStatus = getFriendlyStatus(application.status, application.steps);

                        return (
                            <Link key={application.id} href={`/dashboard/agent/applications/${application.id}`}>
                                <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl hover:shadow-2xl transition-all cursor-pointer group">
                                    <CardContent className="p-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-all shrink-0">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-black text-gray-900 uppercase text-sm">{application.country}</span>
                                                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        {friendlyStatus}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-semibold">
                                                    {completedSteps}/{application.steps.length} {t("stepsCompletedSuffix")} — {progress}%
                                                </p>
                                            </div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-[#1E3A8A] transition-all shrink-0" />
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Questionnaire — every question/answer the client submitted,
                shown once (it's the same across all of the client's
                procedures, not per-procedure). */}
            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 py-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-blue-500" /> {t("questionnaireTitle", { clientName: client.name })}
                    </CardTitle>
                    {questionnaireStatus && (
                        <span
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                questionnaireStatus === "SUBMITTED"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-yellow-50 text-yellow-700"
                            }`}
                        >
                            {questionnaireStatus === "SUBMITTED" ? t("questionnaireStatusSubmitted") : t("questionnaireStatusDraft")}
                        </span>
                    )}
                </CardHeader>
                {questionnaireSections.length === 0 ? (
                    <CardContent className="p-10 text-center">
                        <p className="text-sm font-bold text-gray-400">{t("questionnaireEmpty")}</p>
                    </CardContent>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {questionnaireSections.map((section) => (
                            <div key={section.section}>
                                <div className="bg-gray-50/70 px-6 py-3">
                                    <h4 className="text-xs font-black text-[#1E3A8A] uppercase tracking-wide">{section.label}</h4>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {section.questions.map((q) => (
                                        <div key={q.id} className="px-6 py-4">
                                            <p className="text-xs font-bold text-gray-400 mb-1">{q.label}</p>
                                            <p className="text-sm font-semibold text-gray-900">{q.value}</p>
                                            {q.document && (
                                                <IntakeFormDocumentLink documentId={q.document.id} fileName={q.document.fileName} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}