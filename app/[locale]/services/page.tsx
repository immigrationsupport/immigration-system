import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight, Briefcase, GraduationCap, Home, FileText, Building, MessageSquare } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ServicesPage() {
  const t = await getTranslations("services");
  const locale = await getLocale();

  const svcs = [
    { icon: <Briefcase className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: t("workVisa.title"), desc: t("workVisa.description"), key: "workVisa" },
    { icon: <GraduationCap className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: t("studentVisa.title"), desc: t("studentVisa.description"), key: "studentVisa" },
    { icon: <Home className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: t("permanentResidency.title"), desc: t("permanentResidency.description"), key: "permanentResidency" },
    { icon: <FileText className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: t("citizenship.title"), desc: t("citizenship.description"), key: "citizenship" },
    { icon: <Building className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: t("businessImmigration.title"), desc: t("businessImmigration.description"), key: "businessImmigration" },
    { icon: <MessageSquare className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.8}/>, title: t("customCaseReview.title"), desc: t("customCaseReview.description"), custom: true, key: "customCaseReview" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar/>
      <main className="flex-grow">
        <div className="relative h-[260px] flex items-center overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80" alt="services" fill className="object-cover"/>
          <div className="absolute inset-0 bg-[#0f1f4b]/80"/>
          <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
            <p className="text-[12px] font-bold text-[#93b4ff] tracking-[2.5px] uppercase mb-3">
              {locale === "en" ? "What We Do" : "Ce que nous faisons"}
            </p>
            <h1 className="text-[50px] font-extrabold text-white" style={{fontFamily:"Georgia,serif"}}>{t("pageTitle")}</h1>
            <p className="text-white/60 text-[16px] mt-2">{t("pageSubtitle")}</p>
          </div>
        </div>
        <section className="py-20 px-8 bg-[#f8f9ff]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {svcs.map(({icon,title,desc,custom,key}) => (
              <div key={title} className={`rounded-2xl p-8 border transition-all hover:-translate-y-1.5 cursor-pointer group ${custom?"bg-gradient-to-br from-[#1E3A8A] to-[#2d54c5] border-transparent":"bg-white border-[#eef0f8] hover:shadow-xl hover:shadow-blue-900/10 hover:border-[#c7d2fe]"}`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${custom?"bg-white/15":"bg-[#EEF2FF]"}`}>{custom?<MessageSquare className="w-6 h-6 text-white" strokeWidth={1.8}/>:icon}</div>
                <h3 className={`text-[18px] font-extrabold mb-3 ${custom?"text-white":"text-[#0f1f4b]"}`}>{title}</h3>
                <p className={`text-[14px] leading-[1.75] mb-5 ${custom?"text-white/75":"text-slate-400"}`}>{desc}</p>
                <Link href={custom?"/contact":"/sign-up"} className={`inline-flex items-center gap-1.5 text-[13px] font-bold group-hover:gap-3 transition-all ${custom?"text-white":"text-[#1E3A8A]"}`}>
                  {custom ? t("customCaseReview.contactUs") : t(`${key}.startApplication` as any)} <ArrowRight className="w-3.5 h-3.5"/>
                </Link>
              </div>
            ))}
          </div>
        </section>
        <div className="relative py-16 px-8">
          <Image src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80" alt="cta" fill className="object-cover"/>
          <div className="absolute inset-0 bg-[#0a1946]/82"/>
          <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <p className="text-[34px] font-extrabold text-white leading-[1.25]" style={{fontFamily:"Georgia,serif"}}>
              {locale === "en" ? (
                <>Not sure which service fits?<br/><span className="font-normal text-white/80">Talk to us — it&apos;s free.</span></>
              ) : (
                <>Vous ne savez pas quel service vous convient ?<br/><span className="font-normal text-white/80">Parlez-nous — c&apos;est gratuit.</span></>
              )}
            </p>
            <Link href="/contact" className="flex-shrink-0 px-8 py-4 bg-white text-[#1E3A8A] text-[14px] font-extrabold rounded-lg hover:bg-[#EEF2FF] transition-all">
              {locale === "en" ? "Book Free Consultation" : "Réserver une consultation gratuite"}
            </Link>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
