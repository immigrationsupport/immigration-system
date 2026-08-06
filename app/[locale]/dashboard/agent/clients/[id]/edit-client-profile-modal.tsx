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
import { Edit2, Loader2, User } from "lucide-react";
import { updateClientProfileAction } from "./actions";
import { toast } from "sonner";

interface EditClientProfileModalProps {
    clientId: string;
    client: {
        name: string;
        email: string;
        phoneNumber: string | null;
        nationality: string | null;
        dateOfBirth: Date | null;
        maritalStatus: string | null;
        numberOfChildren: number;
        address: string | null;
    };
}

export default function EditClientProfileModal({ clientId, client }: EditClientProfileModalProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: client.name,
        email: client.email,
        phoneNumber: client.phoneNumber || "",
        nationality: client.nationality || "",
        dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split("T")[0] : "",
        maritalStatus: client.maritalStatus || "SINGLE",
        numberOfChildren: client.numberOfChildren || 0,
        address: client.address || ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateClientProfileAction(clientId, formData);

        setLoading(false);
        if (result.success) {
            toast.success("Client profile updated successfully");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to update client profile");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="h-9 px-3 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-1.5">
                    <Edit2 size={14} /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] border-none shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900">Edit Client Profile</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        Update personal information for <span className="text-blue-600 font-bold">{client.name}</span>. The client's profile is read-only on their end, so any changes must be made here.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <Input
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nationality</label>
                            <Input
                                value={formData.nationality}
                                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                            <Input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marital Status</label>
                            <select
                                value={formData.maritalStatus}
                                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                                className="w-full h-12 border border-gray-100 rounded-xl bg-gray-50/50 px-4 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            >
                                <option value="SINGLE">Single</option>
                                <option value="MARRIED">Married</option>
                                <option value="DIVORCED">Divorced</option>
                                <option value="WIDOWED">Widowed</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Number of Children</label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.numberOfChildren}
                                onChange={(e) => setFormData({ ...formData, numberOfChildren: parseInt(e.target.value) || 0 })}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Address</label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            />
                        </div>
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
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}