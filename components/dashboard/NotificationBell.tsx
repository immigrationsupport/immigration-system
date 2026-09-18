"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import {
    getMyNotificationsAction,
    markNotificationReadAction,
    markAllNotificationsReadAction,
} from "@/lib/notifications-actions";

interface NotificationItem {
    id: string;
    type: string;
    message: string;
    clientId: string | null;
    isRead: boolean;
    createdAt: string | Date;
}

function timeAgo(date: string | Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "à l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days} j`;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const load = async () => {
        const result = await getMyNotificationsAction();
        if (result?.success) {
            setNotifications(result.notifications as any);
            setUnreadCount(result.unreadCount);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleOpen = () => {
        setOpen((o) => !o);
        if (!open) load();
    };

    const handleItemClick = async (id: string, isRead: boolean) => {
        if (!isRead) {
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
            setUnreadCount((c) => Math.max(0, c - 1));
            await markNotificationReadAction(id);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        await markAllNotificationsReadAction();
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-black text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                            >
                                <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-gray-400 font-medium">
                                Aucune notification pour le moment.
                            </p>
                        ) : (
                            notifications.map((n) => {
                                const content = (
                                    <div
                                        className={`px-4 py-3 flex items-start gap-2.5 transition-colors ${
                                            n.isRead ? "bg-white" : "bg-blue-50/50"
                                        } hover:bg-gray-50`}
                                    >
                                        {!n.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                        )}
                                        <div className={`min-w-0 ${n.isRead ? "pl-4" : ""}`}>
                                            <p className="text-sm font-semibold text-gray-800">{n.message}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                                        </div>
                                    </div>
                                );

                                return n.clientId ? (
                                    <Link
                                        key={n.id}
                                        href={`/dashboard/agent/clients/${n.clientId}/questionnaire`}
                                        onClick={() => {
                                            handleItemClick(n.id, n.isRead);
                                            setOpen(false);
                                        }}
                                        className="block"
                                    >
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={n.id} onClick={() => handleItemClick(n.id, n.isRead)} className="cursor-pointer">
                                        {content}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}