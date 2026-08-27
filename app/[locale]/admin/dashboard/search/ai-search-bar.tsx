"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Sparkles } from "lucide-react";
import { aiSearchAction } from "./actions";

export default function AiSearchBar() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setAnswer(null);

        const result = await aiSearchAction(query);
        setLoading(false);

        if (result.error) setError(result.error);
        else setAnswer(result.answer || "No answer returned.");
    }

    return (
        <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything — e.g. 'find John Doe' or 'clients from Cameroon still pending'"
                    className="pl-11 pr-24 h-12 rounded-2xl"
                    disabled={loading}
                />
                <Button
                    type="submit"
                    disabled={loading}
                    className="absolute right-1.5 top-1.5 h-9 rounded-xl bg-[#1E3A8A]"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </form>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {answer && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-gray-800 whitespace-pre-wrap">
                    {answer}
                </div>
            )}
        </div>
    );
}