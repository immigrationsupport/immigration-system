import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 border-b border-gray-200 pb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">About Our Agency</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            A premier firm dedicated to navigating the complexities of global immigration law.
                        </p>
                    </div>

                    <div className="space-y-16">
                        {/* Mission Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission & Experience</h2>
                            <div className="prose prose-lg text-gray-600 max-w-none">
                                <p className="leading-relaxed mb-4">
                                    Founded with the goal of providing transparent, ethical, and efficient immigration guidance, Apex Immigration has developed an elite practice focusing on the precise processing of legal visas, residency statuses, and corporate immigration structures.
                                </p>
                                <p className="leading-relaxed">
                                    Our firm operates at the intersection of international law and local regulations, guaranteeing that our clients' filings meet strict governmental criteria. We pride ourselves on confidentiality, reducing risk, and eliminating the administrative burdens common to complex immigration pipelines.
                                </p>
                            </div>
                        </section>

                        {/* Consultants Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Consultants</h2>
                            <div className="prose prose-lg text-gray-600 max-w-none">
                                <p className="leading-relaxed">
                                    Our network consists of certified immigration authorities, legal strategists, and former consulate officers. By employing individuals with deep institutional knowledge, we provide our clients with accurate foresight regarding application timelines, documentation requirements, and potential legal hurdles. Every case is assigned to a specialized senior consultant ensuring customized, dedicated representation.
                                </p>
                            </div>
                        </section>

                        {/* Statistics Grid */}
                        <section className="bg-slate-50 border border-gray-200 p-8 rounded-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-8 text-center uppercase tracking-wider">Agency Performance Metrics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div>
                                    <div className="text-4xl font-bold text-[#1E3A8A] mb-2">15+</div>
                                    <div className="text-gray-700 font-semibold text-sm">Years of Experience</div>
                                </div>
                                <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                                    <div className="text-4xl font-bold text-[#1E3A8A] mb-2">12,500+</div>
                                    <div className="text-gray-700 font-semibold text-sm">Applications Processed</div>
                                </div>
                                <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                                    <div className="text-4xl font-bold text-[#1E3A8A] mb-2">98.4%</div>
                                    <div className="text-gray-700 font-semibold text-sm">Success Rate</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
