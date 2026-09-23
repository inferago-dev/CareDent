import { useState, useEffect, useId, cloneElement } from 'react';
import { useNavigate, Link, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import {
  Lock, Mail, ArrowUpRight, User, Building2, Phone, KeyRound, CheckCircle2, ArrowLeft, Package, FileText, Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, googleSignInUrl } from '../lib/api';
import { COMPANY_DETAILS } from '../data/products';
import { Spinner } from '../components/ui';
import { FieldError, FormError } from '../components/form';
import { LABEL, inputClass } from '../components/form/styles';
import Seo from '../components/Seo';
import Reveal from '../components/Reveal';

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

  const submitLabel = {
    signin: 'Sign in',
    register: 'Create account',
    forgot: 'Email me a reset link',
    code: codeSent ? 'Sign in' : 'Email me a code',
  }[mode];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo title="Sign In" noindex />

      {/* ── BRAND PANEL ─────────────────────────────────────── */}
      {/* Fixed rather than sticky: it holds still while the form beside it scrolls. */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-1/2 h-screen flex-col justify-between overflow-hidden bg-blue-950 text-white p-12 xl:p-16">
        {/* Concentric circles pattern — same motif as the home hero and CTA */}
        <svg
          className="absolute -right-48 top-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none mask-[linear-gradient(to_right,transparent,black_40%)]"
          viewBox="0 0 800 800"
          fill="none"
        >
          {[100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540, 580].map((r, i) => (
            <circle
              key={r}
              cx="400"
              cy="400"
              r={r}
              stroke="white"
              strokeOpacity={0.12 - i * 0.008}
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Glassmorphism blur glow */}
        <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none">
          <div className="absolute -bottom-16 right-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 backdrop-blur-2xl mask-[linear-gradient(to_top,black,transparent)]" />
        </div>

        {/* The panel itself is fixed, so the animations go on its contents - a
            transform on the <aside> would pin it to the page instead of the screen. */}
        <Reveal y={16} className="relative flex items-center justify-between gap-4 pb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>
        </Reveal>

        <div className="relative space-y-8">
          <Reveal delay={80} variant="blur">
            <h1 className="max-w-md text-4xl xl:text-5xl tracking-tighter font-medium leading-[1.1]">
              Your equipment, orders and service visits in one place
            </h1>
          </Reveal>
          <Reveal delay={160} y={0}>
            <div className="border-t border-white/10" />
          </Reveal>
          <ul className="w-full grid grid-cols-3 gap-3">
            {PORTAL_PERKS.map(({ icon: Icon, title, text }, idx) => (
              <Reveal as="li" key={title} delay={220 + idx * 80} variant="scale" scale={0.97} className="h-full">
                <div className="group h-full flex flex-col gap-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-cyan-400/40 transition-all duration-300">
                  <span className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-white text-blue-950 flex items-center justify-center shrink-0 group-hover:text-cyan-600 transition-colors duration-300">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm text-white">{title}</span>
                  </span>
                  <span className="border-t border-white/10" />
                  <span className="text-sm text-slate-400">{text}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal as="p" delay={480} y={12} className="relative pt-6 text-sm text-slate-400">
          Need help? Call{' '}
          <a href={COMPANY_DETAILS.phoneHrefs[0]} className="text-slate-300 hover:text-cyan-400 transition-colors">
            {COMPANY_DETAILS.phoneNumbers[0]}
          </a>
        </Reveal>
      </aside>

      {/* ── FORM PANEL ──────────────────────────────────────── */}
      <main className="lg:ml-[50%] min-h-screen flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md space-y-7">

          <Reveal className="space-y-6">
            <Link to="/" className="inline-block">
              <img
                src="/Logo_Lockup.png"
                alt="Care Dent"
                width="152" height="192"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
                {MODE_COPY[mode].heading}
              </h2>
              <p className="text-slate-500 leading-relaxed">{MODE_COPY[mode].sub}</p>
            </div>
          </Reveal>

          <Reveal delay={120} className="space-y-7">
          {/* Mode toggle */}
          {isPasswordMode ? (
            <div className="grid grid-cols-2 rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-medium">
              {[
                { id: 'signin', label: 'Sign In' },
                { id: 'register', label: 'Create Account' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchMode(tab.id)}
                  className={`py-2.5 rounded-full transition-colors cursor-pointer ${
                    mode === tab.id ? 'bg-blue-950 text-white' : 'text-slate-500 hover:text-blue-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to sign in</span>
            </button>
          )}

          <FormError message={error} />

          {notice && (
            <div className="flex items-start gap-2.5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <p className="text-sm text-cyan-800">{notice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {isRegister && (
              <IconField label="Your Name" icon={User} error={fieldErrors.name}>
                <input
                  type="text" required autoComplete="name" disabled={submitting}
                  placeholder="Dr. Sivakumar" value={form.name} onChange={set('name')}
                  className={ICON_INPUT}
                />
              </IconField>
            )}

            <IconField label="Email Address" icon={Mail} error={fieldErrors.email}>
              <input
                type="email" required autoComplete="email"
                disabled={submitting || codeSent}
                placeholder="you@clinic.com" value={form.email} onChange={set('email')}
                className={ICON_INPUT}
              />
            </IconField>

            {isPasswordMode && (
              <IconField
                label="Password"
                icon={Lock}
                error={fieldErrors.password}
                action={mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-cyan-600 font-medium hover:text-cyan-700 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              >
                <input
                  type="password" required disabled={submitting}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
                  value={form.password} onChange={set('password')}
                  className={ICON_INPUT}
                />
              </IconField>
            )}

            {mode === 'code' && codeSent && (
              <div className="space-y-2">
                <IconField label="6-Digit Code" icon={KeyRound} error={fieldErrors.code}>
                  <input
                    type="text" required disabled={submitting}
                    inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6}
                    placeholder="000000" value={form.code} onChange={set('code')}
                    className={`${ICON_INPUT} tracking-[0.5em] font-mono`}
                  />
                </IconField>
                <button
                  type="button"
                  onClick={() => { setCodeSent(false); setNotice(null); setForm((f) => ({ ...f, code: '' })); }}
                  className="text-xs text-cyan-600 font-medium hover:text-cyan-700 transition-colors cursor-pointer"
                >
                  Use a different address, or send another code
                </button>
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <IconField label="Clinic Name" icon={Building2} error={fieldErrors.clinicName}>
                  <input
                    type="text" disabled={submitting} placeholder="Care Dental Clinic"
                    value={form.clinicName} onChange={set('clinicName')} className={ICON_INPUT}
                  />
                </IconField>
                <IconField label="Phone" icon={Phone} error={fieldErrors.phone}>
                  <input
                    type="tel" disabled={submitting} placeholder="+91 94441 53599"
                    value={form.phone} onChange={set('phone')} className={ICON_INPUT}
                  />
                </IconField>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group w-full inline-flex items-center justify-between gap-3 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm py-1.5 pl-6 pr-1.5 rounded-full transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{submitting ? 'Please wait…' : submitLabel}</span>
              <span className="w-9 h-9 rounded-full bg-white text-blue-950 flex items-center justify-center">
                {submitting ? (
                  <Spinner className="w-4 h-4 text-blue-950" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </span>
            </button>
          </form>

          {/* Other ways in */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>or</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className={`grid gap-3 ${googleAvailable ? 'sm:grid-cols-2' : ''}`}>
                {googleAvailable && (
                  <a href={googleSignInUrl()} className={ALT_BUTTON}>
                    <GoogleMark />
                    <span>Google</span>
                  </a>
                )}
                {mode === 'code' ? (
                  <button type="button" onClick={() => switchMode('signin')} className={ALT_BUTTON}>
                    <Lock className="w-4 h-4 text-cyan-600" />
                    <span>Use my password</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => switchMode('code')} className={ALT_BUTTON}>
                    <KeyRound className="w-4 h-4 text-cyan-600" />
                    <span>Email me a code</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 text-sm text-slate-500 space-y-2">
            {isPasswordMode && (
              <p>
                {isRegister ? 'Already have an account?' : 'Need a clinic portal account?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? 'signin' : 'register')}
                  className="text-cyan-600 font-medium hover:text-cyan-700 transition-colors cursor-pointer"
                >
                  {isRegister ? 'Sign in instead' : 'Create one now'}
                </button>
              </p>
            )}
            <p>
              Prefer to talk to us?{' '}
              <Link to="/contact" className="text-cyan-600 font-medium hover:text-cyan-700 transition-colors">
                Contact Care Dent
              </Link>
            </p>
          </div>
          </Reveal>

        </div>
      </main>
    </div>
  );
}

const PORTAL_PERKS = [
  { icon: Package, title: 'Orders', text: 'Follow every order from confirmation to installation' },
  { icon: FileText, title: 'Quotations', text: 'Keep all your quotations and invoices together' },
  { icon: Wrench, title: 'Service', text: 'Book visits and see engineer updates live' },
];

/** The shared input skin, with room on the left for the field's icon. */
const ICON_INPUT = `${inputClass()} pl-11 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-colors`;

const ALT_BUTTON =
  'w-full rounded-full border border-slate-200 py-3 px-5 flex items-center justify-center gap-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-cyan-300 transition-all active:scale-[0.98] cursor-pointer';

/**
 * Label + icon + input. The optional `action` (e.g. "Forgot password?") sits
 * beside the label rather than inside it, so a click on the label still
 * focuses the input instead of the button.
 */
function IconField({ label, icon: Icon, error, action, children }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL}>{label}</label>
        {action}
      </div>
      <div className="relative">
        <Icon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        {cloneElement(children, { id })}
      </div>
      <FieldError message={error} />
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