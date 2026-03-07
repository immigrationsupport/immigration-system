import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Globe, FileCheck, Landmark, CheckCircle, Shield, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-grow bg-blue-900">
        {/* Hero Section */}
        <section className="bg-slate-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6">
                Your Trusted Immigration Partner
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
                Expert guidance and secure document processing for individuals and businesses navigating the global immigration process.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-8 py-3 w-full sm:w-auto text-base font-semibold rounded-sm text-white bg-[#1E3A8A] hover:bg-blue-900 transition-colors"
                >
                  Get started
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center px-8 py-3 w-full sm:w-auto text-base font-semibold rounded-sm text-[#1E3A8A] bg-transparent border border-[#1E3A8A] hover:bg-blue-50 transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Preview Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Immigration Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Dedicated solutions tailored for your unique immigration pathway.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm hover:shadow-md transition-shadow">
                <Globe className="w-10 h-10 text-[#1E3A8A] mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Visa Application</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Comprehensive support for tourist, work, student, and specialized visa categories worldwide.
                </p>
                <Link href="/services" className="inline-flex items-center text-[#1E3A8A] font-semibold hover:text-blue-700">
                  Learn more <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm hover:shadow-md transition-shadow">
                <Landmark className="w-10 h-10 text-[#1E3A8A] mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Permanent Residency</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Strategic planning and complete application management for pathways to permanent residency statuses.
                </p>
                <Link href="/services" className="inline-flex items-center text-[#1E3A8A] font-semibold hover:text-blue-700">
                  Learn more <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm hover:shadow-md transition-shadow">
                <FileCheck className="w-10 h-10 text-[#1E3A8A] mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Document Processing</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Accurate review, translation coordination, and secure submission of all required legal paperwork.
                </p>
                <Link href="/services" className="inline-flex items-center text-[#1E3A8A] font-semibold hover:text-blue-700">
                  Learn more <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-slate-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose ATLE Immigration?</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  We combine years of legal expertise with a commitment to client success, ensuring your case is handled with the highest level of professionalism and diligence.
                </p>
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-[#1E3A8A]" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-gray-900">Proven Track Record</h4>
                      <p className="mt-1 text-gray-600">Thousands of successful applications and satisfied clients globally.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-[#1E3A8A]" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-gray-900">Secure & Confidential</h4>
                      <p className="mt-1 text-gray-600">Your sensitive documents and data are handled with enterprise-grade security.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-[#1E3A8A]" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-gray-900">Efficient Processing</h4>
                      <p className="mt-1 text-gray-600">We minimize delays through meticulous preparation and direct authorized communication methods.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 bg-white p-10 border border-gray-200 rounded-sm shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to discuss your case?</h3>
                <p className="text-gray-600 mb-8">Our certified consultants are available for a detailed evaluation of your immigration status.</p>
                <Link href="/contact" className="block w-full text-center px-6 py-3 border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-[#1E3A8A] hover:bg-blue-900">
                  Schedule a Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}