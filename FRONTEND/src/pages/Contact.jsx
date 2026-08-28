import { useState } from 'react';

import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Stethoscope, ArrowUpRight } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import { publicApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
import { Field, FieldRow, FormError } from '../components/form';
import usePrefillFromUser from '../hooks/usePrefillFromUser';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { breadcrumbSchema } from '../lib/seo';
import { metaFor } from '../lib/pageMeta';

// Google's keyless embed and directions endpoints, both built from the one
// address in COMPANY_DETAILS so the map can never drift from the NAP details
// the rest of the site (and the LocalBusiness markup) publishes.
const MAP_QUERY = encodeURIComponent(`Care Dent, ${COMPANY_DETAILS.address}`);
const MAP_EMBED_URL = `https://maps.google.com/maps?q=${MAP_QUERY}&output=embed`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

// Declared once: the same array feeds the visible breadcrumb and the
// BreadcrumbList markup, so the two can never disagree.
const BREADCRUMB_TRAIL = [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }];

const EMPTY = { name: '', email: '', phone: '', subject: 'Equipment Inquiry', message: '' };

export default function Contact() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(EMPTY);

  usePrefillFromUser(user, (u) =>
    setForm((f) => ({
      ...f,
      name: f.name || u.name || '',
      email: f.email || u.email || '',
      phone: f.phone || u.phone || '',
    }))
  );

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await publicApi.sendMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
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
      <Seo
        {...metaFor('/contact')}
        schema={breadcrumbSchema(BREADCRUMB_TRAIL)}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative container-page max-w-4xl text-center">
          <Breadcrumbs trail={BREADCRUMB_TRAIL} align="center" />
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

      <div className="container-page max-w-7xl space-y-12 section-y">
        
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

            {/*
              This was an Unsplash photograph of an unrelated street, dimmed and
              captioned "Showroom Location Map" - it showed a visitor nothing
              about where Care Dent actually is, and it was the page's only
              third-party request. Replaced with the real map, plus a directions
              link for anyone whose browser blocks the frame.
            */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  <span>Showroom location</span>
                </div>
                <a
                  href={MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition-colors shrink-0"
                >
                  Get directions
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <iframe
                title="Care Dent showroom on the map"
                src={MAP_EMBED_URL}
                className="w-full h-56 rounded-2xl border border-slate-200"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <p className="text-[11px] text-slate-500 leading-snug">
                {COMPANY_DETAILS.address}
              </p>
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
                    Thank you, {form.name}. We have received your inquiry and will reply to <strong>{form.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm((f) => ({ ...f, subject: EMPTY.subject, message: '' })); }}
                    className="bg-cyan-600 text-white font-semibold text-xs px-6 py-2.5 rounded-full shadow transition-all active:scale-[0.98]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-4 animate-fade-in">

                  <FormError message={error} />

                  <FieldRow>
                    <Field
                      label="Your Name" required type="text" placeholder="Dr. Sivakumar"
                      value={form.name} onChange={set('name')}
                      disabled={submitting} error={fieldErrors.name} autoComplete="name"
                    />
                    <Field
                      label="Email Address" required type="email" placeholder="doctor@clinic.com"
                      value={form.email} onChange={set('email')}
                      disabled={submitting} error={fieldErrors.email} autoComplete="email"
                    />
                  </FieldRow>

                  <FieldRow>
                    <Field
                      label="Phone Number" required type="tel" placeholder="+91 94441 53599"
                      value={form.phone} onChange={set('phone')}
                      disabled={submitting} error={fieldErrors.phone} autoComplete="tel"
                    />
                    <Field
                      label="Subject" as="select" required
                      value={form.subject} onChange={set('subject')}
                      disabled={submitting} error={fieldErrors.subject}
                    >
                      <option value="Equipment Inquiry">New Chair / Equipment Inquiry</option>
                      <option value="Service Maintenance">Maintenance / Service Visit</option>
                      <option value="Spare Parts">Spare Parts &amp; Handpieces</option>
                      <option value="Other">General Question</option>
                    </Field>
                  </FieldRow>

                  <Field
                    label="Your Message" as="textarea" required rows={5}
                    placeholder="Write your query here..."
                    value={form.message} onChange={set('message')}
                    disabled={submitting} error={fieldErrors.message}
                  />

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
