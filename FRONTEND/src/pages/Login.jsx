import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User, Building2, Phone, AlertCircle, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, googleSignInUrl } from '../lib/api';
import { Spinner } from '../components/ui';
import { FieldError } from '../components/form';
import Seo from '../components/Seo';

/**
 * Four ways in, one screen.
 *
 *   signin    email + password
 *   register  create a clinic account
 *   forgot    email a reset link
 *   code      email a one-time sign-in code
 *
 * They share the panel rather than each taking a route because they are the
 * same decision - "how am I proving who I am" - and a visitor who picked the
 * wrong one should not have to navigate to change their mind. Only the reset
 * link needs a route of its own, because it arrives from an email.
 */

/**
 * Failures from the Google redirect. The callback cannot render an error - it
 * is a server-side redirect - so it names one here instead.
 */
const OAUTH_ERRORS = {
  cancelled: 'Google sign-in was cancelled.',
  'google-failed': 'Google sign-in could not be completed. Please try again, or use your password.',
  'google-unverified': 'That Google account has an unverified email address, so it cannot be used to sign in.',
  'account-disabled': 'This account has been disabled. Please contact Care Dent.',
};

const MODE_COPY = {
  signin: { heading: 'Sign in to your account', sub: 'Access orders, quotations, and service logs' },
  register: { heading: 'Create your clinic account', sub: 'Track orders, quotations and service visits in one place' },
  forgot: { heading: 'Reset your password', sub: 'We will email you a link to choose a new one' },
  code: { heading: 'Sign in with a code', sub: 'We will email a one-time code to your address' },
};

export default function Login() {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', clinicName: '', city: '', code: '',
  });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // The code form only appears once a code has actually been sent, so nobody
  // is asked to type one that does not exist yet.
  const [codeSent, setCodeSent] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);

  const { login, loginWithCode, register, user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectTo = location.state?.from;

  // Google is configured per deployment; a button that leads to a 404 is worse
  // than no button.
  useEffect(() => {
    const controller = new AbortController();
    authApi
      .providers({ signal: controller.signal })
      .then((res) => setGoogleAvailable(Boolean(res.providers?.google)))
      .catch(() => setGoogleAvailable(false));
    return () => controller.abort();
  }, []);

  // The Google callback redirects here with ?error=... when it could not
  // finish.
  const oauthError = searchParams.get('error');
  useEffect(() => {
    if (oauthError) setError(OAUTH_ERRORS[oauthError] || OAUTH_ERRORS['google-failed']);
  }, [oauthError]);

  // Already signed in - skip the form entirely.
  if (!loading && user) {
    return <Navigate to={redirectTo || (isAdmin ? '/admin' : '/portal')} replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setFieldErrors({});
    setCodeSent(false);
    setForm((f) => ({ ...f, code: '' }));
  };

  const landing = (account) => redirectTo || (account.role === 'admin' ? '/admin' : '/portal');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setFieldErrors({});
    setSubmitting(true);

    const email = form.email.trim();

    try {
      if (mode === 'forgot') {
        const res = await authApi.forgotPassword(email);
        setNotice(res.message);
      } else if (mode === 'code' && !codeSent) {
        const res = await authApi.requestOtp(email);
        setNotice(res.message);
        setCodeSent(true);
      } else if (mode === 'code') {
        const account = await loginWithCode(email, form.code.trim());
        navigate(landing(account), { replace: true });
      } else {
        const account =
          mode === 'signin'
            ? await login(email, form.password)
            : await register({
              name: form.name.trim(),
              email,
              password: form.password,
              ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
              ...(form.clinicName.trim() ? { clinicName: form.clinicName.trim() } : {}),
              ...(form.city.trim() ? { city: form.city.trim() } : {}),
            });
        navigate(landing(account), { replace: true });
      }
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };

  const isRegister = mode === 'register';
  const isPasswordMode = mode === 'signin' || mode === 'register';
  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all disabled:opacity-50';

  const submitLabel = {
    signin: 'Sign in',
    register: 'Create account',
    forgot: 'Email me a reset link',
    code: codeSent ? 'Sign in' : 'Email me a code',
  }[mode];

  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <Seo title="Sign In" noindex />

      {/* Decorative Concentric Circles background — Top Right (Dark Blue) */}
      <svg
        className="absolute -top-32 -right-32 w-[600px] h-[600px] pointer-events-none opacity-40"
        viewBox="0 0 600 600"
        fill="none"
      >
        {[60, 110, 160, 210, 260, 310, 360, 410, 460].map((r, i) => (
          <circle
            key={r}
            cx="300"
            cy="300"
            r={r}
            stroke="#0b132b"
            strokeOpacity={0.12 - i * 0.009}
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Decorative Concentric Circles background — Bottom Left (Cyan) */}
      <svg
        className="absolute -bottom-32 -left-32 w-[600px] h-[600px] pointer-events-none opacity-30"
        viewBox="0 0 600 600"
        fill="none"
      >
        {[60, 110, 160, 210, 260, 310, 360, 410].map((r, i) => (
          <circle
            key={r}
            cx="300"
            cy="300"
            r={r}
            stroke="#06b6d4"
            strokeOpacity={0.15 - i * 0.015}
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Soft Ambient Blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container without box background */}
      <div className="relative z-10 w-full max-w-md">
        <div className="space-y-7">

          {/* Brand Header — Clean Logo without background block */}
          <div className="text-center space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/Logo_Lockup.png"
                alt="Care Dent"
                width="152" height="192"
                className="h-16 mx-auto w-auto object-contain"
              />
            </Link>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-blue-950">{MODE_COPY[mode].heading}</h2>
              <p className="text-sm text-slate-500 mt-1 tracking-tight">{MODE_COPY[mode].sub}</p>
            </div>
          </div>

          {/* Mode toggle */}
          {isPasswordMode && (
            <div className="grid grid-cols-2 gap-1 bg-slate-100/90 rounded-xl p-1 text-sm font-medium tracking-tight">
              {[
                { id: 'signin', label: 'Sign In' },
                { id: 'register', label: 'Create Account' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchMode(tab.id)}
                  className={`py-2 rounded-lg transition-all duration-300 cursor-pointer tracking-tight ${
                    mode === tab.id
                      ? 'bg-blue-950 text-white shadow-sm shadow-blue-950/20'
                      : 'text-slate-500 hover:text-blue-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {!isPasswordMode && (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="inline-flex items-center gap-2 text-sm font-medium tracking-tight text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to sign in</span>
            </button>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm tracking-tight text-red-700">{error}</p>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-2.5 rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <p className="text-sm tracking-tight text-cyan-800">{notice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-tight text-slate-500">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              <label className="text-xs font-semibold uppercase tracking-tight text-slate-500">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email" required autoComplete="email"
                  disabled={submitting || codeSent}
                  placeholder="you@clinic.com" value={form.email} onChange={set('email')}
                  className={inputClass}
                />
              </div>
              <FieldError message={fieldErrors.email} />
            </div>

            {isPasswordMode && (
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-tight text-slate-500">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-cyan-600 font-medium tracking-tight hover:text-cyan-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
            )}

            {mode === 'code' && codeSent && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-tight text-slate-500">6-Digit Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text" required disabled={submitting}
                    inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6}
                    placeholder="000000" value={form.code} onChange={set('code')}
                    className={`${inputClass} tracking-[0.5em] font-mono`}
                  />
                </div>
                <FieldError message={fieldErrors.code} />
                <button
                  type="button"
                  onClick={() => { setCodeSent(false); setNotice(null); setForm((f) => ({ ...f, code: '' })); }}
                  className="text-xs text-cyan-600 font-medium tracking-tight hover:underline cursor-pointer"
                >
                  Use a different address, or send another code
                </button>
              </div>
            )}

            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-tight text-slate-500">Clinic Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text" disabled={submitting} placeholder="Care Dental Clinic"
                      value={form.clinicName} onChange={set('clinicName')} className={inputClass}
                    />
                  </div>
                  <FieldError message={fieldErrors.clinicName} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-tight text-slate-500">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              className="w-full rounded-xl bg-blue-950 text-white font-medium py-3.5 flex items-center justify-center gap-2 tracking-tight hover:bg-blue-900 active:scale-[0.99] shadow-md shadow-blue-950/15 transition-all text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Spinner className="w-4 h-4 text-white" /><span>Please wait…</span></>
              ) : (
                <><span>{submitLabel}</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Other ways in */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-tight text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>or</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              {googleAvailable && (
                <a
                  href={googleSignInUrl()}
                  className="w-full rounded-xl border border-slate-200 py-3 flex items-center justify-center gap-2.5 text-sm tracking-tight text-slate-700 hover:bg-slate-50 hover:border-cyan-300 transition-all"
                >
                  <GoogleMark />
                  <span>Continue with Google</span>
                </a>
              )}

              {mode !== 'code' && (
                <button
                  type="button"
                  onClick={() => switchMode('code')}
                  className="w-full rounded-xl border border-slate-200 py-3 flex items-center justify-center gap-2.5 text-sm tracking-tight text-slate-700 hover:bg-cyan-50/50 hover:border-cyan-300 transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-cyan-600" />
                  <span>Email me a sign-in code</span>
                </button>
              )}

              {mode === 'code' && (
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="w-full rounded-xl border border-slate-200 py-3 flex items-center justify-center gap-2.5 text-sm tracking-tight text-slate-700 hover:bg-cyan-50/50 hover:border-cyan-300 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-cyan-600" />
                  <span>Use my password instead</span>
                </button>
              )}
            </div>
          )}

          <div className="text-center pt-5 text-xs text-slate-500 border-t border-slate-100 tracking-tight">
            {isPasswordMode && (
              <span className="block">
                {isRegister ? 'Already have an account?' : 'Need a clinic portal account?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? 'signin' : 'register')}
                  className="text-cyan-600 font-semibold tracking-tight hover:text-cyan-700 hover:underline cursor-pointer"
                >
                  {isRegister ? 'Sign in instead' : 'Create one now'}
                </button>
              </span>
            )}
            <span className="block mt-2">
              Prefer to talk to us? <Link to="/contact" className="text-cyan-600 font-semibold tracking-tight hover:text-cyan-700 hover:underline">Contact Care Dent</Link>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

/** Google's mark, inline so the button needs no request to render. */
function GoogleMark() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}