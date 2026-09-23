import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
import { FieldError } from '../components/form';
import Seo from '../components/Seo';
import Reveal from '../components/Reveal';

/**
 * The far end of a reset email.
 *
 * This needs a route of its own - unlike the other sign-in modes, it is
 * arrived at from an inbox rather than chosen on the page. The link carries
 * the token and the address it was issued for; the visitor supplies only the
 * new password.
 */
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { resetPassword, user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Landing here already signed in means the reset finished and the API
  // signed them in; there is nothing left to do on this screen.
  if (!loading && user) return <Navigate to={isAdmin ? '/admin' : '/portal'} replace />;

  const linkIsUsable = Boolean(token && email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Checked here rather than at the API: the second field exists only to
    // catch a typo, and the server has no use for it.
    if (password !== confirmation) {
      setFieldErrors({ confirmation: 'Both passwords must match' });
      return;
    }

    setSubmitting(true);
    try {
      const account = await resetPassword({ email, token, password });
      navigate(account.role === 'admin' ? '/admin' : '/portal', { replace: true });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full pl-6 pr-0 py-2.5 bg-transparent border-b border-white/15 text-white text-sm placeholder:text-slate-600 focus:border-cyan-400 outline-none transition-colors disabled:opacity-50';

  return (
    <div className="min-h-screen bg-blue-950 text-white flex items-center justify-center p-4">
      <Seo title="Choose a New Password" noindex />
      <div className="w-full max-w-md space-y-8">

        <Reveal className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <img
              src="/Logo_White_Lockup.png"
              alt="Care Dent"
              width="152" height="192"
              className="h-24 mx-auto w-auto object-contain"
            />
          </Link>
          <div>
            <h2 className="text-xl tracking-tight font-medium">Choose a new password</h2>
            <p className="text-sm text-slate-400 mt-1">
              {linkIsUsable ? `for ${email}` : 'This link is incomplete'}
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="space-y-8">
        {!linkIsUsable ? (
          <div className="space-y-5">
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">
                This reset link is missing part of its address. Open it straight from the
                email, or ask for a new one.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full rounded-full bg-white text-blue-950 font-medium py-3.5 flex items-center justify-center gap-2 hover:bg-cyan-50 transition-colors text-sm"
            >
              <span>Back to sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-slate-400">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
                  <input
                    type="password" required disabled={submitting} autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <FieldError message={fieldErrors.password} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-slate-400">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-0 top-1/2 -translate-y-1/2" />
                  <input
                    type="password" required disabled={submitting} autoComplete="new-password"
                    placeholder="Type it again"
                    value={confirmation} onChange={(e) => setConfirmation(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <FieldError message={fieldErrors.confirmation} />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-white text-blue-950 font-medium py-3.5 flex items-center justify-center gap-2 hover:bg-cyan-50 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Spinner className="w-4 h-4 text-blue-950" /><span>Please wait…</span></>
                ) : (
                  <><span>Set new password</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="text-center pt-6 text-xs text-slate-400 border-t border-white/10">
              <span className="block pt-6">
                Link expired?{' '}
                <Link to="/login" className="text-cyan-400 font-medium hover:underline">
                  Ask for a new one
                </Link>
              </span>
            </div>
          </>
        )}
        </Reveal>

      </div>
    </div>
  );
}
