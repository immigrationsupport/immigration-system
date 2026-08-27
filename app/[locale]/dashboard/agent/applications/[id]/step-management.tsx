"use client";

import React, { useState } from "react";
import { Loader2, Upload, FileCheck2, ChevronDown } from "lucide-react";
import { STEP_LABELS } from "@/lib/steps";
import { updateStepAction, updateApplicationStatusAction, addDocumentAction, deleteDocumentAction, toggleSubStepAction } from "../actions";
import { useParams, useRouter } from "next/navigation";
import { UploadButton } from "@/src/utils/uploadthing";

// Same document types the client picks from when uploading — kept here so
// the agent/admin can label an upload the same way the client would.
const DOCUMENT_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: "PASSPORT", label: "Passport" },
    { value: "PASSPORT_PHOTO", label: "Passport Photo" },
    { value: "BIRTH_CERTIFICATE", label: "Birth Certificate" },
    { value: "ID_CARD", label: "National ID Card" },
    { value: "DIPLOMA", label: "Diploma / Degree" },
    { value: "TRANSCRIPT", label: "Academic Transcript" },
    { value: "CV", label: "CV / Resume" },
    { value: "WORK_CERTIFICATE", label: "Work Certificate" },
    { value: "LANGUAGE_REGISTRATION", label: "Language Test Registration" },
    { value: "LANGUAGE_RESULT", label: "Language Test Result" },
    { value: "MEDICAL", label: "Medical Examination" },
    { value: "POLICE_CLEARANCE", label: "Police Clearance" },
    { value: "VISA_APPROVAL", label: "Visa Approval" },
    { value: "OTHER", label: "Other Document" }
];

// Built-in step types where the whole point of the step IS getting a
// document from the client (a collected ID, a test result certificate, a
// medical certificate, a passport/visa copy). Registration, Contract
// Signing, Fee Payment, Application Submission, Profile Creation, and
// Language Test Registration are actions/status changes, not document
// hand-offs, so they don't get an upload control by default.
const DOCUMENT_BEARING_STEP_TYPES = [
    "DOCUMENT_COLLECTION",
    "LANGUAGE_TEST_RESULTS",
    "MEDICAL_EXAMINATION",
    "PASSPORT_SUBMISSION"
];

// A step gets the upload control only if it's one of the built-in
// document-bearing types above, OR the admin has explicitly listed
// required documents for it (custom steps, or a built-in step the admin
// decided also needs proof — e.g. Diploma Equivalence).
function stepNeedsDocuments(step: any): boolean {
    if (step.type && DOCUMENT_BEARING_STEP_TYPES.includes(step.type)) return true;
    return Array.isArray(step.requiredDocuments) && step.requiredDocuments.length > 0;
}

interface StepManagementProps {
    applicationId: string;
    currentStatus: string;
    steps: any[];
    country: string;
    // Called after any successful mutation (upload, delete, status change,
    // sub-step toggle...) in addition to router.refresh(). Server-rendered
    // pages don't need this — router.refresh() alone re-fetches their data.
    // But client-fetched views (e.g. the admin's details modal, which loads
    // its own data in a useEffect) need this to actually see the change
    // without the user manually reloading the page.
    onRefresh?: () => void;
}

export default function StepManagement({ applicationId, currentStatus, steps, country, onRefresh }: StepManagementProps) {
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || "en-US";
    const [appStatus, setAppStatus] = useState(currentStatus);
    const [loadingAppStatus, setLoadingAppStatus] = useState(false);
    const [loadingStepId, setLoadingStepId] = useState<string | null>(null);
    
    // MODAL States
    const [requestModal, setRequestModal] = useState<{ stepId: string, stepName: string } | null>(null);
    const [requestMsg, setRequestMsg] = useState("");
    const [isSubmittingRes, setIsSubmittingRes] = useState(false);
    const [successModal, setSuccessModal] = useState<string | null>(null);
    const [uploadingStepId, setUploadingStepId] = useState<string | null>(null);
    const [loadingSubStepId, setLoadingSubStepId] = useState<string | null>(null);
    // Which document type is currently selected per step, before upload.
    const [docType, setDocType] = useState<Record<string, string>>({});

    // Refreshes both the server-rendered route (if any) and the caller's
    // own data source (if it passed one) — see onRefresh above.
    const refreshAll = () => {
        router.refresh();
        onRefresh?.();
    };

    const handleToggleSubStep = async (subStepId: string, isCompleted: boolean) => {
        setLoadingSubStepId(subStepId);
        const res = await toggleSubStepAction(subStepId, isCompleted);
        setLoadingSubStepId(null);
        if (res.error) alert(res.error);
        else refreshAll();
    };

    // Called once UploadThing has finished hosting the file — we just save
    // the resulting URL against this step, labeled with the chosen document type.
    const handleUploadComplete = async (stepId: string, file: { url: string; name: string }) => {
        try {
            const type = docType[stepId] || "OTHER";
            const label = DOCUMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label || file.name;
            const res = await addDocumentAction(stepId, label, file.url, type);
            if (res.error) alert(res.error);
            else refreshAll();
        } catch (e) {
            alert("Upload failed. Please try again.");
        } finally {
            setUploadingStepId(null);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (!confirm("Remove this document?")) return;
        const res = await deleteDocumentAction(documentId);
        if (res.error) alert(res.error);
        else refreshAll();
    };

    // Sort steps by the order they were created with (matches the agency's
    // step workflow at the time this application was created).
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

    const handleUpdateAppStatus = async (status: string) => {
        setLoadingAppStatus(true);
        const res = await updateApplicationStatusAction(applicationId, status);
        setLoadingAppStatus(false);
        if (res.error) alert(res.error);
        else {
            setAppStatus(status);
            onRefresh?.();
        }
    };

    const handleUpdateStep = async (stepId: string, data: any) => {
        setLoadingStepId(stepId);
        const res = await updateStepAction(stepId, data);
        setLoadingStepId(null);
        if (res.error) alert(res.error);
        else refreshAll();
    };

    return (
        <div className="w-full space-y-8">
            
            {/* Global Status Control */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Update Procedure Status</h3>
                    <p className="text-sm text-gray-500">Global status control</p>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                    {["PENDING", "IN_REVIEW", "APPROVED", "REJECTED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleUpdateAppStatus(status)}
                            disabled={loadingAppStatus}
                            className={`px-4 py-2 text-sm font-bold border ${
                                appStatus === status 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                        >
                            {status.replace("_", " ")}
                        </button>
                    ))}
                    {loadingAppStatus && <Loader2 className="animate-spin h-5 w-5 text-blue-500" />}
                </div>
            </div>

            {/* Individual Step Management Table (Same as Client View but with Agent Controls) */}
            <div className="w-full overflow-x-auto bg-white border border-gray-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-sm font-bold text-gray-700">
                            <th className="p-4">Step Number</th>
                            <th className="p-4">Step Name</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Last Updated Date</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {sortedSteps.map((step, idx) => {
                            const dbStep = step;
                            const isLocked = step.isLocked;
                            return (
                                <tr key={step.id} className={`border-b border-gray-100 ${isLocked ? 'bg-gray-50 text-gray-400' : 'text-gray-900 hover:bg-gray-50'}`}>
                                    <td className="p-4 font-bold">{idx + 1}</td>
                                    <td className="p-4 font-semibold text-gray-800">
                                        {step.type === "PROFILE_CREATION"
                                            ? (step.label || "Profile Creation (Express Entry / Arrima)")
                                            : (step.label || STEP_LABELS[step.type as keyof typeof STEP_LABELS])
                                        }
                                    </td>
                                    
                                    {/* Agent can change step status manually */}
                                    <td className="p-4">
                                        <select 
                                            value={step.status}
                                            onChange={(e) => handleUpdateStep(step.id, { status: e.target.value })}
                                            disabled={!dbStep || loadingStepId === step.id}
                                            className="px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer min-w-[120px]"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="APPROVED">Approved</option>
                                            {idx >= 3 && <option value="ACTION_REQUIRED">Action Required</option>}
                                        </select>
                                        {loadingStepId === step.id && <span className="ml-2 text-xs text-blue-500">...</span>}
                                    </td>
                                    
                                    <td className="p-4">
                                        {dbStep ? new Date(step.updatedAt).toLocaleDateString(locale) : '-'}
                                    </td>
                                    
                                    <td className="p-4 flex flex-col gap-2">
                                         {/* Lock / Unlock Toggle */}
                                         {dbStep ? (
                                             <div className="flex flex-wrap gap-2">
                                                 <button 
                                                     onClick={() => handleUpdateStep(step.id, { isLocked: !step.isLocked })}
                                                     disabled={loadingStepId === step.id}
                                                     className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest w-fit rounded ${
                                                         step.isLocked ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                     }`}
                                                 >
                                                     {step.isLocked ? "Unlock Step" : "Lock Step"}
                                                 </button>
                                                 
                                                 {idx >= 3 && dbStep && (
                                                     <button
                                                         onClick={() => setRequestModal({ stepId: step.id, stepName: step.label || STEP_LABELS[step.type as keyof typeof STEP_LABELS] })}
                                                         disabled={loadingStepId === step.id}
                                                         className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-all shadow-lg shadow-amber-100 flex items-center gap-2"
                                                     >
                                                         Request Modification
                                                     </button>
                                                 )}
                                             </div>
                                         ) : (
                                             <span className="text-xs text-gray-400 italic font-bold">Legacy Procedure</span>
                                         )}

                                         {/* Step 5 Specialized Input */}
                                         {step.type === "DIPLOMA_EQUIVALENCE" && dbStep && (
                                             <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                                                 <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Equivalence Details</p>
                                                 <select 
                                                     onChange={(e) => handleUpdateStep(step.id, { organization: e.target.value })}
                                                     className="w-full text-xs font-bold p-2 border border-blue-200 rounded-lg bg-white"
                                                     defaultValue={step.description?.match(/Org: ([^|]+)/)?.[1]?.trim() || ""}
                                                 >
                                                     <option value="">Select Organization</option>
                                                     <option value="WES">WES</option>
                                                     <option value="ICAS">ICAS</option>
                                                     <option value="IQAS">IQAS</option>
                                                     <option value="ICES">ICES</option>
                                                     <option value="MCC">MCC</option>
                                                 </select>
                                             </div>
                                         )}

                                         {/* Language Test Registration - test type selector */}
                                         {step.type === "LANGUAGE_TEST_REGISTRATION" && dbStep && (
                                             <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                                                 <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Language Test</p>
                                                 <select
                                                     onChange={(e) => handleUpdateStep(step.id, { languageTest: e.target.value })}
                                                     className="w-full text-xs font-bold p-2 border border-blue-200 rounded-lg bg-white"
                                                     defaultValue={step.description?.match(/Test: ([^|]+)/)?.[1]?.trim() || ""}
                                                 >
                                                     <option value="">Select Test</option>
                                                     <option value="TCF">TCF</option>
                                                     <option value="TEF">TEF</option>
                                                     <option value="IELTS">IELTS</option>
                                                 </select>
                                             </div>
                                         )}

                                         {/* Required documents checklist — set by the admin per workflow, purely informational */}
                                         {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                                             <div className="mt-4 p-4 bg-amber-50/60 border border-amber-100 rounded-xl space-y-2">
                                                 <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                                                     <FileCheck2 className="h-3.5 w-3.5" /> Documents needed for this step
                                                 </span>
                                                 <div className="flex flex-wrap gap-1.5">
                                                     {step.requiredDocuments.map((docName: string, i: number) => {
                                                         const isProvided = step.Document?.some((d: any) =>
                                                             d.name.toLowerCase().includes(docName.toLowerCase())
                                                         );
                                                         return (
                                                             <span
                                                                 key={i}
                                                                 className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                                                                     isProvided
                                                                         ? "bg-green-50 border-green-200 text-green-700"
                                                                         : "bg-white border-amber-200 text-amber-700"
                                                                 }`}
                                                             >
                                                                 {docName}
                                                             </span>
                                                         );
                                                     })}
                                                 </div>
                                             </div>
                                         )}

                                         {/* View Documents */}
                                         {step.Document && step.Document.length > 0 && (
                                             <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Attachments</span>
                                                 <div className="flex flex-col gap-1.5">
                                                     {step.Document.map((doc: any) => (
                                                         <div key={doc.id} className="flex items-center justify-between gap-2">
                                                             <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-2">
                                                                 <div className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                                                                 {doc.name.replace("_", " ")}
                                                             </a>
                                                             {dbStep && (
                                                                 <button
                                                                     type="button"
                                                                     onClick={() => handleDeleteDocument(doc.id)}
                                                                     className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest"
                                                                 >
                                                                     Remove
                                                                 </button>
                                                             )}
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         )}

                                         {/* Sub-steps checklist */}
                                         {step.subSteps && step.subSteps.length > 0 && (
                                             <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Checklist</span>
                                                 <div className="flex flex-col gap-1.5">
                                                     {step.subSteps.map((sub: any) => (
                                                         <label key={sub.id} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                                             <input
                                                                 type="checkbox"
                                                                 checked={sub.isCompleted}
                                                                 disabled={loadingSubStepId === sub.id}
                                                                 onChange={() => handleToggleSubStep(sub.id, !sub.isCompleted)}
                                                             />
                                                             <span className={sub.isCompleted ? "line-through text-gray-400" : ""}>{sub.label}</span>
                                                         </label>
                                                     ))}
                                                 </div>
                                             </div>
                                         )}

                                         {dbStep && stepNeedsDocuments(step) && (
                                             <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-wrap items-center gap-2">
                                                 <div className="relative">
                                                     <select
                                                         value={docType[step.id] || "OTHER"}
                                                         onChange={(e) => setDocType((prev) => ({ ...prev, [step.id]: e.target.value }))}
                                                         className="appearance-none text-xs font-bold pl-3 pr-7 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer"
                                                     >
                                                         {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                                                             <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                         ))}
                                                     </select>
                                                     <ChevronDown className="h-3 w-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                 </div>

                                                 <div className="relative">
                                                     <div className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${uploadingStepId === step.id ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                                                         {uploadingStepId === step.id ? (
                                                             <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                         ) : (
                                                             <>
                                                                 <Upload className="h-3.5 w-3.5" />
                                                                 <span>Upload File</span>
                                                             </>
                                                         )}
                                                     </div>
                                                     {uploadingStepId !== step.id && (
                                                         <div className="absolute inset-0 opacity-0">
                                                             <UploadButton
                                                                 endpoint="documentUploader"
                                                                 appearance={{
                                                                     button: "w-full h-full cursor-pointer",
                                                                     container: "w-full h-full",
                                                                     allowedContent: "hidden"
                                                                 }}
                                                                 onUploadBegin={() => setUploadingStepId(step.id)}
                                                                 onClientUploadComplete={(res) => {
                                                                     const file = res[0];
                                                                     handleUploadComplete(step.id, file);
                                                                 }}
                                                                 onUploadError={(error: Error) => {
                                                                     setUploadingStepId(null);
                                                                     alert(`Upload error: ${error.message}`);
                                                                 }}
                                                             />
                                                         </div>
                                                     )}
                                                 </div>
                                                 <span className="text-[10px] text-gray-400 font-semibold">PDF, JPG, PNG</span>
                                             </div>
                                         )}

                                     </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* REQUEST MODAL */}
            {requestModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl space-y-6">
                        <div className="flex items-center gap-4 border-b-2 border-gray-50 pb-6">
                            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                                <Loader2 size={24} className={isSubmittingRes ? "animate-spin" : ""} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">Modification Request</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">STEP: {requestModal?.stepName}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-500 leading-relaxed">Clearly describe what the client needs to change or provide:</p>
                            <textarea 
                                value={requestMsg}
                                onChange={(e) => setRequestMsg(e.target.value)}
                                className="w-full h-32 p-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-amber-50 focus:border-amber-500 transition-all outline-none text-sm font-medium"
                                placeholder="Example: The passport scan is blurry. Please re-upload a clear high-resolution PDF..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => { setRequestModal(null); setRequestMsg(""); }}
                                className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={async () => {
                                    if (!requestMsg.trim() || !requestModal) return;
                                    setIsSubmittingRes(true);
                                    const res = await updateStepAction(requestModal.stepId, { 
                                        status: "ACTION_REQUIRED", 
                                        description: requestMsg 
                                    });
                                    setIsSubmittingRes(false);
                                    if (res.error) alert(res.error);
                                    else {
                                        setRequestModal(null);
                                        setRequestMsg("");
                                        refreshAll();
                                    }
                                }}
                                disabled={isSubmittingRes}
                                className="flex-1 bg-amber-500 text-white font-black py-4 rounded-2xl hover:bg-amber-600 transition-all uppercase tracking-widest text-xs shadow-lg shadow-amber-100 disabled:opacity-50"
                            >
                                {isSubmittingRes ? "Sending..." : "Send Request Agent"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS MODAL */}
            {successModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl">✓</div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">{successModal}</h3>
                        <button onClick={() => setSuccessModal(null)} className="w-full bg-[#1E3A8A] text-white font-black py-4 rounded-2xl hover:bg-blue-900 transition-all uppercase tracking-widest">Understood</button>
                    </div>
                </div>
            )}
        </div>
    );
}