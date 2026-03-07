"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Save, Send } from "lucide-react";

export default function AddProcedurePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call to submit the application
        setTimeout(() => {
            setLoading(false);
            router.push("/dashboard/client/applications");
        }, 800);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
                <Link
                    href="/dashboard/client/applications"
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add Procedure</h1>
                    <p className="text-sm text-gray-500 mt-1">Start a new immigration procedure application.</p>
                </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                    {/* General Details */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Application Details</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="procedureType" className="block text-sm font-semibold text-gray-800 mb-1">Procedure Type</label>
                                <select
                                    id="procedureType"
                                    name="procedureType"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm bg-white"
                                >
                                    <option value="">Select a procedure...</option>
                                    <option value="work_visa">Work Visa</option>
                                    <option value="student_visa">Student Visa</option>
                                    <option value="permanent_residency">Permanent Residency</option>
                                    <option value="tourist_visa">Tourist / Visitor Visa</option>
                                    <option value="citizenship">Citizenship Application</option>
                                    <option value="corporate">Business / Corporate Visa</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="destinationCountry" className="block text-sm font-semibold text-gray-800 mb-1">Destination Country</label>
                                <input
                                    type="text"
                                    id="destinationCountry"
                                    name="destinationCountry"
                                    placeholder="e.g. Canada, USA, UK"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="passportNumber" className="block text-sm font-semibold text-gray-800 mb-1">Passport Number</label>
                            <input
                                type="text"
                                id="passportNumber"
                                name="passportNumber"
                                placeholder="Enter your valid passport number"
                                required
                                className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm max-w-sm"
                            />
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Upload Documents</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                            <UploadCloud className="w-10 h-10 text-[#1E3A8A] mb-3" />
                            <p className="text-sm text-gray-700 font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (Max 10MB per file)</p>
                            <input type="file" className="hidden" multiple />
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Notes</h2>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-semibold text-gray-800 mb-1">Additional Information (Optional)</label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                placeholder="Provide any extra details or inquiries to the consulting team."
                                className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm resize-y"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/client/applications")}
                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2 inline-block" />
                            Save Draft
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-[#1E3A8A] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Submitting..." : (
                                <>
                                    <Send className="w-4 h-4 mr-2 inline-block" /> Submit Application
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
