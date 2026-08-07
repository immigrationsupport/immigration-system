import React from "react";
import { getAllUsers } from "./actions";
import UserList from "./user-list";

export const dynamic = "force-dynamic";

export default async function SuperAdminUsersPage() {
    const users = await getAllUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>Users</h1>
                <p className="text-gray-500 text-sm mt-1">Every user on the platform, across every agency.</p>
            </div>

            <UserList initialUsers={users as any} />
        </div>
    );
}