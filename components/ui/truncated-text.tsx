"use client";

import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedTextProps {
    text: string;
    maxLength?: number;
    className?: string;
}

export function TruncatedText({ text, maxLength = 20, className = "" }: TruncatedTextProps) {
    if (!text) return null;
    
    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? `${text.substring(0, maxLength)}...` : text;

    if (!isTruncated) {
        return <span className={className}>{text}</span>;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={`cursor-help underline decoration-dotted decoration-gray-300 ${className}`}>
                        {displayText}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs break-words">{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
