import React, { useState, useEffect, useRef } from 'react';
import {
  Ruler, Send, CheckCircle2, AlertCircle, Upload, X, FileText, Image as ImageIcon,
} from 'lucide-react';
import { publicApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, FieldError } from './ui';

const MAX_FILES = 6;
const MAX_FILE_MB = 10;

const EMPTY = {
  clinicName: '', contactName: '', phone: '', email: '', location: '',
  equipment: '', roomLength: '', roomWidth: '', ceilingHeight: '',
  preferredDate: '', notes: '',
};

const prettySize = (bytes) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Requests a free pre-installation site assessment.
 *
 * Submits multipart/form-data because clinics send a floor plan or photos of
 * the room along with the measurements; the API turns it into a service ticket
 * of type "Pre-Installation Site Visit" so it lands in the same admin queue and
 * gets a trackable reference.
 */
export default function SiteAssessmentForm({ initialEquipment = '' }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...EMPTY, equipment: initialEquipment });
  const [files, setFiles] = useState([]);
  const [reference, setReference] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      contactName: f.contactName || user.name || '',
      email: f.email || user.email || '',
      phone: f.phone || user.phone || '',
      clinicName: f.clinicName || user.clinicName || '',
      location: f.location || user.city || user.address || '',
    }));
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addFiles = (incoming) => {
    setError(null);
    const accepted = [];
    for (const file of Array.from(incoming)) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`${file.name} is larger than ${MAX_FILE_MB} MB.`);
        continue;
      }
      if (!/^image\/|^application\/pdf$/.test(file.type)) {
        setError(`${file.name} is not an image or a PDF.`);
        continue;
      }
      accepted.push(file);
    }
    setFiles((current) => [...current, ...accepted].slice(0, MAX_FILES));
  };

  const removeFile = (index) => setFiles((current) => current.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        const trimmed = typeof value === 'string' ? value.trim() : value;
        if (trimmed) payload.append(key, trimmed);
      });
      files.forEach((file) => payload.append('attachments', file));

      const res = await publicApi.requestSiteAssessment(payload);
      setReference(res.data.reference);
      setFiles([]);
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
        <h3 className="text-2xl font-semibold text-slate-900">Site assessment requested</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          An engineer will review your measurements and call you to fix a visit. Keep this reference —
          you can check progress any time on the Track page.
        </p>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl inline-block">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</div>
          <div className="text-xl font-mono font-bold text-cyan-600">{reference}</div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => { setReference(null); setForm({ ...EMPTY, equipment: initialEquipment }); }}
            className="text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
          >
            Request another assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          <Ruler className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">Request a pre-installation assessment</h3>
          <p className="text-xs text-slate-500 mt-1">
            Free, no obligation. Send what you have — we will fill the gaps on the call.
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
            <label className="text-xs font-bold text-slate-700 uppercase">Clinic Name *</label>
            <input type="text" required disabled={submitting} placeholder="Care Dental Clinic" value={form.clinicName} onChange={set('clinicName')} className={input} />
            <FieldError message={fieldErrors.clinicName} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Contact Person *</label>
            <input type="text" required disabled={submitting} placeholder="Dr. Sivakumar" value={form.contactName} onChange={set('contactName')} className={input} />
            <FieldError message={fieldErrors.contactName} />
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

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Site Location *</label>
          <input type="text" required disabled={submitting} placeholder="Street, area, city, pincode" value={form.location} onChange={set('location')} className={input} />
          <FieldError message={fieldErrors.location} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Equipment Required *</label>
          <input type="text" required disabled={submitting} placeholder="Gamma Overhanging chair + compressor + autoclave" value={form.equipment} onChange={set('equipment')} className={input} />
          <FieldError message={fieldErrors.equipment} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase">Room Dimensions</label>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" inputMode="decimal" disabled={submitting} placeholder="Length (ft)" value={form.roomLength} onChange={set('roomLength')} className={input} />
            <input type="text" inputMode="decimal" disabled={submitting} placeholder="Width (ft)" value={form.roomWidth} onChange={set('roomWidth')} className={input} />
            <input type="text" inputMode="decimal" disabled={submitting} placeholder="Ceiling (ft)" value={form.ceilingHeight} onChange={set('ceilingHeight')} className={input} />
          </div>
          <p className="text-[11px] text-slate-400">
            Approximate is fine — the engineer confirms exact measurements on the visit.
          </p>
        </div>

        {/* Floor plan / photo upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase">Floor Plan or Room Photos</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => !submitting && fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
              dragging ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-slate-50 hover:border-cyan-300'
            }`}
          >
            <Upload className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-cyan-700">Click to upload</span> or drag files here
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Images or PDF · up to {MAX_FILES} files · {MAX_FILE_MB} MB each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            disabled={submitting}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          />

          {files.length > 0 && (
            <ul className="space-y-2 pt-1">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  {file.type === 'application/pdf'
                    ? <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="text-xs text-slate-700 truncate flex-1">{file.name}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">{prettySize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={submitting}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Preferred Installation Date</label>
            <input type="date" disabled={submitting} value={form.preferredDate} onChange={set('preferredDate')} className={input} />
            <FieldError message={fieldErrors.preferredDate} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Anything else we should know?</label>
            <input type="text" disabled={submitting} placeholder="First floor, no lift · Vastu layout" value={form.notes} onChange={set('notes')} className={input} />
            <FieldError message={fieldErrors.notes} />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all text-base active:scale-[0.98]"
        >
          {submitting
            ? <><Spinner className="w-5 h-5 text-white" /><span>Sending…</span></>
            : <><Send className="w-5 h-5" /><span>Request site assessment</span></>}
        </button>
      </form>
    </div>
  );
}
