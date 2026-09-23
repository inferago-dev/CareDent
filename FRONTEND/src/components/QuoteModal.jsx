import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2, ArrowUpRight, Phone } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import useCatalogue from '../hooks/useCatalogue';
import useMountedTransition from '../hooks/useMountedTransition';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import { publicApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
import { Field, FieldRow, FormError, SelectField } from './form';
import { trackLead } from '../lib/analytics';

const EMPTY = {
  product: '', quantity: 1, clinicName: '', name: '', phone: '', email: '', address: '', notes: '',
};

export default function QuoteModal({ isOpen, onClose, initialProduct = '' }) {
  const { user } = useAuth();
  const { chairs, equipment } = useCatalogue();
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const shouldRender = useMountedTransition(isOpen, 200);

  const handleClose = useCallback(() => {
    onClose();
    // Reset only after the exit animation, so the form does not flash empty.
    setTimeout(() => {
      setSubmitted(null);
      setForm(EMPTY);
      setError(null);
      setFieldErrors({});
    }, 220);
  }, [onClose]);

  // Escape closes the dialog, as every other overlay on the site already does.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  useBodyScrollLock(isOpen);

  /**
   * Prefill from the product the visitor clicked and from their account.
   *
   * Adjusted during render rather than in an effect: an effect renders the
   * blank form, commits it, then renders again filled, which is a visible
   * flash on a slow phone. React discards an in-progress render when state
   * changes during it, so this only ever paints once.
   *
   * The key covers both triggers - reopening the modal on a different product,
   * and the account arriving after the modal is already open.
   */
  const prefillKey = isOpen ? `${initialProduct}|${user?.id ?? ''}` : null;
  const [prefilledFor, setPrefilledFor] = useState(null);

  if (prefillKey !== prefilledFor) {
    setPrefilledFor(prefillKey);
    if (prefillKey) {
      setForm((prev) => ({
        ...prev,
        product: initialProduct || prev.product || 'Gamma Premium',
        name: prev.name || user?.name || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || user?.phone || '',
        clinicName: prev.clinicName || user?.clinicName || '',
        address: prev.address || user?.address || '',
      }));
      setError(null);
      setFieldErrors({});
    }
  }

  if (!shouldRender) return null;

  // Same grouping the native <optgroup>s used to give.
  const productOptions = [
    ...chairs.map((c) => ({ value: c.name, label: c.name, group: 'Dental Chairs' })),
    ...equipment.map((p) => ({ value: p.name, label: p.name, group: 'Other Equipment' })),
    ...['Pre-Installation Site Assessment', 'Complete Clinic Setup'].map((s) => ({ value: s, label: s, group: 'Services' })),
  ];

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: key === 'quantity' ? Number(e.target.value) : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await publicApi.requestQuote({
        name: form.name.trim(),
        clinicName: form.clinicName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        product: form.product,
        quantity: form.quantity,
        notes: form.notes.trim(),
      });
      setSubmitted(res.data.reference);
      trackLead('quote_request', {
        product: form.product,
        quantity: form.quantity,
        reference: res.data.reference,
      });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div
      className={`fixed inset-0 z-50 bg-blue-950/60 backdrop-blur-md flex items-center justify-center p-4 ${isOpen ? 'animate-fade-in' : 'animate-fade-out'}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Request a quotation"
    >
      <div className={`bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] ${isOpen ? 'animate-scale-in' : 'animate-scale-out'}`}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-7 pt-7 pb-6 sm:px-9 border-b border-slate-200 shrink-0">
          <div>
            <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-3 font-bold">
              Request a Quotation
            </span>
            <h3 className="text-2xl sm:text-3xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
              {submitted ? 'Request received' : 'Get pricing for your clinic'}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Delivery &amp; certified installation all over Tamil Nadu.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:text-blue-950 hover:bg-slate-50 flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 sm:p-10 text-center space-y-6 overflow-y-auto animate-pop-in">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-cyan-600" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl sm:text-3xl tracking-tighter font-medium text-blue-950">Thank you, Doctor.</h4>
              <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
                {COMPANY_DETAILS.founder} and our sales engineering team will reach out within
                24 hours with exact pricing, tax breakup and delivery lead time.
              </p>
            </div>
            <div className="inline-block bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
              <div className="text-xs uppercase tracking-widest text-slate-400">Reference code</div>
              <div className="text-xl font-mono font-medium text-blue-950 mt-1">{submitted}</div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/track-order"
                onClick={handleClose}
                className="group inline-flex items-center gap-3 rounded-full bg-blue-950 hover:bg-blue-900 text-white font-medium text-sm py-1.5 pl-6 pr-1.5 transition-all active:scale-[0.98]"
              >
                <span>Track this request</span>
                <span className="w-8 h-8 rounded-full bg-white text-blue-950 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </Link>
              <button
                onClick={handleClose}
                className="inline-flex items-center rounded-full border border-slate-200 hover:border-cyan-300 hover:bg-slate-50 text-slate-700 font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
              >
                Continue browsing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">

            {/* Fields scroll; the footer with the submit button stays in view. */}
            <div className="flex-1 min-h-0 overflow-y-auto px-7 py-7 sm:px-9 space-y-5">
              <FormError message={error} />

              {/* Product & quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <SelectField
                    label="Selected Equipment" required
                    value={form.product}
                    onChange={(val) => setForm((f) => ({ ...f, product: val }))}
                    options={productOptions}
                    disabled={submitting} error={fieldErrors.product}
                  />
                </div>
                <Field
                  label="Quantity" required type="number" min="1" max="99"
                  value={form.quantity} onChange={set('quantity')}
                  disabled={submitting} error={fieldErrors.quantity}
                />
              </div>

              <FieldRow>
                <Field label="Your Name" required type="text" placeholder="Dr. Sivakumar" autoComplete="name"
                       value={form.name} onChange={set('name')} disabled={submitting} error={fieldErrors.name} />
                <Field label="Clinic Name" type="text" placeholder="Care Dental Clinic" autoComplete="organization"
                       value={form.clinicName} onChange={set('clinicName')} disabled={submitting} error={fieldErrors.clinicName} />
                <Field label="Phone" required type="tel" placeholder="+91 94441 53599" autoComplete="tel"
                       value={form.phone} onChange={set('phone')} disabled={submitting} error={fieldErrors.phone} />
                <Field label="Email" required type="email" placeholder="doctor@clinic.com" autoComplete="email"
                       value={form.email} onChange={set('email')} disabled={submitting} error={fieldErrors.email} />
              </FieldRow>

              <Field label="Installation Address" type="text" autoComplete="street-address"
                     placeholder="Street address, City, Pincode (e.g. Mugalivakkam, Chennai)"
                     value={form.address} onChange={set('address')} disabled={submitting} error={fieldErrors.address} />

              <Field label="Additional Requirements" as="textarea" rows={3}
                     placeholder="Custom color, compressor requirement, room dimensions..."
                     value={form.notes} onChange={set('notes')} disabled={submitting} error={fieldErrors.notes} />
            </div>

            {/* Footer — the same call-link + navy pill pairing as the Contact form */}
            <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 px-7 py-5 sm:px-9 border-t border-slate-200 bg-slate-50">
              <a href={COMPANY_DETAILS.phoneHrefs[0]} className="group inline-flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 group-hover:bg-cyan-600 group-hover:border-cyan-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Phone className="w-4 h-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-xs text-slate-400">Prefer to talk? Call us</span>
                  <span className="block text-sm text-blue-950 group-hover:text-cyan-700 transition-colors">{COMPANY_DETAILS.phoneNumbers[0]}</span>
                </span>
              </a>

              <button
                type="submit"
                disabled={submitting}
                className="group self-end sm:self-auto inline-flex items-center gap-3 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm py-1.5 pl-6 pr-1.5 rounded-full transition-all active:scale-[0.98]"
              >
                <span>{submitting ? 'Sending…' : 'Request quotation'}</span>
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
  );
}
