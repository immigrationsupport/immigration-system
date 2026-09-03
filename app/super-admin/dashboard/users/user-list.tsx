"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Search,
    Ban,
    CheckCircle2,
    Trash2,
    Building2,
} from "lucide-react";
import { toast } from "sonner";
import {
    toggleSuspendUserAction,
    changeUserRoleAction,
    deleteUserAction,
} from "./actions";
import { TablePagination } from "@/components/ui/table-pagination";

const PAGE_SIZE = 10;

interface UserRow {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "AGENT" | "CLIENT";
    status: "PENDING" | "ACTIVE" | "REJECTED";
    isSuspended: boolean;
    createdAt: string;
    agency: { id: string; name: string } | null;
}

const ROLE_STYLES: Record<string, string> = {
    SUPER_ADMIN:
        "bg-purple-100 text-purple-700 border border-purple-200",
    ADMIN: "bg-blue-100 text-blue-700 border border-blue-200",
    AGENT: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    CLIENT: "bg-gray-100 text-gray-700 border border-gray-200",
};

function TruncatedText({
    text,
    maxLength,
    className = "",
}: {
    text: string;
    maxLength: number;
    className?: string;
}) {
    if (!text) return null;

    const isLong = text.length > maxLength;
    const displayText = isLong
        ? `${text.slice(0, maxLength)}...`
        : text;

    if (!isLong) {
        return <span className={className}>{displayText}</span>;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className={`cursor-pointer hover:underline inline-block ${className}`}
                >
                    {displayText}
                </span>
            </TooltipTrigger>

            <TooltipContent>
                <p className="font-semibold text-xs">{text}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export default function UserList({
    initialUsers,
}: {
    initialUsers: UserRow[];
}) {
    const [users, setUsers] = useState(initialUsers);
    const [query, setQuery] = useState("");
    const [role, setRole] = useState("ALL");
    const [page, setPage] = useState(1);
    const [isPending, startTransition] = useTransition();

    const filtered = useMemo(() => {
        return users.filter((u) => {
            if (role !== "ALL" && u.role !== role) {
                return false;
            }

            if (!query.trim()) {
                return true;
            }

            const q = query.toLowerCase();

            return (
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.agency?.name || "").toLowerCase().includes(q)
            );
        });
    }, [users, query, role]);

    useEffect(() => {
        setPage(1);
    }, [query, role]);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / PAGE_SIZE)
    );

    const safePage = Math.min(page, totalPages);

    const paginatedUsers = filtered.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    function handleToggleSuspend(
        userId: string,
        currentlySuspended: boolean
    ) {
        startTransition(async () => {
            const result = await toggleSuspendUserAction(
                userId,
                currentlySuspended
            );

            if (result?.error) {
                toast.error(result.error);
            } else {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId
                            ? {
                                  ...u,
                                  isSuspended: !currentlySuspended,
                              }
                            : u
                    )
                );

                toast.success(
                    currentlySuspended
                        ? "User unsuspended"
                        : "User suspended"
                );
            }
        });
    }

    function handleChangeRole(
        userId: string,
        newRole: string
    ) {
        startTransition(async () => {
            const result = await changeUserRoleAction(
                userId,
                newRole
            );

            if (result?.error) {
                toast.error(result.error);
            } else {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId
                            ? {
                                  ...u,
                                  role: newRole as UserRow["role"],
                              }
                            : u
                    )
                );

                toast.success("Role updated");
            }
        });
    }

    function handleDelete(userId: string) {
        startTransition(async () => {
            const result = await deleteUserAction(userId);

            if (result?.error) {
                toast.error(result.error);
            } else {
                setUsers((prev) =>
                    prev.filter((u) => u.id !== userId)
                );

                toast.success("User deleted");

                setPage((currentPage) => {
                    const remainingItems = filtered.length - 1;
                    const remainingPages = Math.max(
                        1,
                        Math.ceil(remainingItems / PAGE_SIZE)
                    );

                    return Math.min(
                        currentPage,
                        remainingPages
                    );
                });
            }
        });
    }

    return (
        <TooltipProvider>
            <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-gray-200 bg-white">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                        <Input
                            value={query}
                            onChange={(e) =>
                                setQuery(e.target.value)
                            }
                            placeholder="Search by name, email or agency..."
                            className="pl-9"
                        />
                    </div>

                    <select
                        value={role}
                        onChange={(e) =>
                            setRole(e.target.value)
                        }
                        className="text-sm font-bold border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] bg-white"
                    >
                        <option value="ALL">
                            All roles
                        </option>
                        <option value="SUPER_ADMIN">
                            Super Admin
                        </option>
                        <option value="ADMIN">
                            Admin
                        </option>
                        <option value="AGENT">
                            Agent
                        </option>
                        <option value="CLIENT">
                            Client
                        </option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-100/80">
                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                    User
                                </th>

                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                    Agency
                                </th>

                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                    Role
                                </th>

                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {paginatedUsers.map((u) => (
                                <tr
                                    key={u.id}
                                    className="hover:bg-blue-50/40 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <TruncatedText
                                                text={u.name}
                                                maxLength={10}
                                                className="font-bold text-gray-900"
                                            />
                                        </div>

                                        <div>
                                            <TruncatedText
                                                text={u.email}
                                                maxLength={18}
                                                className="text-xs text-gray-400"
                                            />
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-gray-700 font-semibold">
                                        {u.agency ? (
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />

                                                <TruncatedText
                                                    text={
                                                        u.agency.name
                                                    }
                                                    maxLength={15}
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-gray-300">
                                                —
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        {u.role ===
                                        "SUPER_ADMIN" ? (
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${ROLE_STYLES[u.role]}`}
                                            >
                                                {u.role.replace(
                                                    "_",
                                                    " "
                                                )}
                                            </span>
                                        ) : (
                                            <select
                                                disabled={
                                                    isPending
                                                }
                                                value={u.role}
                                                onChange={(e) =>
                                                    handleChangeRole(
                                                        u.id,
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] bg-white"
                                            >
                                                <option value="ADMIN">
                                                    Admin
                                                </option>

                                                <option value="AGENT">
                                                    Agent
                                                </option>

                                                <option value="CLIENT">
                                                    Client
                                                </option>
                                            </select>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                                                u.isSuspended
                                                    ? "bg-red-100 text-red-700 border border-red-200"
                                                    : "bg-green-100 text-green-700 border border-green-200"
                                            }`}
                                        >
                                            {u.isSuspended
                                                ? "Suspended"
                                                : u.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        {u.role !==
                                            "SUPER_ADMIN" && (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        isPending
                                                    }
                                                    onClick={() =>
                                                        handleToggleSuspend(
                                                            u.id,
                                                            u.isSuspended
                                                        )
                                                    }
                                                    className="gap-1.5 font-bold"
                                                >
                                                    {u.isSuspended ? (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Reactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="h-4 w-4" />
                                                            Suspend
                                                        </>
                                                    )}
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger
                                                        asChild
                                                    >
                                                        <button
                                                            className="p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent className="border-none shadow-2xl rounded-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-xl font-black text-gray-900">
                                                                Delete this user?
                                                            </AlertDialogTitle>

                                                            <AlertDialogDescription className="text-gray-500 font-medium pt-2">
                                                                This permanently
                                                                deletes{" "}
                                                                {
                                                                    u.name
                                                                }{" "}
                                                                (
                                                                {
                                                                    u.email
                                                                }
                                                                ). This
                                                                may fail if
                                                                they have
                                                                linked
                                                                applications
                                                                or records.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>

                                                        <AlertDialogFooter className="pt-4">
                                                            <AlertDialogCancel className="font-bold border-none bg-gray-100 hover:bg-gray-200 rounded-xl">
                                                                Cancel
                                                            </AlertDialogCancel>

                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        u.id
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl px-6"
                                                            >
                                                                Delete User
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-16 text-center text-gray-400 font-semibold"
                                    >
                                        No users match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filtered.length > PAGE_SIZE && (
                    <div className="px-6 pb-6">
                        <TablePagination
                            page={safePage}
                            totalItems={filtered.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}