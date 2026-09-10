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
    'w-full pl-6 pr-0 py-2.5 bg-transparent border-b border-white/15 text-white text-sm placeholder:text-slate-600 focus:border-cyan-400 outline-none transition-colors disabled:opacity-50';

  const submitLabel = {
    signin: 'Sign in',
    register: 'Create account',
    forgot: 'Email me a reset link',
    code: codeSent ? 'Sign in' : 'Email me a code',
  }[mode];

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
              width="152" height="192"
              className="h-24 mx-auto w-auto object-contain"
            />
          </Link>
          <div>
            <h2 className="text-xl tracking-tight font-medium">{MODE_COPY[mode].heading}</h2>
            <p className="text-sm text-slate-400 mt-1">{MODE_COPY[mode].sub}</p>
          </div>
        </div>

        {/* Mode toggle - only between the two that create or use a password. */}
        {isPasswordMode && (
          <div className="grid grid-cols-2 border-b border-white/10 text-sm font-medium">
            {[
              { id: 'signin', label: 'Sign In' },
              { id: 'register', label: 'Create Account' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchMode(tab.id)}
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
        )}

        {!isPasswordMode && (
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to sign in</span>
          </button>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-sm text-cyan-100">{notice}</p>
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
                type="email" required autoComplete="email"
                // Once a code is on its way, the address it went to is fixed -
                // editing it here would verify the code against a different one.
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
                <label className="text-xs uppercase tracking-widest text-slate-400">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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
          )}

          {mode === 'code' && codeSent && (
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-slate-400">6-Digit Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
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
                className="text-xs text-cyan-400 hover:underline"
              >
                Use a different address, or send another code
              </button>
            </div>
          )}

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
              <><span>{submitLabel}</span><ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Other ways in. Hidden on the reset form, which is a dead end by
            design until the email arrives. */}
        {mode !== 'forgot' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-slate-600">
              <span className="h-px flex-1 bg-white/10" />
              <span>or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {googleAvailable && (
              // A full navigation, not a fetch: the flow redirects to Google
              // and back, which an XHR cannot do.
              <a
                href={googleSignInUrl()}
                className="w-full rounded-full border border-white/15 py-3 flex items-center justify-center gap-2.5 text-sm hover:bg-white/5 transition-colors"
              >
                <GoogleMark />
                <span>Continue with Google</span>
              </a>
            )}

            {mode !== 'code' && (
              <button
                type="button"
                onClick={() => switchMode('code')}
                className="w-full rounded-full border border-white/15 py-3 flex items-center justify-center gap-2.5 text-sm hover:bg-white/5 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span>Email me a sign-in code</span>
              </button>
            )}

            {mode === 'code' && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="w-full rounded-full border border-white/15 py-3 flex items-center justify-center gap-2.5 text-sm hover:bg-white/5 transition-colors"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Use my password instead</span>
              </button>
            )}
          </div>
        )}

        <div className="text-center pt-6 text-xs text-slate-400 border-t border-white/10">
          {isPasswordMode && (
            <span className="block pt-6">
              {isRegister ? 'Already have an account?' : 'Need a clinic portal account?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(isRegister ? 'signin' : 'register')}
                className="text-cyan-400 font-medium hover:underline"
              >
                {isRegister ? 'Sign in instead' : 'Create one now'}
              </button>
            </span>
          )}
          <span className="block mt-2 pt-6 first:pt-6">
            Prefer to talk to us? <Link to="/contact" className="text-cyan-400 font-medium hover:underline">Contact Care Dent</Link>
          </span>
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
