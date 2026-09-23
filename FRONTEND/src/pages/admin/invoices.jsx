import { useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Spinner, StatusPill } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/format';
import { Btn, DataTable, Field, Modal, Td, inputClass } from '../../components/admin/AdminBits';
import { ErrorLine, ListShell } from './shared';
import { useAdminList } from './helpers';

function Invoices({ notify }) {
  const { items, loading, error, reload, search, setSearch } = useAdminList(adminApi.invoices);
  const [creating, setCreating] = useState(null);
  const [paying, setPaying] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const create = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.createInvoice({
        customerName: creating.customerName,
        clinicName: creating.clinicName || undefined,
        description: creating.description || undefined,
        taxPercent: Number(creating.taxPercent) || 0,
        ...(creating.dueOn ? { dueOn: creating.dueOn } : {}),
        lines: [{ description: creating.lineDescription, quantity: Number(creating.quantity) || 1, unitPrice: Number(creating.unitPrice) || 0 }],
      });
      notify('Invoice created');
      setCreating(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const recordPayment = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.recordPayment(paying._id, {
        amountPaid: Number(paying.amountPaid) || 0,
        paymentMethod: paying.paymentMethod,
      });
      notify('Payment recorded');
      setPaying(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ListShell
        title="Invoices" subtitle="Billing and payment status"
        search={search} setSearch={setSearch} loading={loading} error={error} reload={reload}
        action={<Btn onClick={() => { setCreating({ customerName: '', clinicName: '', description: '', lineDescription: '', quantity: 1, unitPrice: 0, taxPercent: 18, dueOn: '' }); setFormError(null); }}><Plus className="w-3.5 h-3.5" /> New invoice</Btn>}
      >
        <DataTable head={['Ref', 'Customer', 'Description', 'Issued', 'Amount', 'Paid', 'Status', '']} empty="No invoices yet.">
          {items.map((inv) => (
            <tr key={inv._id}>
              <Td className="font-mono text-cyan-400">{inv.reference}</Td>
              <Td>{inv.clinicName || inv.customerName}</Td>
              <Td>{inv.description || '—'}</Td>
              <Td>{formatDate(inv.issuedOn)}</Td>
              <Td>{formatCurrency(inv.amount)}</Td>
              <Td>{formatCurrency(inv.amountPaid)}</Td>
              <Td><StatusPill status={inv.status} /></Td>
              <Td><div className="flex justify-end"><Btn variant="ghost" onClick={() => { setPaying({ ...inv, amountPaid: inv.amountPaid, paymentMethod: inv.paymentMethod || 'Bank Transfer' }); setFormError(null); }}>Payment</Btn></div></Td>
            </tr>
          ))}
        </DataTable>
      </ListShell>

      <Modal
        open={Boolean(creating)} onClose={() => setCreating(null)} title="New invoice"
        footer={<><Btn variant="ghost" onClick={() => setCreating(null)}>Cancel</Btn><Btn onClick={create} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Create'}</Btn></>}
      >
        {creating && (
          <>
            {formError && <ErrorLine message={formError} />}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Customer name"><input className={inputClass} value={creating.customerName} onChange={(e) => setCreating({ ...creating, customerName: e.target.value })} /></Field>
              <Field label="Clinic"><input className={inputClass} value={creating.clinicName} onChange={(e) => setCreating({ ...creating, clinicName: e.target.value })} /></Field>
            </div>
            <Field label="Description"><input className={inputClass} value={creating.description} onChange={(e) => setCreating({ ...creating, description: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Line item"><input className={inputClass} value={creating.lineDescription} onChange={(e) => setCreating({ ...creating, lineDescription: e.target.value })} /></Field>
              <Field label="Qty"><input type="number" min="1" className={inputClass} value={creating.quantity} onChange={(e) => setCreating({ ...creating, quantity: e.target.value })} /></Field>
              <Field label="Unit price (₹)"><input type="number" min="0" className={inputClass} value={creating.unitPrice} onChange={(e) => setCreating({ ...creating, unitPrice: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tax %"><input type="number" min="0" max="100" className={inputClass} value={creating.taxPercent} onChange={(e) => setCreating({ ...creating, taxPercent: e.target.value })} /></Field>
              <Field label="Due on"><input type="date" className={inputClass} value={creating.dueOn} onChange={(e) => setCreating({ ...creating, dueOn: e.target.value })} /></Field>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={Boolean(paying)} onClose={() => setPaying(null)}
        title={paying ? `Payment · ${paying.reference}` : ''}
        footer={<><Btn variant="ghost" onClick={() => setPaying(null)}>Cancel</Btn><Btn onClick={recordPayment} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Record'}</Btn></>}
      >
        {paying && (
          <>
            {formError && <ErrorLine message={formError} />}
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 text-xs text-slate-400">
              Invoice total <span className="text-slate-200 font-semibold">{formatCurrency(paying.amount)}</span> ·
              currently paid <span className="text-slate-200 font-semibold">{formatCurrency(paying.amountPaid)}</span>
            </div>
            <Field label="Amount received to date (₹)" hint="Enter the cumulative amount, not just this instalment.">
              <input type="number" min="0" className={inputClass} value={paying.amountPaid} onChange={(e) => setPaying({ ...paying, amountPaid: e.target.value })} />
            </Field>
            <Field label="Method">
              <select className={inputClass} value={paying.paymentMethod} onChange={(e) => setPaying({ ...paying, paymentMethod: e.target.value })}>
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </>
        )}
      </Modal>
    </>
  );
}

export default Invoices;
