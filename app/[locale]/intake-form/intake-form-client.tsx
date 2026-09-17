"use client";

import { useMemo, useState, useTransition, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, LogOut, Save, Upload, FileCheck, X } from "lucide-react";
import { toast } from "sonner";
import {
    getVisibleQuestions,
    groupIntoSteps,
    FormStep,
} from "@/lib/intake-form/engine";
import { Question } from "@/lib/intake-form/types";
import { COUNTRIES, findCountryByDialCode } from "@/lib/intake-form/countries";
import {
    saveIntakeFormProgressAction,
    submitIntakeFormAction,
    createIntakeFormUploadUrlAction,
    confirmIntakeFormUploadAction,
    removeIntakeFormDocumentAction,
} from "./actions";

interface Props {
    clientName: string;
    initialAnswers: Record<string, any>;
    initialSection: string | null;
    initialStatus: string;
    existingDocuments: { id: string; questionId: string; fileName: string }[];
}

function QuestionField({
    question,
    value,
    onChange,
}: {
    question: Question;
    value: any;
    onChange: (value: any) => void;
}) {
    switch (question.type) {
        case "text":
        case "number":
            return (
                <Input
                    type={question.type === "number" ? "number" : "text"}
                    value={value ?? ""}
                    placeholder={question.placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            );

        case "date":
            return (
                <Input
                    type="date"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );

        case "textarea":
            return (
                <Textarea
                    value={value ?? ""}
                    placeholder={question.placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                />
            );

        case "radio":
            if (!question.options || question.options.length === 0) {
                return (
                    <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl">
                        Aucune option disponible pour le moment — votre agent s'en occupera avec vous.
                    </p>
                );
            }
            return (
                <div className="space-y-2">
                    {question.options?.map((opt) => (
                        <label
                            key={opt.value}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                value === opt.value
                                    ? "border-[#1E3A8A] bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <input
                                type="radio"
                                className="accent-[#1E3A8A]"
                                checked={value === opt.value}
                                onChange={() => onChange(opt.value)}
                            />
                            <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                        </label>
                    ))}
                </div>
            );

        case "select":
            return (
                <select
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                >
                    <option value="" disabled>
                        Sélectionnez...
                    </option>
                    {question.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );

        case "checkbox": {
            const selected: string[] = Array.isArray(value) ? value : [];
            const toggle = (val: string) => {
                if (selected.includes(val)) {
                    onChange(selected.filter((v) => v !== val));
                } else {
                    onChange([...selected, val]);
                }
            };
            return (
                <div className="space-y-2">
                    {question.options?.map((opt) => (
                        <label
                            key={opt.value}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                selected.includes(opt.value)
                                    ? "border-[#1E3A8A] bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <input
                                type="checkbox"
                                className="accent-[#1E3A8A]"
                                checked={selected.includes(opt.value)}
                                onChange={() => toggle(opt.value)}
                            />
                            <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                        </label>
                    ))}
                </div>
            );
        }

        case "phone": {
            const raw = typeof value === "string" ? value : "";
            const spaceIndex = raw.indexOf(" ");
            const currentDialCode = spaceIndex > 0 ? raw.slice(0, spaceIndex) : "+237";
            const currentNumber = spaceIndex > 0 ? raw.slice(spaceIndex + 1) : raw;

            return (
                <div className="flex gap-2">
                    <select
                        value={currentDialCode}
                        onChange={(e) => onChange(`${e.target.value} ${currentNumber}`.trim())}
                        className="w-28 shrink-0 border border-gray-200 rounded-xl px-2 py-2.5 text-sm"
                    >
                        {COUNTRIES.filter((c) => c.dialCode).map((c) => (
                            <option key={c.code} value={c.dialCode}>
                                {c.dialCode} {c.code}
                            </option>
                        ))}
                    </select>
                    <Input
                        type="tel"
                        value={currentNumber}
                        placeholder="676 11 32 24"
                        onChange={(e) => onChange(`${currentDialCode} ${e.target.value}`.trim())}
                    />
                </div>
            );
        }

        case "country":
            return (
                <select
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                >
                    <option value="" disabled>
                        Sélectionnez un pays...
                    </option>
                    {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </select>
            );

        default:
            return null;
    }
}

function DocumentUploadField({
    questionId,
    uploadedFile,
    onChange,
}: {
    questionId: string;
    uploadedFile: { id: string; fileName: string } | null;
    onChange: (file: { id: string; fileName: string } | null) => void;
}) {
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setUploading(true);
        try {
            const prepared = await createIntakeFormUploadUrlAction(questionId, file.name, file.type || "application/octet-stream", file.size);
            if (prepared?.error || !prepared.uploadUrl || !prepared.storageKey) {
                toast.error(prepared?.error || "Échec de la préparation de l'envoi.");
                return;
            }

            const uploadRes = await fetch(prepared.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type || "application/octet-stream" },
                body: file,
            });

            if (!uploadRes.ok) {
                toast.error("Échec de l'envoi du fichier.");
                return;
            }

            const confirmed = await confirmIntakeFormUploadAction(questionId, file.name, prepared.storageKey);
            if (confirmed?.error || !confirmed.document) {
                toast.error(confirmed?.error || "Échec de l'enregistrement du fichier.");
                return;
            }

            onChange({ id: confirmed.document.id, fileName: confirmed.document.fileName });
            toast.success("Fichier envoyé avec succès.");
        } catch (err) {
            console.error(err);
            toast.error("Une erreur est survenue lors de l'envoi.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setUploading(true);
        try {
            const result = await removeIntakeFormDocumentAction(questionId);
            if (result?.error) {
                toast.error(result.error);
                return;
            }
            onChange(null);
        } finally {
            setUploading(false);
        }
    };

    if (uploadedFile) {
        return (
            <div className="flex items-center justify-between gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-semibold text-emerald-800 truncate">{uploadedFile.fileName}</span>
                </div>
                <button
                    type="button"
                    onClick={handleRemove}
                    disabled={uploading}
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors shrink-0"
                    aria-label="Retirer le fichier"
                >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                </button>
            </div>
        );
    }

    return (
        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all text-sm font-semibold text-gray-500">
            {uploading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...
                </>
            ) : (
                <>
                    <Upload className="h-4 w-4" /> Téléverser un fichier (optionnel)
                </>
            )}
            <input type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} />
        </label>
    );
}

export default function IntakeFormClient({
    clientName,
    initialAnswers,
    initialSection,
    initialStatus,
    existingDocuments,
}: Props) {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
    const [documents, setDocuments] = useState<Record<string, { id: string; fileName: string } | null>>(() => {
        const map: Record<string, { id: string; fileName: string } | null> = {};
        for (const doc of existingDocuments) {
            map[doc.questionId] = { id: doc.id, fileName: doc.fileName };
        }
        return map;
    });
    const [submitted, setSubmitted] = useState(initialStatus === "SUBMITTED");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const country = answers.destinationCountry || null;

    const steps: FormStep[] = useMemo(() => {
        const visible = getVisibleQuestions(country, answers);
        return groupIntoSteps(visible);
    }, [country, answers]);

    const [stepIndex, setStepIndex] = useState<number>(() => {
        if (!initialSection) return 0;
        const idx = steps.findIndex((s) => s.section === initialSection);
        return idx >= 0 ? idx : 0;
    });

    const safeStepIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
    const currentStep = steps[safeStepIndex];
    const isLastStep = safeStepIndex === steps.length - 1;

    const setAnswer = (id: string, value: any) => {
        setAnswers((prev) => {
            const next = { ...prev, [id]: value };

            if (id === "phone" && typeof value === "string" && !prev.countryOfResidence) {
                const dialCode = value.split(" ")[0];
                const matched = findCountryByDialCode(dialCode);
                if (matched && matched.code !== "OT") {
                    next.countryOfResidence = matched.name;
                }
            }

            return next;
        });
    };

    const validateCurrentStep = () => {
        if (!currentStep) return true;
        for (const q of currentStep.questions) {
            if (!q.required) continue;
            const v = answers[q.id];
            if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
                setError("Merci de répondre à toutes les questions obligatoires avant de continuer.");
                return false;
            }
        }
        setError("");
        return true;
    };

    const handleNext = () => {
        if (!validateCurrentStep()) return;

        const nextIndex = Math.min(safeStepIndex + 1, steps.length - 1);
        const nextSection = steps[nextIndex]?.section || null;

        startTransition(async () => {
            const result = await saveIntakeFormProgressAction(answers, nextSection);
            if (result?.error) {
                toast.error(result.error);
                return;
            }
            setStepIndex(nextIndex);
        });
    };

    const handleBack = () => {
        setError("");
        setStepIndex((i) => Math.max(0, i - 1));
    };

    const handleSaveAndExit = () => {
        startTransition(async () => {
            const result = await saveIntakeFormProgressAction(answers, currentStep?.section || null);
            if (result?.error) {
                toast.error(result.error);
                return;
            }
            toast.success("Votre progression a été enregistrée. Vous pourrez reprendre exactement ici.");
            router.push("/dashboard/client");
        });
    };

    const handleSubmit = () => {
        if (!validateCurrentStep()) return;

        startTransition(async () => {
            const result = await submitIntakeFormAction(answers);
            if (result?.error) {
                toast.error(result.error);
                return;
            }
            setSubmitted(true);
            toast.success("Formulaire envoyé avec succès !");
        });
    };

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Merci, {clientName} !</h1>
                <p className="text-gray-500">
                    Votre formulaire a bien été envoyé. Votre agent utilisera ces informations pour préparer votre dossier — vous pourrez toujours en discuter ensemble par la suite.
                </p>
            </div>
        );
    }

    if (!currentStep) {
        return null;
    }

    const progressPct = Math.round(((safeStepIndex + 1) / steps.length) * 100);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
                    <span>Étape {safeStepIndex + 1} sur {steps.length}</span>
                    <span>{progressPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#1E3A8A] transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-lg font-bold text-[#1E3A8A] mb-1">{currentStep.label}</h2>
                <p className="text-xs text-gray-400 mb-6">Les questions marquées d'une étoile (*) sont obligatoires.</p>

                <div className="space-y-6">
                    {currentStep.questions.map((q) => (
                        <div key={q.id}>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                                {q.label}
                                {q.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {q.helpText && (
                                <p className="text-xs text-gray-400 italic mb-2">{q.helpText}</p>
                            )}
                            <QuestionField
                                question={q}
                                value={answers[q.id]}
                                onChange={(v) => setAnswer(q.id, v)}
                            />
                            {q.documentType && (
                                <div className="mt-3">
                                    <DocumentUploadField
                                        questionId={q.id}
                                        uploadedFile={documents[q.id] || null}
                                        onChange={(file) =>
                                            setDocuments((prev) => ({ ...prev, [q.id]: file }))
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mt-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between mt-8 pt-6 border-t border-gray-100 gap-3">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={safeStepIndex === 0 || isPending}
                        className="gap-2 rounded-xl w-full sm:w-auto justify-center"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleSaveAndExit}
                        disabled={isPending}
                        className="gap-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 w-full sm:w-auto justify-center"
                    >
                        <LogOut className="h-4 w-4" />
                        Enregistrer et quitter
                    </Button>

                    {isLastStep ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="gap-2 rounded-xl text-white w-full sm:w-auto justify-center"
                            style={{ backgroundColor: "#1E3A8A" }}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Soumettre le formulaire
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={isPending}
                            className="gap-2 rounded-xl text-white w-full sm:w-auto justify-center"
                            style={{ backgroundColor: "#1E3A8A" }}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Suivant
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}