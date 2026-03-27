import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, GraduationCap, Home as HomeIcon, Briefcase, Building2, MessageSquare, CheckCircle, Phone } from "lucide-react";

const services = [
  { icon: <Briefcase className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: "Work Visa", desc: "End-to-end assistance for H-1B, L-1, O-1 and other work permit categories enabling professionals to join global workforces legally." },
  { icon: <GraduationCap className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: "Student Visa", desc: "Complete documentation for international educational enrollment, ensuring full compliance with academic immigration protocols." },
  { icon: <HomeIcon  className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: "Permanent Residency", desc: "Strategic planning, file preparation, and status adjustment applications to secure permanent resident status abroad." },
  { icon: <FileText className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: "Citizenship Application", desc: "Guided preparation for naturalization processes, documentation review, and exam coordination." },
  { icon: <Building2 className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: "Business Immigration", desc: "Corporate advisory for investor visas (EB-5, E-2), commercial setup, and executive relocations." },
];

const destinations = [
  { country: "🇨🇦 Canada", img: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80" },
  { country: "🇫🇷 France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80" },
  { country: "🇩🇪 Germany", img: "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=600&q=80" },
];

const checks = ["Certified Consultants","Real-Time Status Updates","Confidential & Secure","Fast Processing Times","50+ Countries Covered","98.4% Approval Rate"];

const tickerItems = ["Visa Assistance","Travel Planning","Global Immigration","Work Permits","Residency Services","Citizenship"];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">

        {/* ── HERO ── */}
        <section id="hero" className="bg-gradient-to-br from-[#f0f4ff] to-[#e8eeff] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col lg:flex-row items-center gap-10">
            {/* Left */}
            <div className="flex-1 pb-6">
              <h1 className="text-[52px] lg:text-[58px] font-extrabold text-[#0f1f4b] leading-[1.1] mb-5" style={{ fontFamily: "Georgia, serif" }}>
                Immigration <br />
                <span className="text-[#1E3A8A]">File management system</span>
              </h1>
              <p className="text-[16px] text-slate-500 leading-[1.75] max-w-md mb-8">
                Expert guidance and secure document processing for individuals and businesses navigating the global immigration process with confidence.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/services" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1E3A8A] text-white text-[14px] font-bold rounded-lg hover:bg-[#1630a0] hover:-translate-y-px transition-all shadow-lg shadow-blue-900/20">
                  Explore our service <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/sign-up" className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[#1E3A8A] text-[#1E3A8A] text-[14px] font-bold rounded-lg hover:bg-[#1E3A8A] hover:text-white transition-all">
                  Get started
                </Link>
              </div>
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <FileText className="w-5 h-5 text-[#1E3A8A]" strokeWidth={1.8}/>, title: "Passport Services", sub: "Fast Processing" },
                  { icon: <GraduationCap className="w-5 h-5 text-[#1E3A8A]" strokeWidth={1.8}/>, title: "Student Visa", sub: "All Universities" },
                  { icon: <Briefcase className="w-5 h-5 text-[#1E3A8A]" strokeWidth={1.8}/>, title: "Work Permit", sub: "Global Access" },
                ].map(({ icon, title, sub }) => (
                  <div key={title} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-md shadow-slate-100">
                    <div className="w-9 h-9 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
                    <div>
                      <p className="text-[13px] font-bold text-[#0f1f4b] leading-tight">{title}</p>
                      <span className="text-[11px] text-slate-400">{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right photo grid */}
            <div className="flex-shrink-0 w-full lg:w-[480px] relative h-[480px]">
              <div className="absolute top-0 right-0 w-[240px] h-[185px] rounded-2xl overflow-hidden shadow-xl">
                <img  src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&q=80" alt="city"  className="object-cover w-full h-full"/>
              </div>
              <div className="absolute top-0 right-[260px] w-[200px] h-[185px] rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&q=80" alt="travel" className="object-cover w-full h-full"/>
              </div>
              <div className="absolute bottom-0 right-0 w-[340px] h-[210px] rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=700&q=80" alt="destination"  className="object-cover w-full h-full"/>
              </div>
              <div className="absolute bottom-[60px] right-[360px] w-[100px] h-[100px] rounded-xl overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80" alt="airplane"  className="object-cover w-full h-full"/>
              </div>
              <div className="absolute top-[160px] right-[250px] z-10 bg-[#1E3A8A] text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-900/40">
                <div className="text-[32px] font-extrabold leading-none" style={{ fontFamily: "Georgia, serif" }}>5+</div>
                <div className="text-[11px] text-white/70 mt-1">Years of Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="bg-[#1E3A8A] py-4 overflow-hidden whitespace-nowrap">
          <div className="inline-flex animate-[ticker_25s_linear_infinite]" style={{ animation: "ticker 25s linear infinite" }}>
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-10 text-white text-[14px] font-bold tracking-wide">
                ◆ {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="bg-white border-b border-slate-100 py-10">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { num: "5+", label: "Years of Experience" },
              { num: "1,250+", label: "Applications Processed" },
              { num: "88.4%", label: "Success Rate" },
              { num: "5+", label: "Countries Covered" },
            ].map(({ num, label }, i) => (
              <div key={label} className={`text-center py-4 ${i > 0 ? "border-l border-slate-100" : ""}`}>
                <div className="text-[38px] font-extrabold text-[#1E3A8A] leading-none" style={{ fontFamily: "Georgia, serif" }}>{num}</div>
                <div className="text-[13px] text-slate-400 mt-1.5 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SERVICES ── */}
        <section id="services" className="py-20 px-8 bg-[#f8f9ff]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[12px] font-bold text-[#1E3A8A] tracking-[2.5px] uppercase mb-3">Our Immigration Services</p>
              <h2 className="text-[40px] font-extrabold text-[#0f1f4b] mb-4" style={{ fontFamily: "Georgia, serif" }}>Comprehensive Visa Solutions</h2>
              <p className="text-[15px] text-slate-400 max-w-xl mx-auto leading-[1.7]">Dedicated, legally-backed support for every stage of your global immigration journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(({ icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-8 border border-[#eef0f8] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-900/10 hover:border-[#c7d2fe] transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center mb-5">{icon}</div>
                  <h3 className="text-[18px] font-extrabold text-[#0f1f4b] mb-3">{title}</h3>
                  <p className="text-[14px] text-slate-400 leading-[1.75] mb-5">{desc}</p>
                  <Link href="/sign-up" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1E3A8A] group-hover:gap-3 transition-all">
                    Start Application <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2d54c5] rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center mb-5">
                    <MessageSquare className="w-6 h-6 text-white" strokeWidth={1.8}/>
                  </div>
                  <h3 className="text-[18px] font-extrabold text-white mb-3">Custom Case Review</h3>
                  <p className="text-[14px] text-white/75 leading-[1.75] mb-5">Have a complex immigration challenge? Our Senior Partners build a tailored legal strategy just for you.</p>
                </div>
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white">
                  Contact Us <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="py-20 px-8 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            {/* Photos */}
            <div className="flex-shrink-0 w-full lg:w-[460px] relative h-[400px]">
              <div className="absolute top-0 left-0 w-[280px] h-[340px] rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80" alt="family"  className="object-cover w-full h-full"/>
              </div>
              <div className="absolute top-[50px] right-0 w-[180px] h-[240px] rounded-2xl overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=400&q=80" alt="office"  className="object-cover w-full h-full"/>
              </div>
              <div className="absolute bottom-[10px] left-[20px] bg-[#1E3A8A] text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-900/40 z-10">
                <div className="text-[36px] font-extrabold leading-none" style={{ fontFamily: "Georgia, serif" }}>5+</div>
                <div className="text-[12px] text-white/70 mt-1">Years of Experience</div>
              </div>
            </div>
            {/* Text */}
            <div className="flex-1">
              <p className="text-[12px] font-bold text-[#1E3A8A] tracking-[2.5px] uppercase mb-3">About ATLE Immigration</p>
              <h2 className="text-[38px] font-extrabold text-[#0f1f4b] mb-5 leading-[1.15]" style={{ fontFamily: "Georgia, serif" }}>
                We Are a Trusted Visa<br />and Immigration Agency
              </h2>
              <p className="text-[15px] text-slate-400 leading-[1.85] mb-4">
                Founded with the goal of providing transparent, ethical, and efficient immigration guidance, ATLE Immigration has developed an elite practice focusing on precise processing of legal visas, residency statuses, and corporate immigration structures.
              </p>
              <p className="text-[15px] text-slate-400 leading-[1.85] mb-8">
                Our firm operates at the intersection of international law and local regulations, guaranteeing every filing meets strict governmental criteria.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {checks.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-[14px] font-semibold text-slate-700">
                    <CheckCircle className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" strokeWidth={2.5}/> {c}
                  </div>
                ))}
              </div>
              <Link href="/about" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1E3A8A] text-white text-[14px] font-bold rounded-lg hover:bg-[#1630a0] transition-all">
                Learn More About Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── DESTINATIONS ── */}
        <section id="destinations" className="py-20 px-8 bg-[#f8f9ff]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[12px] font-bold text-[#1E3A8A] tracking-[2.5px] uppercase mb-3">Popular Countries</p>
              <h2 className="text-[40px] font-extrabold text-[#0f1f4b] mb-4" style={{ fontFamily: "Georgia, serif" }}>Choose Your Destination</h2>
              <p className="text-[15px] text-slate-400 max-w-md mx-auto">We help you reach your dream country with the right visa strategy and expert guidance.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {destinations.map(({ country, img }) => (
                <div key={country} className="relative h-[240px] rounded-2xl overflow-hidden group cursor-pointer">
                  <img src={img} alt={country}  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a143c]/75 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[20px] font-extrabold text-white mb-3">{country}</p>
                    <Link href="/sign-up" className="inline-flex items-center gap-1.5 bg-white text-[#1E3A8A] text-[12px] font-bold px-4 py-1.5 rounded-full hover:bg-[#EEF2FF] transition-colors">
          Apply Now <ArrowRight className="w-3 h-3"/>
        </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div id="contact" className="relative py-20 px-8 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80" alt="cta bg"  className=" absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-[#0a1946]/82"/>
          <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
            <div>
              <p className="text-[40px] font-extrabold text-white mb-4 leading-[1.2]" style={{ fontFamily: "Georgia, serif" }}>
                Book a Free Consultation<br />with Us Today
              </p>
              <p className="text-[16px] text-white/70 max-w-lg leading-[1.7]">Our certified consultants are available for a detailed evaluation of your immigration status and goals. Response within 24 hours.</p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <Link href="/contact" className="px-8 py-4 bg-white text-[#1E3A8A] text-[14px] font-extrabold rounded-lg hover:bg-[#EEF2FF] hover:-translate-y-px transition-all">Book Consultation</Link>
              <Link href="/contact" className="px-8 py-4 border-2 border-white/50 text-white text-[14px] font-bold rounded-lg hover:border-white hover:bg-white/10 transition-all">Contact Us</Link>
            </div>
          </div>
        </div>

        {/* ── CONTACT INFO STRIP ── */}
        <div className="bg-white border-t border-slate-100 py-10 px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-10">
            <a href="tel:+237680703365" className="flex items-center gap-3 text-[15px] font-bold text-[#0f1f4b] hover:text-[#1E3A8A] transition-colors">
              <div className="w-11 h-11 bg-[#EEF2FF] rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#1E3A8A]" strokeWidth={2}/>
              </div>
              +237 680 703 365
            </a>
            <div className="flex items-center gap-3 text-[15px] font-semibold text-slate-400">
              <div className="w-11 h-11 bg-[#EEF2FF] rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#1E3A8A]" strokeWidth={2}/>
              </div>
              Mon–Fri 8AM–6PM · Sat 9AM–1PM (WAT)
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
