import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/* Dark-theme building blocks shared by every admin screen. */

export function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`bg-slate-900 border border-slate-800 rounded-2xl ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

export function DataTable({ head, children, empty }) {
  const rows = React.Children.count(children);
  if (!rows) {
    return <div className="py-12 text-center text-sm text-slate-500">{empty || 'Nothing here yet.'}</div>;
  }
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-left border-collapse text-xs min-w-[640px]">
        <thead>
          <tr className="text-slate-500 font-bold uppercase border-b border-slate-800">
            {head.map((h, i) => <th key={i} className="py-3 pr-4 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody className="text-slate-300">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`py-3 pr-4 border-b border-slate-800/70 align-top ${className}`}>{children}</td>;
}

export function Btn({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    ghost: 'bg-slate-800 hover:bg-slate-700 text-slate-200',
    danger: 'bg-red-600/90 hover:bg-red-600 text-white',
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 outline-none disabled:opacity-50';

export function Modal({ open, onClose, title, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full my-8 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-800">{footer}</footer>}
      </div>
    </div>
  );
}

export function Toast({ message, tone = 'ok', onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl text-sm shadow-2xl border ${
      tone === 'error'
        ? 'bg-red-950 border-red-800 text-red-200'
        : 'bg-slate-900 border-cyan-700 text-cyan-100'
    }`}>
      {message}
    </div>
  );
}
