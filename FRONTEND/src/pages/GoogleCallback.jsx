import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Seo from '../components/Seo';

/**
 * Where Google sign-in lands.
 *
 * The API's callback does the exchange with Google and then redirects here
 * with a one-time code rather than the session itself - a JWT in a URL is
 * written to browser history and offered to the next page as a Referer. This
 * screen trades that code for the session and gets out of the way.
 */
export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  const { completeGoogleSignIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  // React runs effects twice in development's StrictMode, and the code is
  // single-use: the second call would always fail and report a broken sign-in
  // that actually worked.
  const started = useRef(false);

  useEffect(() => {
    if (!code || started.current) return;
    started.current = true;

    completeGoogleSignIn(code)
      .then((account) => navigate(account.role === 'admin' ? '/admin' : '/portal', { replace: true }))
      .catch(() => setFailed(true));
  }, [code, completeGoogleSignIn, navigate]);

  if (!code || failed) {
    return <Navigate to="/login?error=google-failed" replace />;
  }

  // The redirect above fires from the effect; this covers the case where the
  // session was already in place before it ran.
  if (user) return <Navigate to={isAdmin ? '/admin' : '/portal'} replace />;

  return (
    <div className="min-h-screen bg-blue-950 text-white flex flex-col items-center justify-center gap-4">
      <Seo title="Signing In" noindex />
      <div className="w-9 h-9 rounded-full border-2 border-white/15 border-t-cyan-400 animate-spin" />
      <p className="text-sm text-slate-400">Finishing your Google sign-in…</p>
    </div>
  );
}
