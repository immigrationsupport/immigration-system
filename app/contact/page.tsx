"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";
import { contactAction } from "@/lib/resend";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", message: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.id]: e.target.value });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(null);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("message", form.message);
      
      const res = await contactAction(formData);
      if (res.error) throw new Error(res.error);
      
      setSubmitted(true); 
      setForm({ fullName: "", email: "", phone: "", message: "" });
    } catch (err: any) { 
      setError(err.message || "Failed to send. Try again."); 
    } finally { 
      setSubmitting(false); 
    }
  };
  const inp = "w-full px-4 py-3.5 border border-slate-200 bg-slate-50 rounded-xl text-[14px] text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all";
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="relative h-[260px] flex items-center overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80" alt="contact" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#0f1f4b]/80" />
          <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
            <p className="text-[12px] font-bold text-[#93b4ff] tracking-[2.5px] uppercase mb-3">Get In Touch</p>
            <p className="text-[50px] font-extrabold text-white" style={{ fontFamily: "Georgia,serif" }}>Contact Us</p>
            <p className="text-white/60 text-[16px] mt-2">Connect with our certified officers to schedule a consultation.</p>
          </div>
        </div>

        <section className="py-20 px-8 bg-[#f8f9ff]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#eef0f8] p-10 shadow-sm">
              <h2 className="text-[28px] font-extrabold text-[#0f1f4b] mb-7" style={{ fontFamily: "Georgia,serif" }}>Send Us a Message</h2>
              {submitted ? (
                <div className="flex flex-col items-start gap-4 p-8 rounded-xl bg-green-50 border border-green-200">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <p className="text-[18px] font-bold text-green-800">Inquiry Received!</p>
                  <p className="text-[14px] text-green-700 leading-relaxed">Your message was sent. A representative will contact you within 24–48 business hours.</p>
                  <button onClick={() => setSubmitted(false)} className="text-[#1E3A8A] text-[13px] font-bold hover:underline mt-1">Submit another →</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="bg-red-100 p-2 rounded-xl text-red-600 shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[14px] font-bold text-red-900 leading-none">Transmission Error</p>
                        <p className="text-[13px] text-red-700/80 leading-relaxed">
                          {error.includes("emilieag573@gmail.com") ? (
                            <>
                              Failed to send message. Please email us directly at{" "}
                              <a href="mailto:emilieag573@gmail.com" className="font-bold underline hover:text-red-900 transition-colors">
                                emilieag573@gmail.com
                              </a>
                            </>
                          ) : (
                            error
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="fullName" className="block text-[12px] font-bold text-slate-600 uppercase tracking-[1px] mb-2">Legal Full Name</label>
                    <input type="text" id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required maxLength={50} className={inp} placeholder="Enter your full name" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="email" className="block text-[12px] font-bold text-slate-600 uppercase tracking-[1px] mb-2">Email Address</label>
                      <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required maxLength={50} className={inp} placeholder="Enter your email" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-[12px] font-bold text-slate-600 uppercase tracking-[1px] mb-2">Phone Number</label>
                      <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} className={inp} placeholder="Enter your phone number" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-[12px] font-bold text-slate-600 uppercase tracking-[1px] mb-2">Inquiry Details</label>
                    <textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={5} minLength={50} maxLength={1000} className={`${inp} resize-none`} placeholder="Describe your immigration needs..." />
                  </div>
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1E3A8A] text-white text-[14px] font-bold rounded-xl hover:bg-[#1630a0] transition-colors disabled:opacity-60 shadow-lg shadow-blue-900/20">
                    {submitting ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
            {/* Info */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="bg-[#1E3A8A] rounded-2xl p-8 text-white">
                <h3 className="text-[18px] font-extrabold mb-6 pb-4 border-b border-white/10" style={{ fontFamily: "Georgia,serif" }}>Our Office</h3>
                <div className="space-y-5">
                  {[
                    { icon: <MapPin className="w-4 h-4 text-white/50" strokeWidth={2} />, label: "Address", val: "Bonamoussadi, carrefour maison blanche\nDouala, Cameroun" },
                    { icon: <Phone className="w-4 h-4 text-white/50" strokeWidth={2} />, label: "Phone", val: "+237 680 703 365", href: "tel:+237680703365" },
                    { icon: <Mail className="w-4 h-4 text-white/50" strokeWidth={2} />, label: "Email", val: "emilieag573@gmail.com", href: "mailto:emilieag573@gmail.com" },
                  ].map(({ icon, label, val, href }) => (
                    <div key={label} className="flex gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
                      <div>
                        <div className="text-[10px] font-bold tracking-[2px] uppercase text-white/40 mb-1">{label}</div>
                        {href ? <a href={href} className="text-[13px] text-white/65 hover:text-white transition-colors whitespace-pre-line">{val}</a> : <p className="text-[13px] text-white/65 whitespace-pre-line leading-relaxed">{val}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#eef0f8] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-[#1E3A8A]" strokeWidth={2} /></div>
                  <h4 className="font-extrabold text-[#0f1f4b] text-[15px]">Operating Hours</h4>
                </div>
                <div className="space-y-2.5 text-[13px]">
                  {[{ d: "Monday – Friday", h: "8:00 AM – 6:00 PM" }, { d: "Saturday", h: "9:00 AM – 1:00 PM" }, { d: "Sunday", h: "Closed" }].map(({ d, h }) => (
                    <div key={d} className="flex justify-between">
                      <span className="text-slate-500">{d}</span>
                      <span className={h === "Closed" ? "text-slate-300" : "font-bold text-[#0f1f4b]"}>{h}</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-300 pt-1">West Africa Time (WAT)</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
