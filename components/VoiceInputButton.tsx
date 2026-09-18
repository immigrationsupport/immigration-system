"use client";

import { useRef, useState } from "react";
import { Mic } from "lucide-react";
import { toast } from "sonner";

/**
 * Simple animated "sound bars" shown while actively listening — each bar
 * pulses at a slightly different speed via inline animation-delay so they
 * don't all bounce in perfect unison.
 */
function ListeningBars() {
    return (
        <span className="flex items-center gap-[2px] h-4">
            {[0, 150, 300, 450].map((delay, i) => (
                <span
                    key={i}
                    className="w-[3px] bg-red-600 rounded-full animate-pulse"
                    style={{
                        height: i % 2 === 0 ? "60%" : "100%",
                        animationDelay: `${delay}ms`,
                        animationDuration: "700ms",
                    }}
                />
            ))}
        </span>
    );
}

/**
 * A microphone button that dictates speech into text via the browser's
 * built-in SpeechRecognition API. Works in Chrome/Edge; other browsers
 * (Safari, Firefox) don't support this API yet, so we show a clear message
 * instead of failing silently.
 */
export default function VoiceInputButton({
    onResult,
    lang = "fr-FR",
    className = "",
}: {
    onResult: (transcript: string) => void;
    lang?: string;
    className?: string;
}) {
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const handleClick = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("La dictée vocale n'est pas prise en charge par ce navigateur. Essayez avec Google Chrome ou Microsoft Edge.");
            return;
        }

        if (listening) {
            recognitionRef.current?.stop();
            setListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript;
            if (transcript) onResult(transcript);
        };
        recognition.onerror = () => {
            setListening(false);
            toast.error("La dictée vocale a été interrompue. Veuillez réessayer.");
        };
        recognition.onend = () => setListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`p-2 rounded-lg transition-colors shrink-0 flex items-center justify-center ${
                listening ? "bg-red-50" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            } ${className}`}
            title={listening ? "Arrêter la dictée" : "Dicter votre message"}
            aria-label={listening ? "Arrêter la dictée" : "Dicter votre message"}
        >
            {listening ? <ListeningBars /> : <Mic className="h-4 w-4" />}
        </button>
    );
}