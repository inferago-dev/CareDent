import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Phone, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { publicApi } from '../lib/api';
import { COMPANY_DETAILS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';
import { Field, FieldRow, FormError } from './form';
import usePrefillFromUser from '../hooks/usePrefillFromUser';
import { SERVICE_TYPES, PRIORITIES } from '../lib/domain';


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

  usePrefillFromUser(user, (u) =>
    setForm((f) => ({
      ...f,
      contactName: f.contactName || u.name || '',
      email: f.email || u.email || '',
      phone: f.phone || u.phone || '',
      clinicName: f.clinicName || u.clinicName || '',
      address: f.address || u.address || '',
    }))
  );

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

  if (reference) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-6 animate-pop-in">
        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-cyan-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl tracking-tighter font-medium text-blue-950">Service request logged</h3>
          <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
            An engineer will call you to confirm a visit slot. Keep this reference — you can check
            progress any time on the Track page.
          </p>
        </div>
        <div className="inline-block bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
          <div className="text-xs uppercase tracking-widest text-slate-400">Reference</div>
          <div className="text-xl font-mono font-medium text-blue-950 mt-1">{reference}</div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/track-order"
            className="group inline-flex items-center gap-3 rounded-full bg-blue-950 hover:bg-blue-900 text-white font-medium text-sm py-1.5 pl-6 pr-1.5 transition-all active:scale-[0.98]"
          >
            <span>Track this request</span>
            <span className="w-8 h-8 rounded-full bg-white text-blue-950 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </Link>
          <button
            type="button"
            onClick={() => { setReference(null); setForm((f) => ({ ...EMPTY, contactName: f.contactName, clinicName: f.clinicName, phone: f.phone, email: f.email })); }}
            className="inline-flex items-center rounded-full border border-slate-200 hover:border-cyan-300 hover:bg-slate-50 text-slate-700 font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
          >
            Log another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-9 space-y-7">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-blue-950 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl tracking-tighter font-medium text-blue-950">Book a service visit</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Breakdown, routine check or an installation visit — tell us what is wrong and we will call to confirm a slot.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200" />

      <FormError message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldRow>
          <Field label="Your Name" required type="text" placeholder="Dr. Sivakumar" autoComplete="name"
                 value={form.contactName} onChange={set('contactName')} disabled={submitting} error={fieldErrors.contactName} />
          <Field label="Clinic Name" type="text" placeholder="Care Dental Clinic" autoComplete="organization"
                 value={form.clinicName} onChange={set('clinicName')} disabled={submitting} error={fieldErrors.clinicName} />
          <Field label="Phone" required type="tel" placeholder="+91 94441 53599" autoComplete="tel"
                 value={form.phone} onChange={set('phone')} disabled={submitting} error={fieldErrors.phone} />
          <Field label="Email" type="email" placeholder="doctor@clinic.com" autoComplete="email"
                 value={form.email} onChange={set('email')} disabled={submitting} error={fieldErrors.email} />
        </FieldRow>

        <FieldRow>
          <Field label="Equipment" required type="text" placeholder="Gamma Overhanging (Chair #1)"
                 value={form.equipment} onChange={set('equipment')} disabled={submitting} error={fieldErrors.equipment} />
          <Field label="Serial Number" type="text" placeholder="If you have it to hand"
                 value={form.serialNumber} onChange={set('serialNumber')} disabled={submitting} error={fieldErrors.serialNumber} />
          <Field label="Service Type" as="select" required
                 value={form.serviceType} onChange={set('serviceType')} disabled={submitting} error={fieldErrors.serviceType}>
            {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Field>
          <Field label="Priority" as="select" required
                 value={form.priority} onChange={set('priority')} disabled={submitting} error={fieldErrors.priority}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Field>
        </FieldRow>

        <Field label="Clinic Address" type="text" placeholder="Street, City, Pincode" autoComplete="street-address"
               value={form.address} onChange={set('address')} disabled={submitting} error={fieldErrors.address} />

        <Field label="What is the problem?" as="textarea" required rows={4}
               placeholder="e.g. Suction has weakened over the last week and the auto-flush is not running."
               value={form.issue} onChange={set('issue')} disabled={submitting} error={fieldErrors.issue} />

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-slate-200">
          <a href={COMPANY_DETAILS.phoneHrefs[0]} className="group inline-flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 group-hover:bg-cyan-600 group-hover:border-cyan-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Phone className="w-4 h-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-xs text-slate-400">Urgent? Call us</span>
              <span className="block text-sm font-medium text-blue-950 group-hover:text-cyan-700 transition-colors">{COMPANY_DETAILS.phoneNumbers[0]}</span>
            </span>
          </a>

          <button
            type="submit"
            disabled={submitting}
            className="group self-end sm:self-auto inline-flex items-center gap-3 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm py-1.5 pl-6 pr-1.5 rounded-full transition-all active:scale-[0.98]"
          >
            <span>{submitting ? 'Sending…' : 'Log service request'}</span>
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
    </div>
  );
}
