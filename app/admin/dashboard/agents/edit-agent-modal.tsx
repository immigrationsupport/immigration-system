"use client";

import { useState } from "react";
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
import { Edit2, Loader2, UserCog, Eye, EyeOff } from "lucide-react";
import { updateAgentAction } from "./actions";
import { toast } from "sonner";

export default function EditAgentModal({ agentId, currentName, currentEmail }: { agentId: string, currentName: string, currentEmail: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(currentName);
    const [email, setEmail] = useState(currentEmail);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateAgentAction(agentId, name, email, password || undefined);

        setLoading(false);
        if (result.success) {
            toast.success("Agent updated successfully");
            setPassword("");
            setOpen(false);
        } else {
            toast.error(result.error || "Failed to update agent");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button 
                    className="p-2 text-gray-400 hover:text-blue-800 hover:bg-blue-50 transition-all rounded-lg" 
                    title="Edit Agent"
                >
                    <Edit2 size={16} />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-none shadow-2xl rounded-2xl">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <UserCog className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900">Edit Agent Account</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        Modify descriptions or reset password for <span className="text-blue-600 font-bold inline-block max-w-[200px] truncate align-bottom" title={currentName}>{currentName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4 w-full overflow-hidden">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <Input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            placeholder="Max 50 characters"
                            maxLength={50}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <Input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password (Optional)</label>
                        <div className="relative">
                            <Input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold pr-10"
                                placeholder="Leave blank to keep current"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
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
