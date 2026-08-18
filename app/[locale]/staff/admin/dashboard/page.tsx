"use client";

import React from "react";
import { UserCog, Users, FileText } from "lucide-react";

export default function AdminDashboardOverview() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <UserCog size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Agents</p>
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Clients</p>
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Procedures</p>
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">• Create or Manage Agent accounts.</p>
                    <p className="text-sm text-gray-600">• View and suspend Client profiles.</p>
                    <p className="text-sm text-gray-600">• Assign or Reassign clients to agents.</p>
                    <p className="text-sm text-gray-600">• Monitor all immigration procedure statuses.</p>
                </div>
            </div>
        </div>
    );
}
