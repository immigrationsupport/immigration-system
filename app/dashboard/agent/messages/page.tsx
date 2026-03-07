"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageSquare, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AgentMessagesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>Messages</h1>
                <p className="text-sm text-gray-500">Communicate with assigned clients.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
                <Card className="col-span-1 border-r h-full flex flex-col">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg">Clients</CardTitle>
                        <Input placeholder="Search client..." className="mt-2" />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0">
                        <div className="divide-y divide-gray-100">
                            {[
                                { name: "Sarah Johnson", message: "Thanks for the update on...", time: "10:30 AM", active: true },
                                { name: "Michael Wong", message: "When should I expect...", time: "Yesterday", active: false },
                                { name: "Amara Okafor", message: "I uploaded the required Doc...", time: "Oct 24", active: false }
                            ].map((chat, i) => (
                                <div key={i} className={`p-4 hover:bg-gray-50 cursor-pointer ${chat.active ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-medium text-sm text-gray-900">{chat.name}</h3>
                                        <span className="text-xs text-gray-500">{chat.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{chat.message}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-3 pb-3 border-b py-4">
                        <div className="bg-gray-200 p-2 rounded-full">
                            <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Sarah Johnson</CardTitle>
                            <p className="text-xs text-green-600">Online</p>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        <div className="flex flex-col space-y-4">
                            {/* Received */}
                            <div className="flex justify-start">
                                <div className="bg-white border rounded-2xl rounded-tl-sm p-3 max-w-[70%] shadow-sm">
                                    <p className="text-sm text-gray-800">Hello, I saw that my application status changed to 'Pending Review'. Do I need to provide any additional documents?</p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">10:15 AM</span>
                                </div>
                            </div>

                            {/* Sent */}
                            <div className="flex justify-end">
                                <div className="rounded-2xl rounded-tr-sm p-3 max-w-[70%] shadow-sm text-white" style={{ backgroundColor: "#1E3A8A" }}>
                                    <p className="text-sm">Hi Sarah, your documents cover everything for now. The review team will evaluate them today. I'll let you know if we need anything else.</p>
                                    <span className="text-[10px] text-blue-200 mt-1 block text-right">10:20 AM</span>
                                </div>
                            </div>

                            {/* Received */}
                            <div className="flex justify-start">
                                <div className="bg-white border rounded-2xl rounded-tl-sm p-3 max-w-[70%] shadow-sm">
                                    <p className="text-sm text-gray-800">Thanks for the update on the process! I'll wait to hear back.</p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">10:30 AM</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="py-3 border-t bg-white">
                        <div className="flex w-full items-center space-x-2">
                            <Input placeholder="Type your message..." className="flex-1" />
                            <Button variant="outline" style={{ backgroundColor: "#1E3A8A" }}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
