"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    CheckCircle2,
    Loader2,
    AlertCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    X,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
    upgradeSubscriptionAction,
    cancelPendingDowngradeAction,
} from "./actions";
import { useTranslations } from "next-intl";

interface Plan {
    id: string;
    name: string;
    slug: string;
    priceFcfa: number;
    maxAgents: number | null;
    maxClients: number | null;
}

export default function UpgradePlanSection({
    plans,
    currentPlanId,
    pendingPlan,
}: {
    plans: Plan[];
    currentPlanId: string;
    pendingPlan: Plan | null;
}) {
    const t = useTranslations("adminBilling.upgrade");
    const tBilling = useTranslations("adminBilling");

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isCancelPending, startCancelTransition] = useTransition();

    const currentPlan = plans.find((p) => p.id === currentPlanId);

    function handleConfirm() {
        if (!selectedPlan) return;

        setError("");

        startTransition(async () => {
            const formData = new FormData();
            formData.set("planId", selectedPlan.id);

            const result = await upgradeSubscriptionAction(formData);

            if (result?.error) {
                setError(result.error);
                return;
            }

            // Paid plan → redirect to CamPay hosted checkout
            if (result?.paymentUrl) {
                window.location.href = result.paymentUrl;
                return;
            }

            // Downgrade / free plan
            toast.success(
                result?.downgrade
                    ? t("toastDowngradeScheduled")
                    : t("toastUpdated")
            );

            setSelectedPlan(null);
            window.location.reload();
        });
    }

    function handleCancelDowngrade() {
        startCancelTransition(async () => {
            const result = await cancelPendingDowngradeAction();

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(t("toastDowngradeCancelled"));
                window.location.reload();
            }
        });
    }

    return (
        <div className="space-y-4">
            {pendingPlan && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-3 text-amber-800 text-sm">
                        <ArrowDownCircle className="h-5 w-5 shrink-0" />

                        <span>
                            {t.rich("downgradeScheduled", {
                                strong: (chunks) => (
                                    <strong>{chunks}</strong>
                                ),
                                planName: pendingPlan.name,
                            })}
                        </span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isCancelPending}
                        onClick={handleCancelDowngrade}
                        className="gap-1.5 font-bold border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0"
                    >
                        {isCancelPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <X className="h-4 w-4" />
                        )}

                        {t("cancel")}
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => {
                    const isCurrent = plan.id === currentPlanId;

                    const isUpgrade = currentPlan
                        ? plan.priceFcfa > currentPlan.priceFcfa
                        : false;

                    return (
                        <Card
                            key={plan.id}
                            className={`border-none shadow-lg rounded-2xl overflow-hidden ${
                                isCurrent
                                    ? "ring-2 ring-[#1E3A8A]"
                                    : ""
                            }`}
                        >
                            <CardContent className="p-5 space-y-3">
                                <p className="font-black text-gray-900">
                                    {plan.name}
                                </p>

                                <p className="text-lg font-black text-[#1E3A8A]">
                                    {plan.priceFcfa.toLocaleString()} FCFA
                                    <span className="text-xs text-gray-400 font-bold">
                                        {tBilling("perYear")}
                                    </span>
                                </p>

                                <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-500">
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                        {t("agentsShort")}:{" "}
                                        {plan.maxAgents ?? "∞"}
                                    </span>

                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                        {t("clientsShort")}:{" "}
                                        {plan.maxClients ?? "∞"}
                                    </span>
                                </div>

                                {isCurrent ? (
                                    <div className="flex items-center gap-1.5 text-xs font-black text-[#1E3A8A] uppercase pt-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {t("currentPlan")}
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            setError("");
                                            setSelectedPlan(plan);
                                        }}
                                        className="w-full font-bold rounded-xl gap-1.5 bg-[#1E3A8A] text-white hover:bg-blue-900"
                                    >
                                        {isUpgrade ? (
                                            <ArrowUpCircle className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownCircle className="h-4 w-4" />
                                        )}

                                        {isUpgrade
                                            ? t("upgradeButton")
                                            : t("switchButton")}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog
                open={!!selectedPlan}
                onOpenChange={(open) =>
                    !open && setSelectedPlan(null)
                }
            >
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#1E3A8A]">
                            {selectedPlan
                                ? t("switchTo", {
                                      planName: selectedPlan.name,
                                  })
                                : ""}
                        </DialogTitle>

                        <DialogDescription>
                            {currentPlan &&
                            selectedPlan &&
                            (selectedPlan.priceFcfa <
                                currentPlan.priceFcfa ||
                                selectedPlan.priceFcfa === 0)
                                ? t("downgradeNote")
                                : t("checkoutNote")}
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
                            <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {selectedPlan && (
                        <div className="space-y-4">
                            {currentPlan &&
                                selectedPlan.priceFcfa >=
                                    currentPlan.priceFcfa &&
                                selectedPlan.priceFcfa > 0 && (
                                    <div className="p-3 bg-blue-50 rounded-xl text-sm font-bold text-[#1E3A8A] flex justify-between">
                                        <span>{t("amountDue")}</span>

                                        <span>
                                            {selectedPlan.priceFcfa.toLocaleString()}{" "}
                                            FCFA
                                        </span>
                                    </div>
                                )}

                            {selectedPlan.priceFcfa > 0 &&
                                (currentPlan
                                    ? selectedPlan.priceFcfa >=
                                      currentPlan.priceFcfa
                                    : true) && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                        <ShieldCheck className="h-4 w-4 shrink-0" />

                                        <span>{t("securityNote")}</span>
                                    </div>
                                )}

                            <Button
                                onClick={handleConfirm}
                                disabled={isPending}
                                className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold h-11 rounded-xl"
                            >
                                {isPending ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    t("continue")
                                )}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

