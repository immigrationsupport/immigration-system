"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { LogIn, Search, Menu, X, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function Navbar() {
    const t = useTranslations("navigation.navbar");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLangOpen, setIsLangOpen] = useState(false);

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
        } else if (query.includes("destination") || query.includes("countr") || query.includes("canada")) {
            router.push("/#destinations");
        } else if (query.includes("contact") || query.includes("consultation") || query.includes("email") || query.includes("phone")) {
            router.push("/#contact");
        } else {
            // Default fallback
            router.push("/#services");
        }
    };

    const changeLanguage = (nextLocale: "en" | "fr") => {
        setIsLangOpen(false);
        router.replace(pathname, { locale: nextLocale });
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
                            {tCommon("appName")}
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-10">
                        <Link 
                            href="/" 
                            className={`font-bold text-[16px] lg:text-[18px] transition-colors ${isActive('/') ? 'text-[#1E3A8A]' : 'text-[#374151] hover:text-[#1E3A8A]'}`}
                        >
                            {t("home")}
                        </Link>
                        <Link 
                            href="/services" 
                            className={`font-bold text-[16px] lg:text-[18px] transition-colors ${isActive('/services') ? 'text-[#1E3A8A]' : 'text-[#374151] hover:text-[#1E3A8A]'}`}
                        >
                            {t("services")}
                        </Link>
                        <Link 
                            href="/about" 
                            className={`font-bold text-[16px] lg:text-[18px] transition-colors ${isActive('/about') ? 'text-[#1E3A8A]' : 'text-[#374151] hover:text-[#1E3A8A]'}`}
                        >
                            {t("about")}
                        </Link>
                        <Link 
                            href="/contact" 
                            className={`font-bold text-[16px] lg:text-[18px] transition-colors ${isActive('/contact') ? 'text-[#1E3A8A]' : 'text-[#374151] hover:text-[#1E3A8A]'}`}
                        >
                            {t("contact")}
                        </Link>
                    </div>

                    {/* Right Section: Search, Language Switcher & Actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {/* Desktop Search Bar */}
                        <form onSubmit={handleSearch} className="relative w-48 lg:w-56">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={`${tCommon("search")}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-[#6B7280] focus:outline-none focus:placeholder-[#4B5563] focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-[15px] font-medium transition-colors"
                            />
                        </form>

                        {/* Language Selector Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors font-bold text-[15px] cursor-pointer"
                            >
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="uppercase">{locale}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isLangOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                                        <button
                                            onClick={() => changeLanguage('en')}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${locale === 'en' ? 'bg-[#1E3A8A] text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => changeLanguage('fr')}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${locale === 'fr' ? 'bg-[#1E3A8A] text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            Français
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <Link
                            href="/sign-in"
                            className="inline-flex items-center justify-center px-5 py-2 border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 bg-white rounded-md text-[15px] font-extrabold transition-colors"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            {t("login")}
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
                                placeholder={`${tCommon("search")}...`}
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
                                {t("home")}
                            </Link>
                            <Link 
                                href="/services" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium ${isActive('/services') ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-900 hover:bg-gray-50 hover:text-[#1E3A8A]'}`}
                            >
                                {t("services")}
                            </Link>
                            <Link 
                                href="/about" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium ${isActive('/about') ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-900 hover:bg-gray-50 hover:text-[#1E3A8A]'}`}
                            >
                                {t("about")}
                            </Link>
                            <Link 
                                href="/contact" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium ${isActive('/contact') ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-900 hover:bg-gray-50 hover:text-[#1E3A8A]'}`}
                            >
                                {t("contact")}
                            </Link>
                        </div>

                        {/* Mobile Language Switcher */}
                        <div className="flex justify-between items-center px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                            <span className="text-gray-600 text-sm font-semibold flex items-center">
                                <Globe className="w-4 h-4 mr-2 text-gray-500" />
                                {t("language")}
                            </span>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => { changeLanguage('en'); setIsMobileMenuOpen(false); }}
                                    className={`px-3 py-1.5 text-xs rounded font-bold transition-all cursor-pointer ${locale === 'en' ? 'bg-[#1E3A8A] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => { changeLanguage('fr'); setIsMobileMenuOpen(false); }}
                                    className={`px-3 py-1.5 text-xs rounded font-bold transition-all cursor-pointer ${locale === 'fr' ? 'bg-[#1E3A8A] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    FR
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <Link
                                href="/sign-in"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full flex items-center justify-center px-4 py-3 border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 bg-white rounded-md text-base font-semibold transition-colors"
                            >
                                <LogIn className="w-5 h-5 mr-2" />
                                {t("login")}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}