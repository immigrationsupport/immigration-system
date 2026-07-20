"use client";

import React, { useState } from "react";
import { UploadButton } from "@/src/utils/uploadthing";
import { APP_STEP_SEQUENCE } from "@/lib/steps";
import { addDocumentAction, submitProcedureAction } from "./actions";
import { CheckCircle2, Globe, AlertCircle } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface ApplicationStepperProps {
    steps: any[];
    applicationId: string;
    isPending?: boolean;
    country: string;
}

export default function ApplicationStepper({ steps, applicationId, isPending, country }: ApplicationStepperProps) {
    const router = useRouter();
    const t = useTranslations("applications.stepper");
    const tStepLabels = useTranslations("dashboard.clientDashboard.stepLabels");
    const DOC_LABEL_KEYS: Record<string, string> = {
        PASSPORT: "passport",
        BIRTH_CERTIFICATE: "birthCertificate",
        ID_CARD: "idCard",
        CV: "cv",
        DIPLOMA: "diploma",
        OTHER: "transcripts",
        PASSPORT_PHOTO: "passportPhoto"
    };
    const [uploadingStepId, setUploadingStepId] = useState<string | null>(null);
    const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
    const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
    const [profileInput, setProfileInput] = useState("");
    const [equivalenceInput, setEquivalenceInput] = useState("");
    const [uploadSuccessSteps, setUploadSuccessSteps] = useState<string[]>([]);
    
    // NEW: Language Test Logic
    const [hasCompletedLanguageTest, setHasCompletedLanguageTest] = useState<any>(null);
    const [assistanceModalOpen, setAssistanceModalOpen] = useState(false);
    const [assistanceMessage, setAssistanceMessage] = useState("");
    const [isSubmittingAssistance, setIsSubmittingAssistance] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);

    // Sort steps exactly according to the predefined full sequence: 1 through 11
    const sortedSteps = [...steps].sort((a, b) => {
        return APP_STEP_SEQUENCE.indexOf(a.type) - APP_STEP_SEQUENCE.indexOf(b.type);
    });

    const firstIncompleteStepIdx = sortedSteps.findIndex(s => s.status !== "APPROVED");

    const handleUploadComplete = async (res: any[], stepId: string, docType: string, docName: string, autoSubmit: boolean, extraData?: any) => {
        setUploadingStepId(null);
        setUploadingDocType(null);
        if (res.length > 0) {
            const formData = new FormData();
            formData.append("stepId", stepId);
            formData.append("fileUrl", res[0].url);
            formData.append("type", docType);
            formData.append("name", docName);
            
            await addDocumentAction(formData);
            setUploadSuccessSteps(prev => [...prev, stepId]);
            
            if (autoSubmit) {
                await submitProcedureAction(stepId);
            }
            router.refresh();
        }
    };

    const handleSubmitStep = async (stepId: string, type: string) => {
        const step = steps.find(s => s.id === stepId);
        
        if (type === "DOCUMENT_COLLECTION") {
            const step4Docs = [
                { type: "PASSPORT", name: "Passport" },
                { type: "BIRTH_CERTIFICATE", name: "Birth Certificate" },
                { type: "ID_CARD", name: "National ID" },
                { type: "CV", name: "CV" },
                { type: "DIPLOMA", name: "Diploma" },
                { type: "OTHER", name: "Transcripts" },
                { type: "PASSPORT_PHOTO", name: "Passport Photo" }
            ];
            const uploadedNames = step?.Document?.map((d: any) => d.name) || [];
            const missing = step4Docs.filter(d => !uploadedNames.includes(d.name));
            
            if (missing.length > 0) {
                const missingLabels = missing.map(m => t(`docNames.${DOC_LABEL_KEYS[m.type]}` as any)).join(", ");
                setErrorModal(t("missingDocumentsError", { docs: missingLabels }));
                return;
            }
        }

        // Lock validation for Step N before N+1
        const currentIdx = APP_STEP_SEQUENCE.indexOf(type as any);
        if (currentIdx > 0) {
            const previousStepType = APP_STEP_SEQUENCE[currentIdx - 1];
            const previousStep = steps.find(s => s.type === previousStepType);
            if (previousStep && previousStep.status !== "APPROVED") {
                setErrorModal(t("completeStepFirstError", { step: currentIdx, label: tStepLabels(previousStepType as any) }));
                return;
            }
        }
        
        const res = await submitProcedureAction(stepId);
        if (res.error) setErrorModal(res.error);
        else {
            router.refresh();
            setExpandedStepId(null);
        }
    };

    const handleRequestAssistance = async () => {
        if (!assistanceMessage.trim()) return;
        setIsSubmittingAssistance(true);
        const step6 = steps.find(s => s.type === "LANGUAGE_TEST_REGISTRATION");
        if (step6) {
           const res = await submitProcedureAction(step6.id); 
           if (res.error) setErrorModal(res.error);
           else {
               setAssistanceModalOpen(false);
               setAssistanceMessage("");
               router.refresh();
           }
        }
        setIsSubmittingAssistance(false);
    };

    // Calculate progress based on APPROVED status
    const completedStepsCount = steps.filter(s => s.status === "APPROVED").length;
    const progressPercentage = Math.round((completedStepsCount / steps.length) * 100);

    return (
        <div className="space-y-8 pb-12">
            {/* Functional Progress Bar */}
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

            <div className="overflow-x-auto rounded-[50px] border border-gray-100 shadow-2xl shadow-gray-200/30 bg-white">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-sm font-bold text-gray-700">
                        <th className="p-4">{t("headers.stepNumber")}</th>
                        <th className="p-4">{t("headers.stepName")}</th>
                        <th className="p-4">{t("headers.status")}</th>
                        <th className="p-4">{t("headers.lastUpdated")}</th>
                        <th className="p-4">{t("headers.action")}</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {APP_STEP_SEQUENCE.map((stepType, idx) => {
                        const dbStep = steps.find(s => s.type === stepType);
                        const step = dbStep || {
                            id: `placeholder-${idx}`,
                            type: stepType,
                            status: idx < 3 ? "APPROVED" : "PENDING",
                            isLocked: idx < 3 ? false : true,
                            updatedAt: new Date(),
                            Document: []
                        };

                        const isCompleted = step.status === "APPROVED" || step.status === "COMPLETED";
                        const isUnlockedByAgent = !step.isLocked && step.status !== "PENDING";
                        const isNextActive = dbStep ? idx === firstIncompleteStepIdx : idx === 3;
                        const isActive = (isNextActive || isUnlockedByAgent) && !isPending && !isCompleted;
                        const isLocked = !isActive && !isCompleted;

                        const statusKey = isCompleted ? "completed" 
                                            : isActive ? "inProgress" 
                                            : "pending";
                        const displayStatus = t(`statusLabels.${statusKey}` as any);

                        // Required documents for Step 4
                        const step4Docs = [
                            { type: "PASSPORT", name: "Passport" },
                            { type: "BIRTH_CERTIFICATE", name: "Birth Certificate" },
                            { type: "ID_CARD", name: "National ID" },
                            { type: "CV", name: "CV" },
                            { type: "DIPLOMA", name: "Diploma" },
                            { type: "OTHER", name: "Transcripts" },
                            { type: "PASSPORT_PHOTO", name: "Passport Photo" }
                        ];

                        const renderActionColumn = () => {
                            if (isCompleted) {
                                return <span className="text-green-600 font-bold tracking-tight">{t("statusLabels.completed")}</span>;
                            }
                            if (isLocked) {
                                return <span className="text-gray-400 font-medium">{t("locked")}</span>;
                            }
                            if (!dbStep) {
                                return <span className="text-gray-400 text-xs italic">{t("legacyApplication")}</span>;
                            }

                            const getActionDescription = () => {
                                switch (stepType as string) {
                                    case "FEE_PAYMENT": return t("actionDescriptions.feePayment");
                                    case "MEDICAL_EXAMINATION": return t("actionDescriptions.medicalExam");
                                    case "LANGUAGE_TEST_REGISTRATION": return t("actionDescriptions.languageTestRegistration");
                                    case "LANGUAGE_TEST_RESULTS": return t("actionDescriptions.languageTestResults");
                                    case "CONTRACT_SIGNING": return t("actionDescriptions.contractSigning");
                                    default: return t("actionDescriptions.default");
                                }
                            };

                            // AGENT ONLY STEPS (Strict Workflow Requirements)
                            const AGENT_ONLY_STEPS = ["DIPLOMA_EQUIVALENCE", "PROFILE_CREATION", "APPLICATION_SUBMISSION", "PASSPORT_SUBMISSION"];
                            if (AGENT_ONLY_STEPS.includes(stepType as string)) {
                                if (stepType === "DIPLOMA_EQUIVALENCE") {
                                    return (
                                        <button 
                                            onClick={() => setExpandedStepId(expandedStepId === step.id ? null : step.id)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                        >
                                            {expandedStepId === step.id ? t("close") : t("uploadProof")}
                                        </button>
                                    );
                                }
                                return <span className="text-[#1E3A8A] font-black italic text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{t("handledByAgentOnly")}</span>;
                            } else if (stepType === "LANGUAGE_TEST_REGISTRATION") {
                                if (hasCompletedLanguageTest === true) {
                                    return <span className="text-emerald-600 font-bold italic text-xs">{t("skippedTestCompleted")}</span>;
                                }
                                return (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{t("haveYouCompletedTest")}</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setHasCompletedLanguageTest(true)}
                                                className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${hasCompletedLanguageTest === true ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {t("yes")}
                                            </button>
                                            <button 
                                                onClick={() => setHasCompletedLanguageTest(false)}
                                                className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${hasCompletedLanguageTest === false ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {t("no")}
                                            </button>
                                        </div>
                                        {hasCompletedLanguageTest === false && (
                                            <button 
                                                onClick={() => setAssistanceModalOpen(true)}
                                                className="w-full bg-[#1E3A8A] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-100"
                                            >
                                                {t("requestAgentAssistance")}
                                            </button>
                                        )}
                                    </div>
                                );
                            } else if (stepType === "LANGUAGE_TEST_RESULTS") {
                                if (hasCompletedLanguageTest === false) {
                                    return <span className="text-gray-400 italic text-[10px] uppercase font-black">{t("waitingForRegistration")}</span>;
                                }
                            }

                            if (stepType === "DOCUMENT_COLLECTION") {
                                return (
                                    <button 
                                        onClick={() => setExpandedStepId(expandedStepId === step.id ? null : step.id)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                    >
                                        {expandedStepId === step.id ? t("closeDocuments") : t("manageDocuments")}
                                    </button>
                                );
                            }

                            // Stable English identifier stored as the Document's `name` field in the DB
                            const getActionDescriptionStorageName = () => {
                                switch (stepType as string) {
                                    case "FEE_PAYMENT": return "Payment Receipt";
                                    case "MEDICAL_EXAMINATION": return "Medical Report";
                                    case "LANGUAGE_TEST_REGISTRATION": return "Test Registration";
                                    case "LANGUAGE_TEST_RESULTS": return "Test Results";
                                    case "CONTRACT_SIGNING": return "Signed Contract";
                                    default: return "Required Document";
                                }
                            };

                            const isUploadSuccess = uploadSuccessSteps.includes(step.id);

                            return (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{getActionDescription()}</span>
                                    {uploadingStepId === step.id ? (
                                        <span className="text-blue-500 font-bold text-xs animate-pulse">{t("uploading")}</span>
                                    ) : isUploadSuccess ? (
                                        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100">
                                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                            {t("uploadSuccess")}
                                        </div>
                                    ) : (
                                        <UploadButton
                                            endpoint="documentUploader"
                                            onUploadBegin={() => setUploadingStepId(step.id)}
                                            onClientUploadComplete={(res) => handleUploadComplete(res, step.id, "OTHER", getActionDescriptionStorageName(), true)}
                                            onUploadError={(err: Error) => { setErrorModal(err.message); setUploadingStepId(null); }}
                                            appearance={{
                                                button: "bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-blue-700 w-full shadow-lg shadow-blue-50 transition-all active:scale-95",
                                                allowedContent: "hidden"
                                            }}
                                            content={{ button({ ready }) { return ready ? t("uploadFile") : t("loading"); } }}
                                        />
                                    )}
                                </div>
                            );
                        };

                        return (
                            <React.Fragment key={step.id}>
                                <tr className={`border-b border-gray-100 ${isLocked ? 'bg-gray-50 text-gray-400' : 'text-gray-900 hover:bg-gray-50 transition-colors'}`}>
                                    <td className="p-4 font-bold">{idx + 1}</td>
                                    <td className="p-4 font-semibold text-gray-800">
                                        {step.type === "PROFILE_CREATION" 
                                            ? t("profileCreationLabel")
                                            : tStepLabels(step.type as any)
                                        }
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm ${
                                            statusKey === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            statusKey === 'inProgress' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            'bg-gray-100 text-gray-500 border border-gray-200'
                                        }`}>
                                            {displayStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 font-medium italic">
                                        {dbStep ? new Date(step.updatedAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4">
                                        {renderActionColumn()}
                                    </td>
                                </tr>

                                {/* Sub-Table for Step 4 (Document Collection) */}
                                {expandedStepId === step.id && stepType === "DOCUMENT_COLLECTION" && (
                                    <tr className="bg-blue-50 border-b border-gray-200">
                                        <td colSpan={5} className="p-6">
                                            <div className="bg-white rounded-[32px] border border-blue-100 shadow-xl p-8 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-black text-gray-900 uppercase tracking-tighter text-xl">{t("requiredDocumentsRoadmap")}</h4>
                                                        <p className="text-xs text-gray-500 font-bold mt-1">{t("provideAllMandatoryFiles")}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleSubmitStep(step.id, "DOCUMENT_COLLECTION")}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                                    >
                                                        {t("finalizeSubmission")}
                                                    </button>
                                                </div>
                                                <table className="w-full text-left text-sm mt-4">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                            <th className="py-4 px-2">{t("documentCategory")}</th>
                                                            <th className="py-4 px-2">{t("currentStatus")}</th>
                                                            <th className="py-4 px-2">{t("headers.action")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {step4Docs.map(docReq => {
                                                            const uploadedDoc = step.Document?.find((d: any) => d.name === docReq.name);
                                                            const docLabel = t(`docNames.${DOC_LABEL_KEYS[docReq.type]}` as any);
                                                            return (
                                                                <tr key={docReq.name} className="border-b border-gray-50 group transition-colors hover:bg-gray-50/50">
                                                                    <td className="py-4 px-2 font-black text-gray-700 uppercase text-[10px] tracking-tight">{docLabel}</td>
                                                                    <td className="py-4 px-2">
                                                                        {uploadedDoc ? (
                                                                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border border-emerald-100">{t("uploaded")}</span>
                                                                        ) : (
                                                                            <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border border-red-100">{t("required")}</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-2">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-28">
                                                                                {uploadingDocType === docReq.type ? (
                                                                                    <span className="text-blue-500 font-bold text-[10px] animate-pulse">{t("processing")}</span>
                                                                                ) : (
                                                                                    <UploadButton
                                                                                        endpoint="documentUploader"
                                                                                        onUploadBegin={() => setUploadingDocType(docReq.type)}
                                                                                        onClientUploadComplete={(res) => handleUploadComplete(res, step.id, docReq.type, docReq.name, false)}
                                                                                        onUploadError={(err: Error) => { setErrorModal(err.message); setUploadingDocType(null); }}
                                                                                        appearance={{
                                                                                            button: "bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-blue-700 w-full shadow-md shadow-blue-50 transition-all",
                                                                                            allowedContent: "hidden"
                                                                                        }}
                                                                                        content={{ button({ ready }) { return ready ? (uploadedDoc ? t("replace") : t("upload")) : "..."; } }}
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                            {uploadedDoc && (
                                                                                <a href={uploadedDoc.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 flex items-center gap-2">
                                                                                     <Globe size={10} /> {t("view")}
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                 {/* Profile Creation Box (Step 8) - Modern Agent Managed Display */}
                                {expandedStepId === step.id && stepType === "PROFILE_CREATION" && (
                                    <tr className="bg-blue-50 border-b border-gray-200">
                                        <td colSpan={5} className="p-6">
                                            <div className="bg-white rounded-[32px] border border-blue-100 shadow-xl p-10 text-center space-y-6">
                                                <div className="w-20 h-20 bg-blue-50 text-[#1E3A8A] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                                    <Globe size={40} />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-black text-gray-900 uppercase tracking-tighter text-2xl">{t("administrativeManagement")}</h4>
                                                    <p className="text-sm text-gray-500 font-bold max-w-sm mx-auto leading-relaxed">
                                                        {t("adminManagedDesc")}
                                                    </p>
                                                </div>
                                                <div className="pt-4">
                                                    <span className="bg-blue-50 text-[#1E3A8A] px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-blue-100 shadow-sm italic">{t("statusMonitoringInProgress")}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* Diploma Equivalence Box (Step 5) - Optimized Optional Upload */}
                                {expandedStepId === step.id && stepType === "DIPLOMA_EQUIVALENCE" && (
                                    <tr className="bg-blue-50 border-b border-gray-200">
                                        <td colSpan={5} className="p-6">
                                            <div className="bg-white rounded-[32px] border border-blue-100 shadow-xl p-10 space-y-8">
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-50 pb-8">
                                                    <div className="text-center md:text-left">
                                                        <h4 className="font-black text-gray-900 uppercase tracking-tighter text-2xl">{t("diplomaEquivalenceSupport")}</h4>
                                                        <p className="text-sm text-gray-500 font-bold mt-1">{t("diplomaManagedDesc")}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setExpandedStepId(null)}
                                                        className="text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-colors"
                                                    >
                                                        {t("closePortal")}
                                                    </button>
                                                </div>
                                                
                                                <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-black">!</div>
                                                        <span className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest">{t("optionalSubmissionPortal")}</span>
                                                    </div>
                                                    
                                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                                        {step.Document?.some((d: any) => d.name === "Equivalence_Proof") ? (
                                                            <div className="flex-1 w-full p-6 bg-white border border-emerald-100 rounded-2xl flex items-center justify-between gap-4 shadow-lg shadow-emerald-50/50">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
                                                                    <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">{t("supportingProofSubmitted")}</span>
                                                                </div>
                                                                {(() => {
                                                                    const doc = step.Document.find((d: any) => d.name === "Equivalence_Proof");
                                                                    return (
                                                                        <a href={doc?.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-[#1E3A8A] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-md">
                                                                            {t("viewUpload")}
                                                                        </a>
                                                                    );
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 w-full">
                                                                <UploadButton
                                                                    endpoint="documentUploader"
                                                                    onClientUploadComplete={(res) => handleUploadComplete(res, step.id, "OTHER", "Equivalence_Proof", false)}
                                                                    appearance={{ 
                                                                        button: "bg-[#1E3A8A] text-white text-[10px] font-black uppercase tracking-widest px-10 py-4 rounded-2xl hover:bg-blue-900 w-full shadow-xl shadow-blue-100 transition-all active:scale-95", 
                                                                        allowedContent: "hidden" 
                                                                    }}
                                                                    content={{ button({ ready }) { return ready ? t("uploadSupportingProof") : t("preparingPortal"); } }}
                                                                    onUploadError={(err) => setErrorModal(err.message)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                                    <AlertCircle size={18} className="text-[#1E3A8A] mt-0.5 flex-shrink-0" />
                                                    <p className="text-[10px] text-[#1E3A8A] font-bold leading-relaxed italic">
                                                        {t("diplomaNote")}
                                                    </p>
                                                </div>
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

            {/* ERROR / NOTIFICATION MODAL */}
            {errorModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl border border-gray-100 space-y-8 text-center ring-1 ring-black/5">
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto text-4xl shadow-inner animate-pulse">
                            <AlertCircle size={48} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{t("systemNotification")}</h3>
                            <p className="text-gray-500 font-bold leading-relaxed">{errorModal}</p>
                        </div>
                        <button 
                            onClick={() => setErrorModal(null)}
                            className="w-full bg-[#1E3A8A] text-white font-black py-5 rounded-2xl hover:bg-blue-900 transition-all uppercase tracking-widest text-sm shadow-xl shadow-blue-100"
                        >
                            {t("confirmUnderstood")}
                        </button>
                    </div>
                </div>
            )}

            {/* ASSISTANCE MODAL */}
            {assistanceModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-[40px] p-12 max-w-lg w-full shadow-2xl border border-gray-100 space-y-8 ring-1 ring-black/5">
                        <div className="flex items-center gap-6 border-b-2 border-gray-50 pb-8">
                            <div className="bg-blue-50 p-4 rounded-3xl text-[#1E3A8A] shadow-inner">
                                <Globe size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{t("agentSupport")}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("connectWithCaseOfficer")}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t("assistanceDetails")}</label>
                            <textarea 
                                value={assistanceMessage}
                                onChange={(e) => setAssistanceMessage(e.target.value)}
                                className="w-full h-40 p-6 bg-gray-50/50 border-2 border-gray-100 rounded-[32px] focus:ring-8 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none text-sm font-bold text-gray-700 placeholder-gray-300 shadow-inner"
                                placeholder={t("stateRequirements")}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setAssistanceModalOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-400 font-black py-5 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                            >
                                {t("discard")}
                            </button>
                            <button 
                                onClick={handleRequestAssistance}
                                disabled={isSubmittingAssistance}
                                className="flex-1 bg-[#1E3A8A] text-white font-black py-5 rounded-2xl hover:bg-blue-900 transition-all uppercase tracking-widest text-xs shadow-xl shadow-blue-100 disabled:opacity-50"
                            >
                                {isSubmittingAssistance ? t("transmitting") : t("sendRequest")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}