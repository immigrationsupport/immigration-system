import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { CheckCircle, Users, Globe, Award } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = await getLocale();

  const checks = locale === "en"
    ? ["Certified Consultants", "Confidential & Secure", "Fast Processing", "50+ Countries", "Legal Strategists", "Former Consulate Officers"]
    : ["Consultants certifiés", "Sécurisé et confidentiel", "Traitement rapide", "Plus de 50 pays", "Stratèges juridiques", "Anciens agents consulaires"];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        {/* Header */}
        <div className="relative h-[260px] flex items-center overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=1600&q=80" alt="about" fill className="object-cover"/>
          <div className="absolute inset-0 bg-[#0f1f4b]/80"/>
          <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
            <p className="text-[12px] font-bold text-[#93b4ff] tracking-[2.5px] uppercase mb-3">
              {locale === "en" ? "Who We Are" : "Qui nous sommes"}
            </p>
            <h1 className="text-[50px] font-extrabold text-white" style={{fontFamily:"Georgia,serif"}}>{t("pageTitle")}</h1>
            <p className="text-white/60 text-[16px] mt-2">{t("pageSubtitle")}</p>
          </div>
        </div>

        {/* Mission + About */}
        <section className="py-20 px-8 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-[12px] font-bold text-[#1E3A8A] tracking-[2.5px] uppercase mb-3">
                {locale === "en" ? "Our Mission" : "Notre Mission"}
              </p>
              <h2 className="text-[36px] font-extrabold text-[#0f1f4b] mb-5" style={{fontFamily:"Georgia,serif"}}>{t("missionTitle")}</h2>
              <p className="text-[15px] text-slate-500 leading-[1.85] mb-4">{t("missionText1")}</p>
              <p className="text-[15px] text-slate-500 leading-[1.85]">{t("missionText2")}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#1E3A8A] tracking-[2.5px] uppercase mb-3">
                {locale === "en" ? "Our Team" : "Notre Équipe"}
              </p>
              <h2 className="text-[36px] font-extrabold text-[#0f1f4b] mb-5" style={{fontFamily:"Georgia,serif"}}>{t("consultantsTitle")}</h2>
              <p className="text-[15px] text-slate-500 leading-[1.85] mb-6">{t("consultantsText")}</p>
              <div className="grid grid-cols-2 gap-3">
                {checks.map(c => (
                  <div key={c} className="flex items-center gap-2 text-[14px] font-semibold text-slate-700">
                    <CheckCircle className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" strokeWidth={2.5}/>{c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-8 bg-[#1E3A8A]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10">
              {[
                {icon:<Award className="w-7 h-7 text-white/70" strokeWidth={1.5}/>, num:"5+", label:t("yearsOfExperience")},
                {icon:<Globe className="w-7 h-7 text-white/70" strokeWidth={1.5}/>, num:"1,250+", label:t("applicationsProcessed")},
                {icon:<Users className="w-7 h-7 text-white/70" strokeWidth={1.5}/>, num:"88.4%", label:t("successRate")},
              ].map(({icon,num,label},i) => (
                <div key={label} className={`text-center py-12 ${i>0?"border-l border-white/10":""}`}>
                  <div className="flex justify-center mb-3">{icon}</div>
                  <div className="text-[52px] font-extrabold text-white leading-none mb-2" style={{fontFamily:"Georgia,serif"}}>{num}</div>
                  <div className="text-[13px] text-white/50 tracking-widest uppercase">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
