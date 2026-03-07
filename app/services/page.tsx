import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap, Landmark, FileText, Building, Building2 } from "lucide-react";

export default function ServicesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Our Immigration Services</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Comprehensive, legally-backed support for every stage of your global mobility journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Service Item */}
                        <div className="bg-white p-8 border border-gray-200 rounded-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <Briefcase className="w-8 h-8 text-[#1E3A8A] mb-5" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Work Visa Processing</h3>
                            <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                                End-to-end assistance for obtaining specialized work visas (H-1B, L-1, O-1, etc.) enabling professionals to join global workforces legally.
                            </p>
                            <Link href="/sign-up" className="inline-flex items-center text-[#1E3A8A] font-semibold hover:text-blue-800">
                                Start Application <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>

                        {/* Service Item */}
                        <div className="bg-white p-8 border border-gray-200 rounded-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <GraduationCap className="w-8 h-8 text-[#1E3A8A] mb-5" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Student Visa Assistance</h3>
                            <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                                Complete documentation processing for international educational enrollment, ensuring full compliance with academic immigration protocols.
                            </p>
                            <Link href="/sign-up" className="inline-flex items-center text-[#1E3A8A] font-semibold hover:text-blue-800">
                                Start Application <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>

                        {/* Service Item */}
                        <div className="bg-white p-8 border border-gray-200 rounded-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <Landmark className="w-8 h-8 text-[#1E3A8A] mb-5" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Permanent Residency</h3>
                            <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                                Strategic long-term planning, file preparation, and status adjustment applications to secure permanent resident status.
                            </p>
                            <Link href="/sign-up" className="inline-flex items-center text-[#1E3A8A] font-semibold hover:text-blue-800">
                                Start Application <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>

                        {/* Service Item */}
                        <div className="bg-white p-8 border border-gray-200 rounded-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <FileText className="w-8 h-8 text-[#1E3A8A] mb-5" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Citizenship Application</h3>
                            <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                                Guided preparation for naturalization processes, documentation review, and exam coordination.
                            </p>
                            <Link href="/sign-up" className="inline-flex items-center text-[#1E3A8A] font-semibold hover:text-blue-800">
                                Start Application <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>

                        {/* Service Item */}
                        <div className="bg-white p-8 border border-gray-200 rounded-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <Building className="w-8 h-8 text-[#1E3A8A] mb-5" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Business Immigration</h3>
                            <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                                Corporate-level advisory for establishing new commercial enterprises, investor visas (EB-5, E-2), and multi-national executive relocations.
                            </p>
                            <Link href="/sign-up" className="inline-flex items-center text-[#1E3A8A] font-semibold hover:text-blue-800">
                                Start Application <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>

                        {/* Empty spacer / Consult option */}
                        <div className="bg-slate-50 p-8 border border-gray-200 rounded-sm flex flex-col h-full justify-center items-center text-center">
                            <Building2 className="w-8 h-8 text-gray-400 mb-5" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Case Review</h3>
                            <p className="text-gray-600 mb-6">
                                Have a complex immigration challenge? Consult directly with our Senior Partners.
                            </p>
                            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-2 border border-[#1E3A8A] text-[#1E3A8A] font-semibold rounded-sm hover:bg-blue-50 transition-colors">
                                Contact Us
                            </Link>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
