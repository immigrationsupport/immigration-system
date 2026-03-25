"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-gray-200 pb-8">
                    {/* Brand Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <div className="w-5 h-5 bg-[#1E3A8A] mr-2 rounded-sm flex items-center justify-center">
                                <span className="text-white text-xs font-serif">A</span>
                            </div>
                            ATLE Immigration
                        </h3>
                        <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
                            Providing expert immigration services and guidance to help you navigate your journey with confidence and legal integrity.
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="flex flex-col space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Offices</h3>
                        
                        <div className="flex items-center text-gray-600 text-sm">
                            <Mail className="w-4 h-4 mr-3 text-[#1E3A8A]" />
                            <a href="mailto:emlieag573@gmail.com" className="hover:text-gray-900 transition-colors">
                                emlieag573@gmail.com
                            </a>
                        </div>

                        <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="w-4 h-4 mr-3 text-[#1E3A8A]" />
                            <a href="tel:+237680703365" className="hover:text-gray-900 transition-colors">
                                +237 680 703 365
                            </a>
                        </div>

                        <div className="flex items-start text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-3 text-[#1E3A8A] mt-0.5 flex-shrink-0" />
                            <span className="whitespace-pre-wrap">
                                DOUALA, CAMEROUN<br />
                                Bonamoussadi, carrefour maison blanche
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500">
                    <div>
                        &copy; ATLE Immigration
                    </div>
                    <div className="flex space-x-6">
                        <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-gray-900 transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}