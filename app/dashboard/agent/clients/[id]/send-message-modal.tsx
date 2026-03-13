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
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MailCheck } from "lucide-react";
import { sendOfficialMessageAction } from "./actions";
import { toast } from "sonner";

export default function SendMessageModal({ clientId, clientName, defaultSubject = "", buttonText = "Send Official Message" }: { clientId: string, clientName: string, defaultSubject?: string, buttonText?: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState(defaultSubject);
    const [content, setContent] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await sendOfficialMessageAction(clientId, subject, content);

        setLoading(false);
        if (result.success) {
            toast.success("Message sent successfully");
            setOpen(false);
            setSubject("");
            setContent("");
        } else {
            toast.error(result.error || "Failed to send message");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#1E3A8A] hover:bg-[#152a6a] text-white font-black rounded-xl gap-2 shadow-lg shadow-blue-100 px-6">
                    <Send className="h-4 w-4" /> {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-2xl">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <MailCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900">Official Communication</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        Sending a message to <span className="text-blue-600 font-bold">{clientName}</span>. This will be stored as an official record.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Subject</label>
                        <Input 
                            placeholder="e.g., Update on PR Application" 
                            className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Content</label>
                        <Textarea 
                            placeholder="Type your official notification here..." 
                            className="min-h-[150px] border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-medium text-sm leading-relaxed"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
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
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transmit Message"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
