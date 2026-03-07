"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate a form submission delay
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 border-b border-gray-200 pb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Contact Us</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Connect with our certified officers to schedule a consultation or inquire about processing statuses.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Contact Form */}
                        <div className="lg:w-3/5">
                            {submitted ? (
                                <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-sm">
                                    <h3 className="text-xl font-bold mb-2">Inquiry Received</h3>
                                    <p>Your message has been securely submitted. An authorized representative will contact you within 24-48 business hours.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-6 text-[#1E3A8A] font-semibold hover:underline"
                                    >
                                        Submit another inquiry
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-800 mb-2">Legal Full Name</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-900"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-900"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-900"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-2">Inquiry Details</label>
                                        <textarea
                                            id="message"
                                            required
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-900 resize-y"
                                            placeholder="Provide details regarding your current immigration needs..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex justify-center items-center px-8 py-3 w-full md:w-auto border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-[#1E3A8A] hover:bg-blue-900 focus:outline-none transition-colors disabled:opacity-70"
                                    >
                                        {submitting ? "Transmitting..." : (
                                            <>
                                                Secure Submit <Send className="ml-2 w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Agency Contact Information */}
                        <div className="lg:w-2/5">
                            <div className="bg-slate-50 border border-gray-200 p-8 rounded-sm h-full">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">Corporate Headquarters</h3>

                                <div className="space-y-6">
                                    <div className="flex">
                                        <MapPin className="w-6 h-6 text-[#1E3A8A] flex-shrink-0 mr-4" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">Mailing Address</h4>
                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                Apex Immigration, LLC<br />
                                                400 Corporate Link, Suite 300<br />
                                                Washington, DC 20001
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <Phone className="w-6 h-6 text-[#1E3A8A] flex-shrink-0 mr-4" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">Direct Line</h4>
                                            <p className="text-gray-600 text-sm">
                                                +1 (555) 789-0123
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <Mail className="w-6 h-6 text-[#1E3A8A] flex-shrink-0 mr-4" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">Official Communications</h4>
                                            <p className="text-gray-600 text-sm">
                                                contact@apeximmigration.com
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">Operating Hours</h4>
                                    <p className="text-gray-600 text-sm">
                                        Monday - Friday: 9:00 AM - 5:00 PM EST<br />
                                        Closed on Federal Holidays.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
