import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthSplash() {
  return (
    <div className="min-h-screen bg-blue-950 text-white flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 rounded-full border-2 border-white/15 border-t-cyan-400 animate-spin" />
      <p className="text-sm text-slate-400">Checking your session…</p>
    </div>
  );
}

/**
 * Gate for /portal and /admin. Sends signed-out visitors to /login and
 * remembers where they were headed so login can bounce them back.
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSplash />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname, requireAdmin }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  // An admin landing on the customer portal is almost always a wrong turn.
  if (!requireAdmin && isAdmin && location.pathname.startsWith('/portal')) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
