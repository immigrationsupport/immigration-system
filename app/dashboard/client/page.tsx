import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export default function ClientDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">12</div>
                        <p className="text-xs text-gray-500">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">4</div>
                        <p className="text-xs text-gray-500">Awaiting review</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">7</div>
                        <p className="text-xs text-gray-500">Successfully processed</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">1</div>
                        <p className="text-xs text-gray-500">Action required</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">Visa Application - Canada</td>
                                    <td className="px-4 py-3 text-gray-500">Work Visa</td>
                                    <td className="px-4 py-3 text-gray-500">Oct 24, 2023</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Pending</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-[var(--color-primary)] hover:underline font-medium">View</button>
                                    </td>
                                </tr>
                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">Residency Renewal</td>
                                    <td className="px-4 py-3 text-gray-500">Permanent Residency</td>
                                    <td className="px-4 py-3 text-gray-500">Sep 12, 2023</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Approved</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-[var(--color-primary)] hover:underline font-medium">View</button>
                                    </td>
                                </tr>
                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">Family Sponsorship</td>
                                    <td className="px-4 py-3 text-gray-500">Family Reunification</td>
                                    <td className="px-4 py-3 text-gray-500">Aug 05, 2023</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">In Review</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-[var(--color-primary)] hover:underline font-medium">View</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
