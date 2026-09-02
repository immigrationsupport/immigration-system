"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, AlertCircle, ArrowUpCircle, ArrowDownCircle, X, ShieldCheck, Smartphone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { upgradeSubscriptionAction, cancelPendingDowngradeAction } from "./actions";
import { useTranslations } from "next-intl";

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceFcfa: number;
  maxAgents: number | null;
  maxClients: number | null;
}

type PaymentMethod = "MTN_MOBILE_MONEY" | "ORANGE_MONEY" | "CARD";

export default function UpgradePlanSection({ plans, currentPlanId, pendingPlan }: { plans: Plan[]; currentPlanId: string; pendingPlan: Plan | null }) {
  const t = useTranslations("adminBilling.upgrade");
  const tBilling = useTranslations("adminBilling");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("MTN_MOBILE_MONEY");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isCancelPending, startCancelTransition] = useTransition();
  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const isPaidUpgrade = !!selectedPlan && !!currentPlan && selectedPlan.priceFcfa >= currentPlan.priceFcfa && selectedPlan.priceFcfa > 0;

  function closeDialog() {
    if (!isPending) {
      setSelectedPlan(null);
      setError("");
      setPhone("");
    }
  }

  function handleConfirm() {
    if (!selectedPlan) return;
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("planId", selectedPlan.id);
      formData.set("paymentMethod", method);
      formData.set("phoneNumber", phone);
      const result = await upgradeSubscriptionAction(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      if (result?.txRef) {
        const locale = window.location.pathname.split("/")[1] || "en";
        window.location.href = `/${locale}/admin/dashboard/billing/verify?ref=${encodeURIComponent(result.txRef)}`;
        return;
      }

      toast.success(result?.downgrade ? t("toastDowngradeScheduled") : t("toastUpdated"));
      closeDialog();
      window.location.reload();
    });
  }

  function handleCancelDowngrade() {
    startCancelTransition(async () => {
      const result = await cancelPendingDowngradeAction();
      if (result?.error) toast.error(result.error);
      else { toast.success(t("toastDowngradeCancelled")); window.location.reload(); }
    });
  }

  return (
    <div className="space-y-4">
      {pendingPlan && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3 text-amber-800 text-sm"><ArrowDownCircle className="h-5 w-5 shrink-0" /><span>{t.rich("downgradeScheduled", { strong: (chunks) => <strong>{chunks}</strong>, planName: pendingPlan.name })}</span></div>
          <Button variant="outline" size="sm" disabled={isCancelPending} onClick={handleCancelDowngrade} className="gap-1.5 font-bold border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0">
            {isCancelPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}{t("cancel")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isUpgrade = currentPlan ? plan.priceFcfa > currentPlan.priceFcfa : false;
          return (
            <Card key={plan.id} className={`border-none shadow-lg rounded-2xl overflow-hidden ${isCurrent ? "ring-2 ring-[#1E3A8A]" : ""}`}>
              <CardContent className="p-5 space-y-3">
                <p className="font-black text-gray-900">{plan.name}</p>
                <p className="text-lg font-black text-[#1E3A8A]">{plan.priceFcfa.toLocaleString()} FCFA <span className="text-xs text-gray-400 font-bold">{tBilling("perYear")}</span></p>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-500"><span className="px-2 py-1 bg-gray-100 rounded-lg">{t("agentsShort")}: {plan.maxAgents ?? "∞"}</span><span className="px-2 py-1 bg-gray-100 rounded-lg">{t("clientsShort")}: {plan.maxClients ?? "∞"}</span></div>
                {isCurrent ? (
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#1E3A8A] uppercase pt-2"><CheckCircle2 className="h-4 w-4" />{t("currentPlan")}</div>
                ) : (
                  <Button onClick={() => { setError(""); setPhone(""); setMethod("MTN_MOBILE_MONEY"); setSelectedPlan(plan); }} className="w-full font-bold rounded-xl gap-1.5 bg-[#1E3A8A] text-white hover:bg-blue-900">
                    {isUpgrade ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}{isUpgrade ? t("upgradeButton") : t("switchButton")}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-6 text-white">
            <DialogHeader><DialogTitle className="text-2xl font-black text-white">Secure checkout</DialogTitle><DialogDescription className="text-blue-100">{selectedPlan ? `Upgrade to ${selectedPlan.name} and continue your subscription.` : ""}</DialogDescription></DialogHeader>
          </div>

          {selectedPlan && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 border p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Selected plan</p><p className="font-black text-gray-900 text-lg">{selectedPlan.name}</p></div><p className="font-black text-xl text-[#1E3A8A]">{selectedPlan.priceFcfa.toLocaleString()} FCFA</p></div>

              {isPaidUpgrade && (
                <>
                  <div><p className="font-black text-gray-900 mb-3">Choose payment method</p><div className="grid grid-cols-3 gap-3">
                    <MethodButton active={method === "MTN_MOBILE_MONEY"} onClick={() => setMethod("MTN_MOBILE_MONEY")} className="border-yellow-300 bg-yellow-50"><div className="h-9 w-9 rounded-xl bg-[#FFCC00] text-black font-black flex items-center justify-center">MTN</div><span>MTN MoMo</span></MethodButton>
                    <MethodButton active={method === "ORANGE_MONEY"} onClick={() => setMethod("ORANGE_MONEY")} className="border-orange-300 bg-orange-50"><div className="h-9 w-9 rounded-xl bg-[#FF7900] text-white font-black flex items-center justify-center">O</div><span>Orange</span></MethodButton>
                    <MethodButton active={method === "CARD"} onClick={() => setMethod("CARD")} className="border-blue-200 bg-blue-50"><div className="h-9 w-9 rounded-xl bg-white border flex items-center justify-center"><CreditCard className="h-5 w-5 text-blue-700" /></div><span>Card</span></MethodButton>
                  </div></div>

                  {method !== "CARD" && (
                    <div><label className="text-sm font-black text-gray-800">{method === "MTN_MOBILE_MONEY" ? "MTN Mobile Money number" : "Orange Money number"}</label><div className="mt-2 flex rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-blue-500"><span className="px-4 flex items-center bg-gray-50 text-gray-500 font-bold border-r">+237</span><input value={phone.replace(/^237/, "")} onChange={(e) => setPhone(`237${e.target.value.replace(/\D/g, "").slice(0, 9)}`)} placeholder="6 XX XX XX XX" className="flex-1 px-4 py-3 outline-none font-semibold" inputMode="numeric" /></div><p className="mt-2 text-xs text-gray-400">A payment confirmation request will appear on this phone.</p></div>
                  )}

                  {method === "CARD" && <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex gap-3"><CreditCard className="h-5 w-5 text-blue-700 shrink-0" /><p className="text-sm text-blue-900">You will be securely redirected to CamPay to complete your Visa or Mastercard payment.</p></div>}
                </>
              )}

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm"><AlertCircle className="shrink-0 w-4 h-4 mt-0.5" /><span>{error}</span></div>}

              {isPaidUpgrade && <div className="flex items-center gap-2 text-xs text-gray-500"><ShieldCheck className="h-4 w-4 text-green-600" /> Payment is processed securely by CamPay.</div>}

              <Button onClick={handleConfirm} disabled={isPending} className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-black h-12 rounded-xl text-base">
                {isPending ? <><Loader2 className="animate-spin w-5 h-5 mr-2" />Starting payment...</> : isPaidUpgrade ? <>Pay {selectedPlan.priceFcfa.toLocaleString()} FCFA <Smartphone className="ml-2 h-4 w-4" /></> : t("continue")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MethodButton({ active, onClick, className, children }: { active: boolean; onClick: () => void; className?: string; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-2xl border-2 p-3 min-h-[92px] flex flex-col items-center justify-center gap-2 text-xs font-black transition-all ${className || ""} ${active ? "ring-2 ring-[#1E3A8A] ring-offset-2" : "opacity-75 hover:opacity-100"}`}>{children}</button>;
}
