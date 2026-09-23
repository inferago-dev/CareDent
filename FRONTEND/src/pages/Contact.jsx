import { useState } from 'react';

import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Stethoscope, ArrowUpRight, Sparkles } from 'lucide-react';
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
import { trackLead } from '../lib/analytics';
import Reveal from '../components/Reveal';

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

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    label: 'Address',
    value: COMPANY_DETAILS.address,
    href: null,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: COMPANY_DETAILS.phoneNumbers[0],
    href: COMPANY_DETAILS.phoneHrefs[0],
  },
  {
    icon: Mail,
    label: 'Email',
    value: COMPANY_DETAILS.email,
    href: `mailto:${COMPANY_DETAILS.email}`,
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: COMPANY_DETAILS.workingHours,
    href: null,
  },
];

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
      trackLead('contact_message', {
        subject: form.subject,
      });
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

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">

        {/* Concentric circles */}
        <svg
          className="absolute -right-48 top-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-60 mask-[linear-gradient(to_right,transparent,black_40%)]"
          viewBox="0 0 700 700" fill="none"
        >
          {[60, 110, 160, 210, 260, 310, 360, 410, 460].map((r, i) => (
            <circle key={r} cx="350" cy="350" r={r}
              stroke="white" strokeOpacity={0.12 - i * 0.01} strokeWidth="1" />
          ))}
        </svg>

        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px] pointer-events-none translate-y-1/3" />

        <div className="relative container-page max-w-4xl text-center">
          <Breadcrumbs trail={BREADCRUMB_TRAIL} align="center" />

          <div style={{ animation: 'fade-in 500ms cubic-bezier(0.22,1,0.36,1) 100ms both' }}>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Get In Touch
            </span>
          </div>

          <h1
            style={{ animation: 'hero-rise 900ms cubic-bezier(0.22,1,0.36,1) 180ms both' }}
            className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1] text-white mb-6"
          >
            Let&apos;s talk about your clinic
          </h1>

          <p
            style={{ animation: 'fade-in 700ms cubic-bezier(0.22,1,0.36,1) 320ms both' }}
            className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto tracking-tight"
          >
            Reach out to Mr. Sivakumar and our team in Mugalivakkam, Chennai.
            We typically respond within a few hours.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="container-page max-w-7xl section-y">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Contact info card */}
            <Reveal variant="left" x={30}>
              <div className="relative bg-blue-950 text-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/20">

                {/* Decorative circles inside card */}
                <svg
                  className="absolute -right-20 -top-20 w-[280px] h-[280px] pointer-events-none"
                  viewBox="0 0 300 300" fill="none"
                >
                  {[40, 80, 120, 160, 200].map((r, i) => (
                    <circle key={r} cx="150" cy="150" r={r}
                      stroke="white" strokeOpacity={0.08 - i * 0.01} strokeWidth="1" />
                  ))}
                </svg>

                {/* Glow accent */}
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 p-8 space-y-8">

                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white tracking-tight">Care Dent</h3>
                      <p className="text-xs text-cyan-400 tracking-wide">Founded by Mr. Sivakumar</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Contact items */}
                  <div className="space-y-6">
                    {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }, i) => (
                      <Reveal key={label} delay={80 + i * 70} y={16}>
                        <div className="flex items-start gap-4 group">
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/30 transition-all duration-300">
                            <Icon className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">{label}</p>
                            {href ? (
                              <a href={href} className="text-sm text-slate-200 hover:text-cyan-300 transition-colors leading-snug break-all">
                                {value}
                              </a>
                            ) : (
                              <p className="text-sm text-slate-200 leading-snug">{value}</p>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* WhatsApp CTA */}
                  <Reveal delay={360} y={12}>
                    <a
                      href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                    >
                      <MessageSquare className="w-5 h-5 fill-current" />
                      <span className="tracking-tight">Chat on WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity ml-auto" />
                    </a>
                  </Reveal>

                </div>
              </div>
            </Reveal>

            {/* Map card */}
            <Reveal delay={120} y={24}>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-blue-950" />
                    </div>
                    Showroom location
                  </div>
                  <a
                    href={MAP_DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
                  >
                    Get directions
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <iframe
                  title="Care Dent showroom on the map"
                  src={MAP_EMBED_URL}
                  className="w-full h-56"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />

                <p className="text-[11px] text-slate-400 leading-snug px-5 py-3">
                  {COMPANY_DETAILS.address}
                </p>
              </div>
            </Reveal>

          </div>

          {/* ── RIGHT COLUMN: Form ───────────────────────────── */}
          <div className="lg:col-span-7">
            <Reveal variant="right" x={30}>
              <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden">

                {/* Top accent strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-950 via-cyan-500 to-blue-950" />

                <div className="p-8 sm:p-10 space-y-8">

                  {/* Form header */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">Enquiry Form</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-medium tracking-tighter text-blue-950">
                      Send us a message
                    </h2>
                    <p className="text-sm text-slate-500 tracking-tight leading-relaxed">
                      Questions about pricing, delivery, or spare parts? We reply within a few hours.
                    </p>
                  </div>

                  {submitted ? (
                    <div key="success" className="py-12 text-center space-y-5 animate-pop-in">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-10 h-10 text-cyan-500" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-medium tracking-tighter text-blue-950">Message received!</h4>
                        <p className="text-sm text-slate-500 mt-2 tracking-tight">
                          Thank you, <strong className="text-slate-700">{form.name}</strong>. We&apos;ll reply to{' '}
                          <strong className="text-slate-700">{form.email}</strong> shortly.
                        </p>
                      </div>
                      <button
                        onClick={() => { setSubmitted(false); setForm((f) => ({ ...f, subject: EMPTY.subject, message: '' })); }}
                        className="inline-flex items-center gap-2 bg-blue-950 hover:bg-blue-900 text-white text-sm font-semibold px-6 py-3 rounded-full transition-all tracking-tight"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form key="form" onSubmit={handleSubmit} className="space-y-5 animate-fade-in">

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
                        placeholder="Tell us about your clinic, the equipment you need, or the issue you're facing…"
                        value={form.message} onChange={set('message')}
                        disabled={submitting} error={fieldErrors.message}
                      />

                      <button
                        type="submit"
                        disabled={submitting}
                        className="group w-full bg-blue-950 hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-950/20 hover:shadow-blue-950/30 flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 text-sm tracking-tight active:scale-[0.99]"
                      >
                        {submitting ? (
                          <><Spinner className="w-5 h-5 text-white" /><span>Sending…</span></>
                        ) : (
                          <>
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            <span>Send Inquiry</span>
                            <ArrowUpRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-slate-400 text-center tracking-tight">
                        Or call us directly at{' '}
                        <a href={COMPANY_DETAILS.phoneHrefs[0]} className="text-blue-950 font-semibold hover:text-cyan-600 transition-colors">
                          {COMPANY_DETAILS.phoneNumbers[0]}
                        </a>
                      </p>

                    </form>
                  )}

                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </div>
  );
}
