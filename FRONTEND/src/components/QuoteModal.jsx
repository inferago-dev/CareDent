import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, Send, Stethoscope } from 'lucide-react';
import useCatalogue from '../hooks/useCatalogue';
import useMountedTransition from '../hooks/useMountedTransition';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import { publicApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
import { Field, FieldRow, FormError } from './form';

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
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 ${isOpen ? 'animate-fade-in' : 'animate-fade-out'}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Request a quotation"
    >
      <div className={`bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[calc(100dvh-2rem)] ${isOpen ? 'animate-scale-in' : 'animate-scale-out'}`}>

        {/* Header */}
        <div className="bg-blue-950 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Request Official Quotation</h3>
              <p className="text-xs text-cyan-200">Pan-India Delivery &amp; Certified Installation</p>
            </div>
          </div>
          <button onClick={handleClose} aria-label="Close" className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Quotation request received</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you, Doctor. Mr. Sivakumar and our sales engineering team will reach out within
              24 hours with exact pricing, tax breakup and delivery lead time.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl inline-block text-left">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference code</div>
              <div className="text-xl font-mono font-bold text-cyan-600">{submitted}</div>
              <div className="text-[11px] text-slate-500 mt-1">Track it any time from the Track page.</div>
            </div>
            <div className="pt-4">
              <button
                onClick={handleClose}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-md transition-all"
              >
                Close &amp; continue browsing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

            <FormError message={error} />

            {/* Product & quantity */}
            <FieldRow cols={3}>
              <Field
                label="Selected Equipment" as="select" required variant="subtle"
                className="sm:col-span-2"
                value={form.product} onChange={set('product')}
                disabled={submitting} error={fieldErrors.product}
              >
                <optgroup label="Dental Chairs">
                  {chairs.map((c) => <option key={c._id || c.id} value={c.name}>{c.name}</option>)}
                </optgroup>
                <optgroup label="Other Equipment">
                  {equipment.map((p) => <option key={p._id || p.id} value={p.name}>{p.name}</option>)}
                </optgroup>
                <option value="Pre-Installation Site Assessment">Pre-Installation Site Assessment</option>
                <option value="Complete Clinic Setup">Complete Clinic Setup</option>
              </Field>
              <Field
                label="Quantity" required variant="subtle" type="number" min="1" max="99"
                value={form.quantity} onChange={set('quantity')}
                disabled={submitting} error={fieldErrors.quantity}
              />
            </FieldRow>

            <FieldRow>
              <Field label="Your Name" required variant="subtle" type="text" placeholder="Dr. Sivakumar" autoComplete="name"
                     value={form.name} onChange={set('name')} disabled={submitting} error={fieldErrors.name} />
              <Field label="Clinic Name" variant="subtle" type="text" placeholder="Care Dental Clinic" autoComplete="organization"
                     value={form.clinicName} onChange={set('clinicName')} disabled={submitting} error={fieldErrors.clinicName} />
              <Field label="Phone" required variant="subtle" type="tel" placeholder="+91 94441 53599" autoComplete="tel"
                     value={form.phone} onChange={set('phone')} disabled={submitting} error={fieldErrors.phone} />
              <Field label="Email" required variant="subtle" type="email" placeholder="doctor@clinic.com" autoComplete="email"
                     value={form.email} onChange={set('email')} disabled={submitting} error={fieldErrors.email} />
            </FieldRow>

            <Field label="Installation Address" variant="subtle" type="text" autoComplete="street-address"
                   placeholder="Street address, City, Pincode (e.g. Mugalivakkam, Chennai)"
                   value={form.address} onChange={set('address')} disabled={submitting} error={fieldErrors.address} />

            <Field label="Additional Requirements" as="textarea" variant="subtle" rows={3}
                   placeholder="Custom color, compressor requirement, room dimensions..."
                   value={form.notes} onChange={set('notes')} disabled={submitting} error={fieldErrors.notes} />

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {submitting ? <><Spinner className="w-4 h-4 text-white" /><span>Sending…</span></> : <><Send className="w-4 h-4" /><span>Submit quotation request</span></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
