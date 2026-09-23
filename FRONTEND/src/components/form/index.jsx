import { useState, useEffect, useRef, useId } from 'react';
import { AlertCircle, ChevronDown, Check } from 'lucide-react';
import { LABEL, inputClass } from './styles';

/**
 * Field primitives shared by every public form.
 *
 * The quote modal, the service-request form, the site-assessment form and the
 * contact form each used to inline the same label/input/error markup and the
 * same forty-character Tailwind string - Contact repeated it five times in one
 * file. A change to focus styling meant finding every copy, and they had
 * already drifted (three variants of the input class, two of the label).
 */

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

/**
 * Label + control + error, wired together.
 *
 * `as` picks the control: 'input' (default), 'textarea' or 'select'. Anything
 * else is forwarded, so a caller still writes `type`, `required`, `rows`,
 * `min`, `inputMode` and so on exactly as it would on the bare element.
 */
export function Field({
  label,
  error,
  required = false,
  as = 'input',
  variant = 'default',
  className = '',
  children,
  hint,
  ...props
}) {
  const Control = as;
  const control = (
    <Control
      required={required}
      className={`${inputClass(variant)} ${as === 'textarea' ? 'resize-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </Control>
  );

  return (
    <div className="space-y-1">
      <label className="block space-y-1">
        <span className={LABEL}>
          {label}
          {required && ' *'}
        </span>
        {control}
      </label>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

/** The red banner every form shows when the request itself failed. */
export function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

/**
 * Label + custom dropdown + error - the styled alternative to a native
 * <select>, first built for the contact form.
 *
 * `options` is [{ value, label, group? }]. Consecutive options sharing a
 * `group` are listed under that heading, the way <optgroup> would. The list
 * scrolls past a fixed height so a long catalogue stays usable.
 */
export function SelectField({ label, required = false, value, onChange, options, disabled = false, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="space-y-1">
      <div className="space-y-1">
        <label htmlFor={id} className={`block ${LABEL}`}>
          {label}
          {required && ' *'}
        </label>
        <div className="relative" ref={ref}>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={`flex items-center justify-between gap-3 w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-left transition-colors ${
              open ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-200'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-cyan-400 cursor-pointer'}`}
          >
            <span className="text-slate-700 truncate">{selected?.label}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute z-20 w-full mt-2 py-1 max-h-64 overflow-y-auto overscroll-contain bg-white border border-slate-200 rounded-xl shadow-xl animate-drop-in origin-top"
            >
              {options.map((opt, i) => {
                const startsGroup = opt.group && opt.group !== options[i - 1]?.group;
                const isSelected = opt.value === value;
                return (
                  <div key={opt.value}>
                    {startsGroup && (
                      <div className="px-4 pt-3 pb-1.5 text-xs uppercase tracking-widest text-slate-400">{opt.group}</div>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => { onChange(opt.value); setOpen(false); }}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        isSelected ? 'text-cyan-700 font-medium bg-cyan-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

/**
 * Two or three fields side by side on anything wider than a phone.
 * The classes are spelled out because Tailwind scans source text - an
 * interpolated `sm:grid-cols-${cols}` is invisible to it and never generated.
 */
const ROW_COLS = {
  2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  3: 'grid grid-cols-1 sm:grid-cols-3 gap-4',
};

export function FieldRow({ children, cols = 2 }) {
  return <div className={ROW_COLS[cols] || ROW_COLS[2]}>{children}</div>;
}
