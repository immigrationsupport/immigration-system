"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, Search, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Helper to determine if a link is active
    const isActive = (path: string) => pathname === path;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        const query = searchQuery.toLowerCase().trim();
        if (!query) return;

        setIsMobileMenuOpen(false); // Close mobile menu if open
        setSearchQuery(""); // Clear search input

        if (query.includes("service") || query.includes("visa") || query.includes("solution")) {
            router.push("/#services");
        } else if (query.includes("about") || query.includes("agency") || query.includes("firm")) {
            router.push("/#about");
        } else if (query.includes("destination") || query.includes("countr") || query.includes("canada") || query.includes("france") || query.includes("germany")) {
            router.push("/#destinations");
        } else if (query.includes("contact") || query.includes("consultation") || query.includes("email") || query.includes("phone")) {
            router.push("/#contact");
        } else {
            // Default fallback
            router.push("/#services");
        }
    };

    return (
        <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold text-[#1E3A8A] tracking-wide flex items-center">
                            <div className="w-8 h-8 bg-[#1E3A8A] mr-3 rounded-sm flex items-center justify-center">
                                <span className="text-white text-lg font-serif">A</span>
                            </div>
                            ATLE Immigration
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-10">
                        <Link 
                            href="/" 
                            className={`font-bold text-[16px] lg:text-[18px] transition-colors ${isActive('/') ? 'text-[#1E3A8A]' : 'text-[#374151] hover:text-[#1E3A8A]'}`}
                        >
                            Home
                        </Link>
                        <Link 
                            href="/services" 
                            className={`font-bold text-[16px] lg:text-[18px] transition-colors ${isActive('/services') ? 'text-[#1E3A8A]' : 'text-[#374151] hover:text-[#1E3A8A]'}`}
                        >
                            Services
                        </Link>
                        <Link 
                            href="/about" 
                            className={`font-bold text-[16px] lg:text-[18px] transition-colors ${isActive('/about') ? 'text-[#1E3A8A]' : 'text-[#374151] hover:text-[#1E3A8A]'}`}
                        >
                            About Us
                        </Link>
                        <Link 
                            href="/contact" 
                            className={`font-bold text-[16px] lg:text-[18px] transition-colors ${isActive('/contact') ? 'text-[#1E3A8A]' : 'text-[#374151] hover:text-[#1E3A8A]'}`}
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Right Section: Search & Actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {/* Desktop Search Bar */}
                        <form onSubmit={handleSearch} className="relative w-56 lg:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search here..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-[#6B7280] focus:outline-none focus:placeholder-[#4B5563] focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-[16px] font-medium transition-colors"
                            />
                        </form>

                        <Link
                            href="/sign-in"
                            className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 bg-white rounded-md text-[16px] font-extrabold transition-colors"
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                             Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-[#1E3A8A] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1E3A8A]"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg absolute w-full left-0 z-40">
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        {/* Mobile Search Bar */}
                        <form onSubmit={handleSearch} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for applications, services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-base transition-colors"
                            />
                        </form>

                        <div className="flex flex-col space-y-1">
                            <Link 
                                href="/" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium ${isActive('/') ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-900 hover:bg-gray-50 hover:text-[#1E3A8A]'}`}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/services" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium ${isActive('/services') ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-900 hover:bg-gray-50 hover:text-[#1E3A8A]'}`}
                            >
                                Services
                            </Link>
                            <Link 
                                href="/about" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium ${isActive('/about') ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-900 hover:bg-gray-50 hover:text-[#1E3A8A]'}`}
                            >
                                About Us
                            </Link>
                            <Link 
                                href="/contact" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium ${isActive('/contact') ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-900 hover:bg-gray-50 hover:text-[#1E3A8A]'}`}
                            >
                                Contact
                            </Link>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <Link
                                href="/sign-in"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full flex items-center justify-center px-4 py-3 border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 bg-white rounded-md text-base font-semibold transition-colors"
                            >
                                <LogIn className="w-5 h-5 mr-2" />
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}