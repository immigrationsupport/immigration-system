import Link from "next/link";
import { LogIn } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold text-[#1E3A8A] tracking-wide flex items-center">
                            {/* Simple minimal geometric logo representing an agency */}
                            <div className="w-8 h-8 bg-[#1E3A8A] mr-3 rounded-sm flex items-center justify-center">
                                <span className="text-white text-lg font-serif">A</span>
                            </div>
                            ATLE Immigration
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-600 hover:text-[#1E3A8A] font-medium text-sm transition-colors">
                            Home
                        </Link>
                        <Link href="/services" className="text-gray-600 hover:text-[#1E3A8A] font-medium text-sm transition-colors">
                            Services
                        </Link>
                        <Link href="/about" className="text-gray-600 hover:text-[#1E3A8A] font-medium text-sm transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="text-gray-600 hover:text-[#1E3A8A] font-medium text-sm transition-colors">
                            Contact
                        </Link>
                    </div>

                    <div className="hidden sm:flex sm:items-center space-x-4">
                        <Link
                            href="/sign-in"
                            className="inline-flex items-center justify-center px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 bg-white rounded-sm text-sm font-semibold transition-colors"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
