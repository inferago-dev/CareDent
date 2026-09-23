import { useState } from 'react';

import { MapPin, Phone, Mail, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { COMPANY_DETAILS } from '../data/products';
import { publicApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
import { Field, FieldRow, FormError, SelectField } from '../components/form';
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

const SUBJECT_OPTIONS = [
  { value: 'Equipment Inquiry', label: 'New Chair / Equipment Inquiry' },
  { value: 'Service Maintenance', label: 'Maintenance / Service Visit' },
  { value: 'Spare Parts', label: 'Spare Parts & Handpieces' },
  { value: 'Other', label: 'General Question' },
];

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
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px] pointer-events-none translate-y-1/3" />
        <div className="relative container-page max-w-4xl text-center">
          <Breadcrumbs trail={BREADCRUMB_TRAIL} align="center" />
          <Reveal>
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Contact Care Dent
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              Let&apos;s talk about your clinic
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mt-6">
              Reach out to Mr. Sivakumar and our team in Mugalivakkam, Chennai.
              We typically respond within a few hours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="container-page max-w-7xl section-y">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Contact info card */}
            <Reveal variant="left" x={30}>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-7 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <img src="/Logo_Badge.png" alt="Care Dent" className="w-10 h-10 object-contain shrink-0" />
                    <div>
                      <h3 className="font-medium tracking-tight text-slate-900">Care Dent</h3>
                      <p className="text-xs text-slate-500 tracking-tight">Founded by Mr. Sivakumar</p>
                    </div>
                  </div>

                  {/* Contact items */}
                  <div className="space-y-2">
                    {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }, i) => (
                      <Reveal key={label} delay={80 + i * 60} y={12}>
                        <div className="flex items-center gap-3.5 group bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-cyan-200 hover:bg-white transition-all duration-300">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-cyan-50 group-hover:border-cyan-200 transition-colors duration-200">
                            <Icon className="w-4 h-4 text-slate-600 group-hover:text-cyan-600 transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                            {href ? (
                              <a href={href} className="text-sm tracking-tight text-slate-700 hover:text-cyan-600 transition-colors leading-snug break-all">
                                {value}
                              </a>
                            ) : (
                              <p className="text-sm tracking-tight text-slate-700 leading-snug">{value}</p>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  {/* WhatsApp CTA */}
                  <Reveal delay={320} y={10}>
                    <a
                      href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group w-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 font-medium text-sm p-1.5 rounded-full flex items-center gap-3 transition-all active:scale-[0.98]"
                    >
                      <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <FaWhatsapp className="w-5 h-5" />
                      </span>
                      <span>Chat on WhatsApp</span>
                      <span className="ml-auto w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </a>
                  </Reveal>
                </div>
              </div>
            </Reveal>

            {/* Map card */}
            <Reveal delay={120} y={20}>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    Showroom location
                  </div>
                  <a
                    href={MAP_DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium tracking-tight text-slate-700 bg-white border border-slate-200 hover:border-cyan-300 hover:text-cyan-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Get directions
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <iframe
                  title="Care Dent showroom on the map"
                  src={MAP_EMBED_URL}
                  className="w-full h-52"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <p className="text-xs text-slate-500 leading-snug px-5 py-3.5">
                  {COMPANY_DETAILS.address}
                </p>
              </div>
            </Reveal>

          </div>

          {/* ── RIGHT COLUMN: Form ───────────────────────────── */}
          <div className="lg:col-span-7">
            <Reveal variant="right" x={30}>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-7 sm:p-9 space-y-7">

                  {/* Form header */}
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
                      Send us a message
                    </h2>
                    <p className="text-slate-500 leading-relaxed">
                      Questions about pricing, delivery, or spare parts? We reply within a few hours.
                    </p>
                  </div>

                  <div className="border-t border-slate-200" />

                  {submitted ? (
                    <div key="success" className="py-12 text-center space-y-5 animate-pop-in">
                      <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-cyan-600" />
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
                        className="inline-flex items-center gap-2 bg-blue-950 hover:bg-blue-900 text-white text-sm font-medium px-6 py-3 rounded-full transition-all active:scale-[0.98]"
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
                        <SelectField
                          label="Subject" required
                          value={form.subject}
                          onChange={(val) => setForm((f) => ({ ...f, subject: val }))}
                          options={SUBJECT_OPTIONS}
                          disabled={submitting} error={fieldErrors.subject}
                        />
                      </FieldRow>

                      <Field
                        label="Your Message" as="textarea" required rows={5}
                        placeholder="Tell us about your clinic, the equipment you need, or the issue you're facing…"
                        value={form.message} onChange={set('message')}
                        disabled={submitting} error={fieldErrors.message}
                      />

                      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-slate-200">
                        <a
                          href={COMPANY_DETAILS.phoneHrefs[0]}
                          className="group inline-flex items-center gap-3"
                        >
                          <span className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 group-hover:bg-cyan-600 group-hover:border-cyan-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                            <Phone className="w-4 h-4" />
                          </span>
                          <span className="leading-tight">
                            <span className="block text-xs text-slate-400 tracking-tight">Prefer to talk? Call us</span>
                            <span className="block text-sm font-medium tracking-tight text-blue-950 group-hover:text-cyan-700 transition-colors">{COMPANY_DETAILS.phoneNumbers[0]}</span>
                          </span>
                        </a>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="group self-end sm:self-auto inline-flex items-center gap-3 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm py-1.5 pl-6 pr-1.5 rounded-full transition-all active:scale-[0.98]"
                        >
                          <span>{submitting ? 'Sending…' : 'Send Inquiry'}</span>
                          <span className="w-8 h-8 rounded-full bg-white text-blue-950 flex items-center justify-center">
                            {submitting ? (
                              <Spinner className="w-4 h-4 text-blue-950" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            )}
                          </span>
                        </button>
                      </div>

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
