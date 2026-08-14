import React from 'react';

/* Shared loading / empty / error states so every page fails the same way. */

export function Spinner({ className = 'w-6 h-6' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${className} rounded-full border-2 border-current/20 border-t-current animate-spin`}
    />
  );
}

export function LoadingBlock({ label = 'Loading…', dark = false, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
      <Spinner className={`w-7 h-7 ${dark ? 'text-cyan-400' : 'text-cyan-600'}`} />
      <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}

export function ErrorBlock({ error, onRetry, dark = false, className = '' }) {
  const offline = error?.status === 0;
  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      <div className={`text-sm font-medium ${dark ? 'text-red-300' : 'text-red-600'}`}>
        {offline ? 'Cannot reach the server' : 'Something went wrong'}
      </div>
      <p className={`text-sm mt-2 max-w-md mx-auto ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        {error?.message || 'Please try again in a moment.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ title, description, action, dark = false }) {
  return (
    <div className="text-center py-16 px-4">
      <div className={`text-base font-medium ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</div>
      {description && (
        <p className={`text-sm mt-2 max-w-md mx-auto ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export function statusTone(status = '') {
  const s = String(status).toLowerCase();
  if (['delivered', 'completed', 'paid', 'resolved', 'closed', 'approved'].some((k) => s.includes(k)))
    return 'bg-emerald-100 text-emerald-800';
  if (['cancelled', 'rejected', 'overdue', 'expired'].some((k) => s.includes(k)))
    return 'bg-red-100 text-red-700';
  if (['pending', 'draft', 'new', 'open'].some((k) => s.includes(k)))
    return 'bg-amber-100 text-amber-800';
  return 'bg-cyan-100 text-cyan-800';
}

export function StatusPill({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusTone(status)} ${className}`}
    >
      {status}
    </span>
  );
}

/* ------------------------------ formatting ------------------------------ */

export const formatCurrency = (value) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
    : '—';

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';
