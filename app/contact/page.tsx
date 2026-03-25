"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong.");
            }

            setSubmitted(true);
            setForm({ fullName: "", email: "", phone: "", message: "" });
        } catch (err: any) {
            setError(err.message || "Failed to send message. Please try again.");
        } finally {
            setSubmitting(false);
        }
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
                                <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-sm flex flex-col items-start gap-3">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                    <h3 className="text-xl font-bold">Inquiry Received</h3>
                                    <p className="text-sm leading-relaxed">
                                        Your message has been sent successfully. An authorized representative will contact you within 24–48 business hours.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-2 text-[#1E3A8A] font-semibold hover:underline text-sm"
                                    >
                                        Submit another inquiry
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-sm text-sm">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-800 mb-2">Legal Full Name</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            required
                                            maxLength={50}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-900 outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                maxLength={50}
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-900 outline-none"
                                                placeholder="Enter your email "
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-900 outline-none"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-2">Inquiry Details</label>
                                        <textarea
                                            id="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            minLength={50}
                                            maxLength={1000}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-900 resize-none outline-none"
                                            placeholder="Provide details regarding your needs... "
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex justify-center items-center px-8 py-3 w-full md:w-auto border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-[#1E3A8A] hover:bg-blue-900 focus:outline-none transition-colors disabled:opacity-70"
                                    >
                                        {submitting ? "Sending..." : (
                                            <>
                                                Send Message <Send className="ml-2 w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Agency Contact Information */}
                        <div className="lg:w-2/5">
                            <div className="bg-slate-50 border border-gray-200 p-8 rounded-sm h-full">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">Our Office</h3>

                                <div className="space-y-6">
                                    <div className="flex">
                                        <MapPin className="w-6 h-6 text-[#1E3A8A] flex-shrink-0 mr-4 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">Address</h4>
                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                ATLE Immigration<br />
                                                DOUALA, CAMEROUN<br />
                                                Bonamoussadi, carrefour maison blanche
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <Phone className="w-6 h-6 text-[#1E3A8A] flex-shrink-0 mr-4" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">Phone</h4>
                                            <a
                                                href="tel:+237680703365"
                                                className="text-gray-600 text-sm hover:text-[#1E3A8A] transition-colors"
                                            >
                                                +237 680 703 365
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <Mail className="w-6 h-6 text-[#1E3A8A] flex-shrink-0 mr-4" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">Email</h4>
                                            <a
                                                href="mailto:emilieag573@gmail.com"
                                                className="text-gray-600 text-sm hover:text-[#1E3A8A] transition-colors"
                                            >
                                                emilieag573@gmail.com
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">Operating Hours</h4>
                                    <p className="text-gray-600 text-sm">
                                        Monday – Friday: 8:00 AM – 6:00 PM (WAT)<br />
                                        Saturday: 9:00 AM – 1:00 PM
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
