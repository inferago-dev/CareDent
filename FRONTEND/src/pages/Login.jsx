import React, { useState } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User, Building2, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner, FieldError } from '../components/ui';
import Seo from '../components/Seo';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', clinicName: '', city: '',
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login, register, user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from;

  // Already signed in - skip the form entirely.
  if (!loading && user) {
    return <Navigate to={redirectTo || (isAdmin ? '/admin' : '/portal')} replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const account =
        mode === 'signin'
          ? await login(form.email.trim(), form.password)
          : await register({
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
              ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
              ...(form.clinicName.trim() ? { clinicName: form.clinicName.trim() } : {}),
              ...(form.city.trim() ? { city: form.city.trim() } : {}),
            });

      navigate(redirectTo || (account.role === 'admin' ? '/admin' : '/portal'), { replace: true });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };

  const isRegister = mode === 'register';
  const inputClass =
    'w-full pl-6 pr-0 py-2.5 bg-transparent border-b border-white/15 text-white text-sm placeholder:text-slate-600 focus:border-cyan-400 outline-none transition-colors disabled:opacity-50';

  return (
    <div className="min-h-screen bg-blue-950 text-white flex items-center justify-center p-4">
      <Seo title="Sign In" noindex />
      <div className="w-full max-w-md space-y-8">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <img
              src="/Logo_White_Lockup.png"
              alt="Care Dent"
              width="507" height="640"
              className="h-24 mx-auto w-auto object-contain"
            />
          </Link>
          <div>
            <h2 className="text-xl tracking-tight font-medium">
              {isRegister ? 'Create your clinic account' : 'Sign in to your account'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isRegister
                ? 'Track orders, quotations and service visits in one place'
                : 'Access orders, quotations, and service logs'}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 border-b border-white/10 text-sm font-medium">
          {[
            { id: 'signin', label: 'Sign In' },
            { id: 'register', label: 'Create Account' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setMode(tab.id); setError(null); setFieldErrors({}); }}
              className={`py-3 border-b-2 transition-colors ${
                mode === tab.id
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-slate-400">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
                <input
                  type="text" required autoComplete="name" disabled={submitting}
                  placeholder="Dr. Sivakumar" value={form.name} onChange={set('name')}
                  className={inputClass}
                />
              </div>
              <FieldError message={fieldErrors.name} />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="email" required autoComplete="email" disabled={submitting}
                placeholder="you@clinic.com" value={form.email} onChange={set('email')}
                className={inputClass}
              />
            </div>
            <FieldError message={fieldErrors.email} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="password" required disabled={submitting}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
                value={form.password} onChange={set('password')}
                className={inputClass}
              />
            </div>
            <FieldError message={fieldErrors.password} />
          </div>

          {isRegister && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-slate-400">Clinic Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
                  <input
                    type="text" disabled={submitting} placeholder="Care Dental Clinic"
                    value={form.clinicName} onChange={set('clinicName')} className={inputClass}
                  />
                </div>
                <FieldError message={fieldErrors.clinicName} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-slate-400">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel" disabled={submitting} placeholder="+91 94441 53599"
                    value={form.phone} onChange={set('phone')} className={inputClass}
                  />
                </div>
                <FieldError message={fieldErrors.phone} />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-white text-blue-950 font-medium py-3.5 flex items-center justify-center gap-2 hover:bg-cyan-50 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Spinner className="w-4 h-4 text-blue-950" /><span>Please wait…</span></>
            ) : (
              <>
                <span>{isRegister ? 'Create account' : 'Sign in'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-6 text-xs text-slate-400 border-t border-white/10">
          <span className="block pt-6">
            {isRegister ? 'Already have an account?' : 'Need a clinic portal account?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(isRegister ? 'signin' : 'register'); setError(null); }}
              className="text-cyan-400 font-medium hover:underline"
            >
              {isRegister ? 'Sign in instead' : 'Create one now'}
            </button>
          </span>
          <span className="block mt-2">
            Prefer to talk to us? <Link to="/contact" className="text-cyan-400 font-medium hover:underline">Contact Care Dent</Link>
          </span>
        </div>

      </div>
    </div>
  );
}
