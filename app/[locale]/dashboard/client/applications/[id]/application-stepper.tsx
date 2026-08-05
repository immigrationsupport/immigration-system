"use client";

import React, { useState } from "react";
import { APP_STEP_SEQUENCE, STEP_LABELS } from "@/lib/steps";
import { CheckCircle2, Clock, Lock, FileText, Download, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ApplicationStepperProps {
    steps: any[];
    applicationId: string;
    country: string;
}

/**
 * Read-only for the client. They can see exactly where their case stands —
 * step by step, with the documents their agent has already attached — but
 * cannot upload, submit, or otherwise act on anything. Every action here
 * (uploading documents, changing a step's status) is now handled
 * exclusively by their agent, on the agent's own step-management screen.
 */
export default function ApplicationStepper({ steps, applicationId, country }: ApplicationStepperProps) {
    const t = useTranslations("applications.stepper");
    const tStepLabels = useTranslations("dashboard.clientDashboard.stepLabels");
    const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string } | null>(null);

    const completedStepsCount = steps.filter((s) => s.status === "APPROVED" || s.status === "COMPLETED").length;
    const progressPercentage = Math.round((completedStepsCount / (steps.length || 1)) * 100);
    const firstIncompleteStepIdx = [...steps]
        .sort((a, b) => APP_STEP_SEQUENCE.indexOf(a.type) - APP_STEP_SEQUENCE.indexOf(b.type))
        .findIndex((s) => s.status !== "APPROVED" && s.status !== "COMPLETED");

    return (
        <div className="space-y-8 pb-12">
            {/* Progress Bar */}
            <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-2xl shadow-gray-200/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{t("processReliability")}</p>
                        <h3 className="text-4xl font-black text-[#1E3A8A] uppercase tracking-tighter">{t("applicationStatus")}</h3>
                    </div>
                    <div className="text-left md:text-right">
                        <span className="text-6xl font-black text-[#1E3A8A] tracking-tighter leading-none">{progressPercentage}%</span>
                        <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2 md:justify-end">
                            <CheckCircle2 size={14} /> {t("milestonesValidated", { completed: completedStepsCount, total: steps.length })}
                        </p>
                    </div>
                </div>
                <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-inner p-1">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-[#1E3A8A] rounded-full transition-all duration-1000 ease-out shadow-xl shadow-blue-200"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Steps table — read only */}
            <div className="overflow-x-auto rounded-[50px] border border-gray-100 shadow-2xl shadow-gray-200/30 bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-sm font-bold text-gray-700">
                            <th className="p-4">{t("headers.stepNumber")}</th>
                            <th className="p-4">{t("headers.stepName")}</th>
                            <th className="p-4">{t("headers.status")}</th>
                            <th className="p-4">{t("headers.lastUpdated")}</th>
                            <th className="p-4">Documents</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {APP_STEP_SEQUENCE.map((stepType, idx) => {
                            const dbStep = steps.find((s) => s.type === stepType);
                            const step = dbStep || {
                                id: `placeholder-${idx}`,
                                type: stepType,
                                status: idx < 3 ? "APPROVED" : "PENDING",
                                isLocked: idx < 3 ? false : true,
                                updatedAt: new Date(),
                                Document: [],
                            };

                            const isCompleted = step.status === "APPROVED" || step.status === "COMPLETED";
                            const isUnlockedByAgent = !step.isLocked && step.status !== "PENDING";
                            const isNextActive = dbStep ? idx === firstIncompleteStepIdx : idx === 3;
                            const isActive = (isNextActive || isUnlockedByAgent) && !isCompleted;
                            const isLocked = !isActive && !isCompleted;

                            let label = STEP_LABELS[stepType];
                            try {
                                label = tStepLabels(stepType as any);
                            } catch {
                                // fall back to the static label if no translation exists
                            }

                            return (
                                <tr key={step.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-gray-400 font-black">{idx + 1}</td>
                                    <td className="p-4 font-bold text-gray-900">{label}</td>
                                    <td className="p-4">
                                        {isCompleted ? (
                                            <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle2 size={12} /> {t("statusLabels.completed")}
                                            </span>
                                        ) : isActive ? (
                                            <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <Clock size={12} /> {t("statusLabels.inProgress")}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <Lock size={12} /> {t("statusLabels.pending")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500 font-medium text-xs">
                                        {dbStep ? new Date(step.updatedAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="p-4">
                                        {step.Document && step.Document.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {step.Document.map((doc: any) => (
                                                    <button
                                                        key={doc.id}
                                                        onClick={() => setViewingDoc({ url: doc.fileUrl, name: doc.name })}
                                                        className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                                    >
                                                        <FileText size={12} /> {doc.name.replace("_", " ")}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 text-xs italic">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Document Viewer Overlay */}
            {viewingDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#1a1a1a] w-full max-w-6xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <FileText size={18} />
                                </div>
                                <h3 className="text-white font-bold truncate max-w-md">{viewingDoc?.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={viewingDoc?.url}
                                    download
                                    className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all"
                                >
                                    <Download size={16} /> Download
                                </a>
                                <button
                                    onClick={() => setViewingDoc(null)}
                                    className="h-10 w-10 text-white hover:bg-white/10 rounded-xl flex items-center justify-center"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#121212] overflow-hidden relative flex items-center justify-center p-4">
                            {/\.(jpe?g|png|gif|webp)$/i.test(viewingDoc?.url || "") ? (
                                <img
                                    src={viewingDoc?.url}
                                    alt={viewingDoc?.name}
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                                />
                            ) : (
                                <iframe
                                    src={`${viewingDoc?.url}#toolbar=1&navpanes=0&view=FitH`}
                                    className="w-full h-full border-none"
                                    title="Document Viewer"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}