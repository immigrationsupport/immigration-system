"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Lock, FileText, Download, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ApplicationStepperProps {
    steps: any[];
    applicationId: string;
    country: string;
}

/**
 * Read-only for the client. They can see exactly where their case stands —
 * step by step — but cannot upload, submit, or otherwise act on anything.
 * Every action here (uploading documents, changing a step's status) is
 * handled exclusively by their agent, on the agent's own step-management
 * screen.
 */
export default function ApplicationStepper({ steps, applicationId, country }: ApplicationStepperProps) {
    const t = useTranslations("applications.stepper");
    const tStepLabels = useTranslations("dashboard.clientDashboard.stepLabels");
    const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string } | null>(null);

    const completedStepsCount = steps.filter((s) => s.status === "APPROVED" || s.status === "COMPLETED").length;
    const progressPercentage = Math.round((completedStepsCount / (steps.length || 1)) * 100);
    const firstIncompleteStepIdx = [...steps]
        .sort((a, b) => a.order - b.order)
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
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {[...steps].sort((a, b) => a.order - b.order).map((step, idx) => {
                            const isCompleted = step.status === "APPROVED" || step.status === "COMPLETED";
                            const isUnlockedByAgent = !step.isLocked && step.status !== "PENDING";
                            const isNextActive = idx === firstIncompleteStepIdx;
                            const isActive = (isNextActive || isUnlockedByAgent) && !isCompleted;
                            const isLocked = !isActive && !isCompleted;

                            // step.label is only set when someone gave the step its own
                            // literal text; built-in types are left null so they always
                            // resolve through the translated catalog below.
                            const label = step.label || tStepLabels(step.type as any);

                            return (
                                <React.Fragment key={step.id}>
                                <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
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
                                        {new Date(step.updatedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                                {step.subSteps && step.subSteps.length > 0 && (
                                    <tr className="border-b border-gray-100 bg-gray-50/40">
                                        <td></td>
                                        <td colSpan={3} className="p-4 pt-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Checklist</span>
                                            <div className="flex flex-col gap-1.5">
                                                {step.subSteps.map((sub: any) => (
                                                    <div key={sub.id} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                        {sub.isCompleted ? (
                                                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <Lock size={14} className="text-gray-300 shrink-0" />
                                                        )}
                                                        <span className={sub.isCompleted ? "line-through text-gray-400" : ""}>{sub.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}