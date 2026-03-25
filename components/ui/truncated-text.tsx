"use client";

import React from "react";

interface TruncatedTextProps {
    text: string;
    maxLength?: number;
    className?: string;
}

export function TruncatedText({ text, maxLength = 20, className = "" }: TruncatedTextProps) {
    if (!text) return null;
    
    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? `${text.substring(0, maxLength)}...` : text;

    return (
        <span 
            className={`${isTruncated ? "decoration-gray-300" : ""} ${className}`}
            title={isTruncated ? text : undefined}
        >
            {displayText}
        </span>
    );
}
