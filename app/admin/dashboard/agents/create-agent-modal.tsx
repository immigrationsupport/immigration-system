"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { createAgentAction } from "./actions";

export default function CreateAgentModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const res = await createAgentAction(formData);

        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            alert("Agent created successfully!");
            setIsOpen(false);
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-white"
                style={{ backgroundColor: "#1E3A8A", borderRadius: "8px" }}
            >
                <Plus size={16} />
                Create Agent
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-[#1E3A8A]">Create New Agent</h2>
                        <p className="text-sm text-gray-500 mb-6">Enter details to create an agent account.</p>

                        {error && (
                            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                    placeholder="e.g. John Agent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                    placeholder="agent@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                    placeholder="Enter secure password"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    style={{ backgroundColor: "#1E3A8A" }}
                                    className="text-white"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {loading ? "Creating..." : "Save Agent"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
