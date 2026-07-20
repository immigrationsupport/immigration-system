"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { STEP_LABELS, APP_STEP_SEQUENCE } from "@/lib/steps";
import { updateStepAction, updateApplicationStatusAction } from "../actions";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface StepManagementProps {
    applicationId: string;
    currentStatus: string;
    steps: any[];
    country: string;
}

export default function StepManagement({ applicationId, currentStatus, steps, country }: StepManagementProps) {
    const router = useRouter();
    const locale = useLocale();
    const [appStatus, setAppStatus] = useState(currentStatus);
    const [loadingAppStatus, setLoadingAppStatus] = useState(false);
    const [loadingStepId, setLoadingStepId] = useState<string | null>(null);
    
    // MODAL States
    const [requestModal, setRequestModal] = useState<{ stepId: string, stepName: string } | null>(null);
    const [requestMsg, setRequestMsg] = useState("");
    const [isSubmittingRes, setIsSubmittingRes] = useState(false);
    const [successModal, setSuccessModal] = useState<string | null>(null);

    // Sort steps strictly according to sequence
    const sortedSteps = [...steps].sort((a, b) => {
        return APP_STEP_SEQUENCE.indexOf(a.type) - APP_STEP_SEQUENCE.indexOf(b.type);
    });

    const handleUpdateAppStatus = async (status: string) => {
        setLoadingAppStatus(true);
        const res = await updateApplicationStatusAction(applicationId, status);
        setLoadingAppStatus(false);
        if (res.error) alert(res.error);
        else setAppStatus(status);
    };

    const handleUpdateStep = async (stepId: string, data: any) => {
        setLoadingStepId(stepId);
        const res = await updateStepAction(stepId, data);
        setLoadingStepId(null);
        if (res.error) alert(res.error);
        else router.refresh();
    };

    return (
        <div className="w-full space-y-8">
            
            {/* Global Status Control */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Update Application Status</h3>
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

                            const isLocked = step.isLocked;
                            return (
                                <tr key={step.id} className={`border-b border-gray-100 ${isLocked ? 'bg-gray-50 text-gray-400' : 'text-gray-900 hover:bg-gray-50'}`}>
                                    <td className="p-4 font-bold">{idx + 1}</td>
                                    <td className="p-4 font-semibold text-gray-800">
                                        {step.type === "PROFILE_CREATION" 
                                            ? "Profile Creation (Express Entry / Arrima)"
                                            : STEP_LABELS[step.type as keyof typeof STEP_LABELS]
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
                                                         onClick={() => setRequestModal({ stepId: step.id, stepName: STEP_LABELS[step.type as keyof typeof STEP_LABELS] })}
                                                         disabled={loadingStepId === step.id}
                                                         className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-all shadow-lg shadow-amber-100 flex items-center gap-2"
                                                     >
                                                         Request Modification
                                                     </button>
                                                 )}
                                             </div>
                                         ) : (
                                             <span className="text-xs text-gray-400 italic font-bold">Legacy Application</span>
                                         )}

                                         {/* Step 5 Specialized Input */}
                                         {stepType === "DIPLOMA_EQUIVALENCE" && dbStep && (
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

                                         {/* View Documents */}
                                         {step.Document && step.Document.length > 0 ? (
                                             <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Attachments</span>
                                                 <div className="flex flex-col gap-1.5">
                                                     {step.Document.map((doc: any) => (
                                                         <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-2">
                                                             <div className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                                                             {doc.name.replace("_", " ")}
                                                         </a>
                                                     ))}
                                                 </div>
                                             </div>
                                         ) : (
                                              idx >= 3 && stepType !== "APPLICATION_SUBMISSION" && stepType !== "PASSPORT_SUBMISSION" && (
                                                  <span className="text-[10px] font-bold text-gray-400 italic mt-2 px-1">Awaiting client documents...</span>
                                              )
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
                                        router.refresh();
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