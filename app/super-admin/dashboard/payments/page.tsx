import React from "react";
import { getAllPayments } from "./actions";
import PaymentsTable from "./payments-table";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminPaymentsPage() {
    const payments = await getAllPayments();

    const totalRevenue = payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + p.amountFcfa, 0);
    const pendingCount = payments.filter((p) => p.status === "PENDING").length;
    const failedCount = payments.filter((p) => p.status === "FAILED").length;
    const successCount = payments.filter((p) => p.status === "SUCCESS").length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>Payments</h1>
                <p className="text-gray-500 text-sm mt-1">Every subscription payment made across all agencies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center text-[#1E3A8A]">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
                            <p className="text-lg font-black text-gray-900">{totalRevenue.toLocaleString()} FCFA</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Successful</p>
                            <p className="text-lg font-black text-gray-900">{successCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Pending</p>
                            <p className="text-lg font-black text-gray-900">{pendingCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
                            <XCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Failed</p>
                            <p className="text-lg font-black text-gray-900">{failedCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <PaymentsTable payments={payments as any} />
        </div>
    );
}