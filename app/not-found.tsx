"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Automatically redirect back after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Only attempt to go back if we are in a browser environment
          if (typeof window !== 'undefined' && window.history.length > 2) {
              router.back();
          } else {
              router.push('/');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
        router.back();
    } else {
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-blue-900/10 p-10 text-center border border-[#eef0f8]">
        <div className="w-20 h-20 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[32px] font-extrabold text-[#0f1f4b] mb-3" style={{ fontFamily: "Georgia, serif" }}>
          Page Not Found
        </h1>
        
        <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
          The page you are looking for doesn't exist or has been moved. 
          You will automatically be redirected in <span className="font-bold text-[#1E3A8A]">{countdown}</span> seconds.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1E3A8A] hover:bg-[#1630a0] text-white text-[14px] font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back Now
          </button>
          
          <Link 
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 text-[14px] font-bold rounded-xl transition-all"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
