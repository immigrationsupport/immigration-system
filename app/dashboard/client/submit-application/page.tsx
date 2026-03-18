"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Upload, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubmitApplicationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [success, setSuccess] = useState(false);

    // Mock file upload handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setLoading(false);
        setSuccess(true);

        // Reset form or redirect
        setTimeout(() => {
            router.push("/dashboard/client/applications");
        }, 2000);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
                <p className="text-gray-500 max-w-md">
                    Your application has been successfully submitted and is now pending review. You can track its status in the "My Applications" section.
                </p>
                <Button onClick={() => router.push("/dashboard/client/applications")}>
                    View Applications
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-primary)]">Submit New Application</h1>
                <p className="text-gray-500">Fill in the details below to start your immigration process.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Application Details</CardTitle>
                        <CardDescription>All fields marked with * are required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Application Type *</Label>
                                <select
                                    id="type"
                                    name="type"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                                    required
                                >
                                    <option value="">Select a type...</option>
                                    <option value="work">Work Visa</option>
                                    <option value="study">Study Visa</option>
                                    <option value="pr">Permanent Residency</option>
                                    <option value="family">Family Reunification</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority Level</Label>
                                <select
                                    id="priority"
                                    name="priority"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Application Title *</Label>
                            <Input id="title" name="title" placeholder="e.g., Work Visa for Canada" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <textarea
                                id="description"
                                name="description"
                                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none"
                                placeholder="Please provide additional details... (Max 500 characters)"
                                maxLength={500}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>Documents Upload</Label>
                            <div className="relative group p-10 border-2 border-dashed border-blue-100 rounded-3xl bg-blue-50/10 hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center">
                                <Input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Browse your files</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">Drag & Drop or Click to choose from device</p>
                                <div className="mt-6 px-6 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 group-hover:bg-blue-900 transition-colors">
                                    Select Documents
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-4">PDF, JPG, PNG (Max 10MB per file)</p>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                    {file.name.split('.').pop()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost"  onClick={() => removeFile(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="confirm" required className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                            <label htmlFor="confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I confirm that the information provided is accurate and complete.
                            </label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
                        <div className="space-x-2">
                            <Button type="button" variant="outline">Save as Draft</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Submitting..." : "Submit Application"}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
