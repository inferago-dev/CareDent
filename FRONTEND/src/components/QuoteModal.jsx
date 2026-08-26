import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, Send, Stethoscope, AlertCircle } from 'lucide-react';
import useCatalogue from '../hooks/useCatalogue';
import useMountedTransition from '../hooks/useMountedTransition';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import { publicApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, FieldError } from '../components/ui';

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
  const [formData, setFormData] = useState(EMPTY);

  const shouldRender = useMountedTransition(isOpen, 200);

  const handleClose = useCallback(() => {
    onClose();
    // Reset only after the exit animation, so the form does not flash empty.
    setTimeout(() => {
      setSubmitted(null);
      setFormData(EMPTY);
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

  // Prefill from the product the visitor clicked and from their account.
  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) => ({
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
  }, [isOpen, initialProduct, user]);

  if (!shouldRender) return null;

  const set = (key) => (e) =>
    setFormData((f) => ({ ...f, [key]: key === 'quantity' ? Number(e.target.value) : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await publicApi.requestQuote({
        name: formData.name.trim(),
        clinicName: formData.clinicName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        product: formData.product,
        quantity: formData.quantity,
        notes: formData.notes.trim(),
      });
      setSubmitted(res.data.reference);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };


  const inputClass =
    'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:bg-slate-50 disabled:text-slate-500';

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

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Product & quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Selected Equipment *</label>
                <select required value={formData.product} onChange={set('product')} disabled={submitting} className={inputClass}>
                  <optgroup label="Dental Chairs">
                    {chairs.map((c) => <option key={c._id || c.id} value={c.name}>{c.name}</option>)}
                  </optgroup>
                  <optgroup label="Other Equipment">
                    {equipment.map((p) => <option key={p._id || p.id} value={p.name}>{p.name}</option>)}
                  </optgroup>
                  <option value="Pre-Installation Site Assessment">Pre-Installation Site Assessment</option>
                  <option value="Complete Clinic Setup">Complete Clinic Setup</option>
                </select>
                <FieldError message={fieldErrors.product} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Quantity *</label>
                <input type="number" min="1" max="99" required value={formData.quantity} onChange={set('quantity')} disabled={submitting} className={inputClass} />
                <FieldError message={fieldErrors.quantity} />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Your Name *</label>
                <input type="text" required placeholder="Dr. Sivakumar" value={formData.name} onChange={set('name')} disabled={submitting} className={inputClass} />
                <FieldError message={fieldErrors.name} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Clinic Name</label>
                <input type="text" placeholder="Care Dental Clinic" value={formData.clinicName} onChange={set('clinicName')} disabled={submitting} className={inputClass} />
                <FieldError message={fieldErrors.clinicName} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Phone *</label>
                <input type="tel" required placeholder="+91 94441 53599" value={formData.phone} onChange={set('phone')} disabled={submitting} className={inputClass} />
                <FieldError message={fieldErrors.phone} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Email *</label>
                <input type="email" required placeholder="doctor@clinic.com" value={formData.email} onChange={set('email')} disabled={submitting} className={inputClass} />
                <FieldError message={fieldErrors.email} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Installation Address</label>
              <input type="text" placeholder="Street address, City, Pincode (e.g. Mugalivakkam, Chennai)" value={formData.address} onChange={set('address')} disabled={submitting} className={inputClass} />
              <FieldError message={fieldErrors.address} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Additional Requirements</label>
              <textarea rows="3" placeholder="Custom color, compressor requirement, room dimensions..." value={formData.notes} onChange={set('notes')} disabled={submitting} className={inputClass} />
              <FieldError message={fieldErrors.notes} />
            </div>

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
