/**
 * Style tokens for the public forms.
 *
 * Kept out of index.jsx so that module exports components and nothing else -
 * a file mixing the two breaks Fast Refresh for every screen importing it.
 */

export const LABEL = 'text-xs font-bold text-slate-700 uppercase';

/** The one input skin. `subtle` is the lighter box used inside the quote modal. */
export const inputClass = (variant = 'default') =>
  variant === 'subtle'
    ? 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:bg-slate-50 disabled:text-slate-500'
    : 'w-full px-4 py-3 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-60';
