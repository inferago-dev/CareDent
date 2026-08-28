import { AlertCircle } from 'lucide-react';
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
