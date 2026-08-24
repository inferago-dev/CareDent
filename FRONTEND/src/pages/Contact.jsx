import React, { useState, useEffect } from 'react';

import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Stethoscope, AlertCircle } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import { publicApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, FieldError } from '../components/ui';

export default function Contact() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Equipment Inquiry',
    message: ''
  });

  // Prefill for signed-in customers.
  useEffect(() => {
    if (!user) return;
    setFormData((f) => ({
      ...f,
      name: f.name || user.name || '',
      email: f.email || user.email || '',
      phone: f.phone || user.phone || '',
    }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await publicApi.sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24 sm:py-32">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6">
            GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1] text-white mb-6">
            Contact Care Dent
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            Reach out to Mr. Sivakumar and our sales/support team in Mugalivakkam, Chennai.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-16">
        
        {/* 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Contact Information & Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-blue-950 text-white rounded-3xl p-8 shadow-xl space-y-6 border border-white/10">

              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Care Dent Headquarters</h3>
                  <p className="text-xs text-cyan-400">Founder: Mr. Sivakumar</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                  <div>
                    <strong className="text-white block">Address</strong>
                    <span>{COMPANY_DETAILS.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                  <div>
                    <strong className="text-white block">Phone Numbers</strong>
                    <div className="space-y-0.5">
                      <a href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`} className="hover:text-cyan-400 block font-mono">
                        {COMPANY_DETAILS.phoneNumbers[0]}
                      </a>
                      <a href={`tel:${COMPANY_DETAILS.phoneNumbers[1]}`} className="hover:text-cyan-400 block font-mono text-xs text-slate-400">
                        {COMPANY_DETAILS.phoneNumbers[1]}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                  <div>
                    <strong className="text-white block">Email</strong>
                    <a href={`mailto:${COMPANY_DETAILS.email}`} className="hover:text-cyan-400 font-mono">
                      {COMPANY_DETAILS.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                  <div>
                    <strong className="text-white block">Business Hours</strong>
                    <span>{COMPANY_DETAILS.workingHours}</span>
                  </div>
                </div>

              </div>

              {/* Direct WhatsApp Button */}
              <div className="pt-4 border-t border-white/10">
                <a
                  href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Instant WhatsApp Chat</span>
                </a>
              </div>

            </div>

            {/* Google Map Mockup Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span>Showroom Location Map</span>
              </div>
              <div className="w-full h-48 bg-slate-200 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-300">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                  alt="Mugalivakkam Location Map"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center p-4 text-center">
                  <div className="bg-white text-slate-900 p-3 rounded-xl shadow-lg border border-slate-200">
                    <div className="font-bold text-xs">Care Dent Showroom</div>
                    <div className="text-[10px] text-slate-500">Mugalivakkam, Chennai - 600 125</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
              
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">Send Us a Direct Message</h3>
                <p className="text-xs text-slate-500 mt-1">Have a question about pricing, delivery timeline, or spare parts? Drop us a line.</p>
              </div>

              {submitted ? (
                <div key="success" className="p-8 text-center space-y-4 animate-pop-in">
                  <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-semibold text-slate-900">Message Received!</h4>
                  <p className="text-sm text-slate-600">
                    Thank you, {formData.name}. We have received your inquiry and will reply to <strong>{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData((f) => ({ ...f, subject: 'Equipment Inquiry', message: '' })); }}
                    className="bg-cyan-600 text-white font-semibold text-xs px-6 py-2.5 rounded-full shadow transition-all active:scale-[0.98]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-4 animate-fade-in">

                  {error && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Sivakumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-60"
                      />
                      <FieldError message={fieldErrors.name} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="doctor@clinic.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-60"
                      />
                      <FieldError message={fieldErrors.email} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 94441 53599"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-60"
                      />
                      <FieldError message={fieldErrors.phone} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase">Subject *</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-60"
                      >
                        <option value="Equipment Inquiry">New Chair / Equipment Inquiry</option>
                        <option value="Service Maintenance">Maintenance / Service Visit</option>
                        <option value="Spare Parts">Spare Parts & Handpieces</option>
                        <option value="Other">General Question</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Your Message *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your query here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      disabled={submitting}
                        className="w-full px-4 py-3 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-60 resize-none"
                    />
                    <FieldError message={fieldErrors.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all text-base active:scale-[0.98]"
                  >
                    {submitting ? (
                      <><Spinner className="w-5 h-5 text-white" /><span>Sending…</span></>
                    ) : (
                      <><Send className="w-5 h-5" /><span>Send Inquiry Message</span></>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
