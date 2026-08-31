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
import { useTranslations } from "next-intl";

export default function SendMessageModal({ clientId, clientName, defaultSubject = "", buttonText }: { clientId: string, clientName: string, defaultSubject?: string, buttonText?: React.ReactNode }) {
    const t = useTranslations("agentSendMessage");
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
            toast.success(t("toastSuccess"));
            setOpen(false);
            setSubject("");
            setContent("");
        } else {
            toast.error(result.error || t("toastError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="h-10 px-3 hover:bg-red-50 text-red-500 rounded-xl transition-all">
                    {buttonText ?? t("defaultButtonText")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-2xl">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <MailCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900">{t("dialogTitle")}</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        {t.rich("dialogDescription", { clientName, b: (chunks) => <span className="text-blue-600 font-bold">{chunks}</span> })}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("messageSubject")}</label>
                        <Input 
                            placeholder={t("subjectPlaceholder")} 
                            className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("messageContent")}</label>
                        <Textarea 
                            placeholder={t("contentPlaceholder")} 
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
                            {t("cancel")}
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#1E3A8A] hover:bg-[#152a6a] text-white font-black rounded-xl px-8 shadow-lg shadow-blue-200"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("transmitMessage")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}