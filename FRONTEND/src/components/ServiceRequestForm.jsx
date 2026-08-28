import { useState } from 'react';
import { Wrench, Send, CheckCircle2 } from 'lucide-react';
import { publicApi } from '../lib/api';
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
            Breakdown, routine check or an installation visit — tell us what is wrong and we will call to confirm a slot.
          </p>
        </div>
      </div>

      <FormError message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
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
