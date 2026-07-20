"use client";

import { Link } from "@/i18n/routing";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations("navigation.footer");
    const tNavbar = useTranslations("navigation.navbar");
    const tCommon = useTranslations("common");

    return (
        <footer className="bg-[#0F2460] text-white mt-auto">
            <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 pb-10 border-b border-white/10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-extrabold text-lg tracking-tight">ATLE</div>
                                <div className="text-blue-300 text-xs tracking-widest uppercase">Immigration</div>
                            </div>
                        </div>
                        <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
                            {t("description")}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-4">
                            {localeSwitch(tCommon("home") === "Home" ? "Quick Links" : "Liens Rapides")}
                        </h3>
                        <div className="flex flex-col gap-2">
                            {[
                                { href: "/", label: tNavbar("home") },
                                { href: "/services", label: tNavbar("services") },
                                { href: "/about", label: tNavbar("about") },
                                { href: "/contact", label: tNavbar("contact") },
                            ].map(({ href, label }) => (
                                <Link key={href} href={href} className="text-blue-200 text-sm hover:text-white transition-colors">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-4">{tCommon("contact")}</h3>
                        <div className="flex flex-col gap-3">
                            <a href="mailto:emilieag573@gmail.com" className="flex items-center gap-3 text-blue-200 text-sm hover:text-white transition-colors">
                                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                emilieag573@gmail.com
                            </a>
                            <a href="tel:+237680703365" className="flex items-center gap-3 text-blue-200 text-sm hover:text-white transition-colors">
                                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                +237 680 703 365
                            </a>
                            <div className="flex items-start gap-3 text-blue-200 text-sm">
                                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="whitespace-pre-line">{t("address")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-300">
                    <div>&copy; {t("copyright")}</div>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">{t("privacy")}</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">{t("terms")}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Simple helper to detect current language and translate static strings in Footer
function localeSwitch(enText: string) {
    return enText;
}
