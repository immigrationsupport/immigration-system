import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ArrowRight, FileText, GraduationCap, Home as HomeIcon, Briefcase, Building2, MessageSquare, CheckCircle, Phone } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("home");
  const tServices = await getTranslations("services");
  const tAbout = await getTranslations("about");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();

  const services = [
    { icon: <Briefcase className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: tServices("workVisa.title"), desc: tServices("workVisa.description") },
    { icon: <GraduationCap className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: tServices("studentVisa.title"), desc: tServices("studentVisa.description") },
    { icon: <HomeIcon  className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: tServices("permanentResidency.title"), desc: tServices("permanentResidency.description") },
    { icon: <FileText className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: tServices("citizenship.title"), desc: tServices("citizenship.description") },
    { icon: <Building2 className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: tServices("businessImmigration.title"), desc: tServices("businessImmigration.description") },
  ];

  const destinations = [
    { country: "🇨🇦 Canada", img: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80" },
  ];

  const checks = locale === "en"
    ? ["Certified Consultants", "Real-Time Status Updates", "Confidential & Secure", "Fast Processing Times", "Canada Specialist Agents", "98.4% Approval Rate"]
    : ["Consultants certifiés", "Mises à jour en temps réel", "Confidentiel & sécurisé", "Délais de traitement rapides", "Agents spécialistes du Canada", "Taux d'approbation de 98,4%"];

  const tickerItems = locale === "en"
    ? ["Visa Assistance", "Travel Planning", "Global Immigration", "Work Permits", "Residency Services", "Citizenship"]
    : ["Assistance Visa", "Planification de Voyage", "Immigration Globale", "Permis de Travail", "Services de Résidence", "Citoyenneté"];

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
                {locale === "en" ? (
                  <>
                    Your Trusted<br />
                    <span className="text-[#1E3A8A]">Immigration Partner</span>
                  </>
                ) : (
                  <>
                    Votre partenaire<br />
                    <span className="text-[#1E3A8A]">d'immigration de confiance</span>
                  </>
                )}
              </h1>
              <p className="text-[16px] text-slate-500 leading-[1.75] max-w-md mb-8">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/services" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1E3A8A] text-white text-[14px] font-bold rounded-lg hover:bg-[#1630a0] hover:-translate-y-px transition-all shadow-lg shadow-blue-900/20">
                  {locale === "en" ? "Explore our services" : "Explorer nos services"} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/sign-up" className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[#1E3A8A] text-[#1E3A8A] text-[14px] font-bold rounded-lg hover:bg-[#1E3A8A] hover:text-white transition-all">
                  {t("hero.ctaButton")}
                </Link>
              </div>
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <FileText className="w-5 h-5 text-[#1E3A8A]" strokeWidth={1.8}/>, title: locale === "en" ? "Passport Services" : "Services de passeport", sub: locale === "en" ? "Fast Processing" : "Traitement rapide" },
                  { icon: <GraduationCap className="w-5 h-5 text-[#1E3A8A]" strokeWidth={1.8}/>, title: locale === "en" ? "Student Visa" : "Visa étudiant", sub: locale === "en" ? "All Universities" : "Toutes les universités" },
                  { icon: <Briefcase className="w-5 h-5 text-[#1E3A8A]" strokeWidth={1.8}/>, title: locale === "en" ? "Work Permit" : "Permis de travail", sub: locale === "en" ? "Global Access" : "Accès mondial" },
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
                <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&q=80" alt="city" className="object-cover w-full h-full"/>
              </div>
              <div className="absolute top-0 right-[260px] w-[200px] h-[185px] rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&q=80" alt="travel" className="object-cover w-full h-full"/>
              </div>
              <div className="absolute bottom-0 right-0 w-[340px] h-[210px] rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=700&q=80" alt="destination" className="object-cover w-full h-full"/>
              </div>
              <div className="absolute bottom-[60px] right-[360px] w-[100px] h-[100px] rounded-xl overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80" alt="airplane" className="object-cover w-full h-full"/>
              </div>
              <div className="absolute top-[160px] right-[250px] z-10 bg-[#1E3A8A] text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-900/40">
                <div className="text-[32px] font-extrabold leading-none" style={{ fontFamily: "Georgia, serif" }}>5+</div>
                <div className="text-[11px] text-white/70 mt-1">{tAbout("yearsOfExperience")}</div>
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
              { num: "5+", label: tAbout("yearsOfExperience") },
              { num: "1,250+", label: tAbout("applicationsProcessed") },
              { num: "88.4%", label: tAbout("successRate") },
              { num: "100%", label: locale === "en" ? "Canada Dedicated" : "Dédié au Canada" },
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
              <p className="text-[12px] font-bold text-[#1E3A8A] tracking-[2.5px] uppercase mb-3">{locale === "en" ? "Our Immigration Services" : "Nos services d'immigration"}</p>
              <h2 className="text-[40px] font-extrabold text-[#0f1f4b] mb-4" style={{ fontFamily: "Georgia, serif" }}>
                {locale === "en" ? "Comprehensive Visa Solutions" : "Solutions complètes de visa"}
              </h2>
              <p className="text-[15px] text-slate-400 max-w-xl mx-auto leading-[1.7]">
                {tServices("pageSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(({ icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-8 border border-[#eef0f8] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-900/10 hover:border-[#c7d2fe] transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center mb-5">{icon}</div>
                  <h3 className="text-[18px] font-extrabold text-[#0f1f4b] mb-3">{title}</h3>
                  <p className="text-[14px] text-slate-400 leading-[1.75] mb-5">{desc}</p>
                  <Link href="/sign-up" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1E3A8A] group-hover:gap-3 transition-all">
                    {locale === "en" ? "Start Application" : "Commencer la demande"} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2d54c5] rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center mb-5">
                    <MessageSquare className="w-6 h-6 text-white" strokeWidth={1.8}/>
                  </div>
                  <h3 className="text-[18px] font-extrabold text-white mb-3">{tServices("customCaseReview.title")}</h3>
                  <p className="text-[14px] text-white/75 leading-[1.75] mb-5">{tServices("customCaseReview.description")}</p>
                </div>
                <Link href="#contact" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white uppercase tracking-widest hover:gap-3 transition-all">
                  {tServices("customCaseReview.contactUs")} <ArrowRight className="w-3.5 h-3.5" />
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
                <img src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80" alt="family" className="object-cover w-full h-full"/>
              </div>
              <div className="absolute top-[50px] right-0 w-[180px] h-[240px] rounded-2xl overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=400&q=80" alt="office" className="object-cover w-full h-full"/>
              </div>
              <div className="absolute bottom-[10px] left-[20px] bg-[#1E3A8A] text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-900/40 z-10">
                <div className="text-[36px] font-extrabold leading-none" style={{ fontFamily: "Georgia, serif" }}>5+</div>
                <div className="text-[12px] text-white/70 mt-1">{tAbout("yearsOfExperience")}</div>
              </div>
            </div>
            {/* Text */}
            <div className="flex-1">
              <p className="text-[12px] font-bold text-[#1E3A8A] tracking-[2.5px] uppercase mb-3">
                {locale === "en" ? "About ATLE Immigration" : "À propos d'ATLE Immigration"}
              </p>
              <h2 className="text-[38px] font-extrabold text-[#0f1f4b] mb-5 leading-[1.15]" style={{ fontFamily: "Georgia, serif" }}>
                {locale === "en" ? (
                  <>We Are a Trusted Visa<br />and Immigration Agency</>
                ) : (
                  <>Nous sommes une agence de visa<br />et d'immigration de confiance</>
                )}
              </h2>
              <p className="text-[15px] text-slate-400 leading-[1.85] mb-4">
                {tAbout("missionText1")}
              </p>
              <p className="text-[15px] text-slate-400 leading-[1.85] mb-8">
                {tAbout("missionText2")}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {checks.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-[14px] font-semibold text-slate-700">
                    <CheckCircle className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" strokeWidth={2.5}/> {c}
                  </div>
                ))}
              </div>
              <Link href="/about" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1E3A8A] text-white text-[14px] font-bold rounded-lg hover:bg-[#1630a0] transition-all">
                {locale === "en" ? "Learn More About Us" : "En savoir plus sur nous"} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── DESTINATIONS ── */}
        <section id="destinations" className="py-20 px-8 bg-[#f8f9ff]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[12px] font-bold text-[#1E3A8A] tracking-[2.5px] uppercase mb-3">
                {locale === "en" ? "Popular Countries" : "Pays populaires"}
              </p>
              <h2 className="text-[40px] font-extrabold text-[#0f1f4b] mb-4" style={{ fontFamily: "Georgia, serif" }}>
                {locale === "en" ? "Choose Your Destination" : "Choisissez votre destination"}
              </h2>
              <p className="text-[15px] text-slate-400 max-w-md mx-auto">
                {locale === "en" 
                  ? "We help you reach your dream country with the right visa strategy and expert guidance."
                  : "Nous vous aidons à atteindre le pays de vos rêves avec la bonne stratégie de visa et des conseils d'experts."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {destinations.map(({ country, img }) => (
                <div key={country} className="relative h-[240px] rounded-2xl overflow-hidden group cursor-pointer">
                  <img src={img} alt={country} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a143c]/75 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[20px] font-extrabold text-white mb-3">{country}</p>
                    <Link href="/sign-up" className="inline-flex items-center gap-1.5 bg-white text-[#1E3A8A] text-[12px] font-bold px-4 py-1.5 rounded-full hover:bg-[#EEF2FF] transition-colors">
                      {locale === "en" ? "Apply Now" : "Postuler maintenant"} <ArrowRight className="w-3.5 h-3"/>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div id="contact" className="relative py-24 px-8 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80" alt="cta bg" className=" absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-[#0a1946]/85 backdrop-blur-[2px]"/>
          
          <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-200 text-xs font-black uppercase tracking-widest mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                {locale === "en" ? "Available Now" : "Disponible maintenant"}
              </div>
              <h2 className="text-[48px] lg:text-[56px] font-black text-white mb-6 leading-[1.05] tracking-tighter" style={{ fontFamily: "Georgia, serif" }}>
                {locale === "en" ? (
                  <>Book a Free<br /><span className="text-blue-400">Consultation</span></>
                ) : (
                  <>Réserver une<br /><span className="text-blue-400">consultation gratuite</span></>
                )}
              </h2>
              <p className="text-lg text-white/70 max-w-lg leading-relaxed mb-8">
                {t("cta.subtitle")}
              </p>
              
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4 text-white/80">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                    <CheckCircle size={20} />
                  </div>
                  <span className="font-bold">
                    {locale === "en" ? "Official response within 24 hours" : "Réponse officielle sous 24 heures"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                    <CheckCircle size={20} />
                  </div>
                  <span className="font-bold">
                    {locale === "en" ? "100% Secure & Confidential" : "100% sécurisé et confidentiel"}
                  </span>
                </div>
              </div>
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
              {locale === "en" 
                ? "Mon–Fri 8AM–6PM · Sat 9AM–1PM (WAT)" 
                : "Lun–Ven 8h–18h · Sam 9h–13h (WAT)"}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
