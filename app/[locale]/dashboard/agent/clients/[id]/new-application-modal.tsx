"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Globe } from "lucide-react";
import { createApplicationForClientAction } from "./actions";
import { toast } from "sonner";

export default function NewApplicationModal({ clientId, clientName }: { clientId: string; clientName: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [country, setCountry] = useState("Canada");
    const [type, setType] = useState("PR");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createApplicationForClientAction(clientId, { country, type, description });

        setLoading(false);
        if (result.success) {
            toast.success("Application created successfully");
            setOpen(false);
            setCountry("Canada");
            setType("PR");
            setDescription("");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to create application");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#1E3A8A] hover:bg-[#152a6a] text-white font-black rounded-2xl px-6 h-12 uppercase tracking-widest text-xs shadow-lg shadow-blue-200 flex items-center gap-2">
                    <Plus size={16} /> New Application
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-2xl">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900">Start a New Application</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        Creating a new immigration application for <span className="text-blue-600 font-bold">{clientName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination Country</label>
                        <Input
                            placeholder="e.g., Canada"
                            className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Application Type</label>
                        <select
                            className="w-full h-12 border border-gray-100 rounded-xl bg-gray-50/50 px-4 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="PR">Permanent Residency</option>
                            <option value="WORK">Work Visa</option>
                            <option value="STUDY">Study Visa</option>
                            <option value="SCHOLARSHIP">Scholarship</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                        <Input
                            placeholder="e.g. Master's in CS"
                            className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#1E3A8A] hover:bg-[#152a6a] text-white font-black rounded-xl px-8 shadow-lg shadow-blue-200"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Application"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}