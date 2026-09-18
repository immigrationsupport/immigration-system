import React from "react";
import { getAllUsers } from "./actions";
import UserList from "./user-list";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function SuperAdminUsersPage() {
    const t = await getTranslations("superAdminDashboard.usersPage");
    const users = await getAllUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>{t("title")}</h1>
                <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
            </div>

            <UserList initialUsers={users as any} />
        </div>
    );
}