import React, { useState, useEffect } from 'react';
import { Wrench, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { publicApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, FieldError } from './ui';

const SERVICE_TYPES = [
  'Breakdown Repair',
  'Routine Maintenance',
  'AMC Visit',
  'Installation',
  'Inspection',
  'Remote Support',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const EMPTY = {
  contactName: '', clinicName: '', phone: '', email: '', address: '',
  equipment: '', serialNumber: '', serviceType: 'Breakdown Repair',
  priority: 'Medium', issue: '',
};

/** Books a service ticket. Works for guests and signed-in customers alike. */
export default function ServiceRequestForm() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [reference, setReference] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      contactName: f.contactName || user.name || '',
      email: f.email || user.email || '',
      phone: f.phone || user.phone || '',
      clinicName: f.clinicName || user.clinicName || '',
      address: f.address || user.address || '',
    }));
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
      );
      const res = await publicApi.requestService(payload);
      setReference(res.data.reference);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };

  const input =
    'w-full px-4 py-3 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-60';

  if (reference) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center space-y-4">
        <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900">Service request logged</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          An engineer will call you to confirm a visit slot. Keep this reference — you can check
          progress any time on the Track page.
        </p>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl inline-block">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</div>
          <div className="text-xl font-mono font-bold text-cyan-600">{reference}</div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => { setReference(null); setForm((f) => ({ ...EMPTY, contactName: f.contactName, clinicName: f.clinicName, phone: f.phone, email: f.email })); }}
            className="text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
          >
            Log another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">Book a service visit</h3>
          <p className="text-xs text-slate-500 mt-1">
            Breakdown, AMC visit or a routine check — tell us what is wrong and we will call to confirm a slot.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Your Name *</label>
            <input type="text" required disabled={submitting} placeholder="Dr. Sivakumar" value={form.contactName} onChange={set('contactName')} className={input} />
            <FieldError message={fieldErrors.contactName} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Clinic Name</label>
            <input type="text" disabled={submitting} placeholder="Care Dental Clinic" value={form.clinicName} onChange={set('clinicName')} className={input} />
            <FieldError message={fieldErrors.clinicName} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Phone *</label>
            <input type="tel" required disabled={submitting} placeholder="+91 94441 53599" value={form.phone} onChange={set('phone')} className={input} />
            <FieldError message={fieldErrors.phone} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Email</label>
            <input type="email" disabled={submitting} placeholder="doctor@clinic.com" value={form.email} onChange={set('email')} className={input} />
            <FieldError message={fieldErrors.email} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Equipment *</label>
            <input type="text" required disabled={submitting} placeholder="Gamma Overhanging (Chair #1)" value={form.equipment} onChange={set('equipment')} className={input} />
            <FieldError message={fieldErrors.equipment} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Serial Number</label>
            <input type="text" disabled={submitting} placeholder="If you have it to hand" value={form.serialNumber} onChange={set('serialNumber')} className={input} />
            <FieldError message={fieldErrors.serialNumber} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Service Type *</label>
            <select disabled={submitting} value={form.serviceType} onChange={set('serviceType')} className={input}>
              {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Priority *</label>
            <select disabled={submitting} value={form.priority} onChange={set('priority')} className={input}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Clinic Address</label>
          <input type="text" disabled={submitting} placeholder="Street, City, Pincode" value={form.address} onChange={set('address')} className={input} />
          <FieldError message={fieldErrors.address} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">What is the problem? *</label>
          <textarea required rows={4} disabled={submitting} placeholder="e.g. Suction has weakened over the last week and the auto-flush is not running." value={form.issue} onChange={set('issue')} className={`${input} resize-none`} />
          <FieldError message={fieldErrors.issue} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all text-base active:scale-[0.98]"
        >
          {submitting ? <><Spinner className="w-5 h-5 text-white" /><span>Sending…</span></> : <><Send className="w-5 h-5" /><span>Log service request</span></>}
        </button>
      </form>
    </div>
  );
}
