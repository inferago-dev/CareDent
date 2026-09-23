/**
 * Display formatting, in Indian conventions.
 *
 * These lived in components/ui/index.jsx alongside the loading and empty-state
 * components. They are not components, and mixing the two in one module breaks
 * Fast Refresh for everything that imports it - editing a formatter forced a
 * full reload instead of a hot update.
 */

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatCurrency = (value) => (typeof value === 'number' ? rupees.format(value) : '—');

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

/**
 * Tailwind classes for a status chip. Statuses come from several collections
 * (orders, tickets, quotations, invoices) and are matched on meaning rather
 * than enumerated, so a new status still lands in a sensible colour.
 */
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
