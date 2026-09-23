import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Spinner, StatusPill } from '../../components/ui';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/format';
import { Btn, DataTable, Field, Modal, Td, inputClass } from '../../components/admin/AdminBits';
import { ORDER_STATUSES } from '../../lib/domain';
import { ErrorLine, ListShell } from './shared';
import { dateInput, useAdminList } from './helpers';

function Orders({ notify }) {
  const { items, loading, error, reload, search, setSearch } = useAdminList(adminApi.orders);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const applyUpdate = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.updateOrder(editing._id, {
        status: editing.status,
        note: editing.note || undefined,
        assignedEngineer: editing.assignedEngineer || undefined,
        ...(editing.expectedDelivery ? { expectedDelivery: editing.expectedDelivery } : {}),
        ...(editing.installationDate ? { installationDate: editing.installationDate } : {}),
      });
      notify(`Order ${editing.reference} updated`);
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const createOrder = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.createOrder({
        customerName: creating.customerName,
        clinicName: creating.clinicName || undefined,
        phone: creating.phone,
        email: creating.email || undefined,
        deliveryAddress: creating.deliveryAddress || undefined,
        items: [{ name: creating.itemName, quantity: Number(creating.quantity) || 1, unitPrice: Number(creating.unitPrice) || 0 }],
      });
      notify('Order created');
      setCreating(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (o) => {
    if (!window.confirm(`Delete order ${o.reference}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteOrder(o._id);
      notify('Order deleted');
      reload();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <>
      <ListShell
        title="Orders" subtitle="Fulfilment and installation pipeline"
        search={search} setSearch={setSearch}
        loading={loading} error={error} reload={reload}
        action={<Btn onClick={() => { setCreating({ customerName: '', clinicName: '', phone: '', email: '', deliveryAddress: '', itemName: '', quantity: 1, unitPrice: 0 }); setFormError(null); }}><Plus className="w-3.5 h-3.5" /> New order</Btn>}
      >
        <DataTable head={['Ref', 'Customer', 'Items', 'Amount', 'Placed', 'Status', '']} empty="No orders yet.">
          {items.map((o) => (
            <tr key={o._id}>
              <Td className="font-mono text-cyan-400">{o.reference}</Td>
              <Td>
                <div className="text-white font-semibold">{o.clinicName || o.customerName}</div>
                <div className="text-[11px] text-slate-500">{o.phone}</div>
              </Td>
              <Td>{o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}</Td>
              <Td>{formatCurrency(o.totalAmount)}</Td>
              <Td>{formatDate(o.createdAt)}</Td>
              <Td><StatusPill status={o.status} /></Td>
              <Td>
                <div className="flex items-center gap-1.5 justify-end">
                  <Btn variant="ghost" onClick={() => { setEditing({ ...o, note: '' }); setFormError(null); }}>Update</Btn>
                  <Btn variant="danger" onClick={() => remove(o)}><Trash2 className="w-3.5 h-3.5" /></Btn>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </ListShell>

      <Modal
        open={Boolean(editing)} onClose={() => setEditing(null)}
        title={editing ? `Order ${editing.reference}` : ''}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={applyUpdate} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Save'}</Btn></>}
      >
        {editing && (
          <>
            {formError && <ErrorLine message={formError} />}
            <Field label="Status">
              <select className={inputClass} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Timeline note" hint="Shown to the customer on the tracking page">
              <input className={inputClass} value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} placeholder="Dispatched from Chennai warehouse" />
            </Field>
            <Field label="Assigned engineer">
              <input className={inputClass} value={editing.assignedEngineer || ''} onChange={(e) => setEditing({ ...editing, assignedEngineer: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Expected delivery">
                <input type="date" className={inputClass} value={dateInput(editing.expectedDelivery)} onChange={(e) => setEditing({ ...editing, expectedDelivery: e.target.value })} />
              </Field>
              <Field label="Installation date">
                <input type="date" className={inputClass} value={dateInput(editing.installationDate)} onChange={(e) => setEditing({ ...editing, installationDate: e.target.value })} />
              </Field>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold uppercase text-slate-500 mb-2">History</div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {editing.timeline?.map((t, i) => (
                  <li key={i}><span className="text-slate-200">{t.status}</span> — {t.note} <span className="text-slate-600">{formatDateTime(t.at)}</span></li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={Boolean(creating)} onClose={() => setCreating(null)} title="New order"
        footer={<><Btn variant="ghost" onClick={() => setCreating(null)}>Cancel</Btn><Btn onClick={createOrder} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Create'}</Btn></>}
      >
        {creating && (
          <>
            {formError && <ErrorLine message={formError} />}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Customer name"><input className={inputClass} value={creating.customerName} onChange={(e) => setCreating({ ...creating, customerName: e.target.value })} /></Field>
              <Field label="Clinic"><input className={inputClass} value={creating.clinicName} onChange={(e) => setCreating({ ...creating, clinicName: e.target.value })} /></Field>
              <Field label="Phone"><input className={inputClass} value={creating.phone} onChange={(e) => setCreating({ ...creating, phone: e.target.value })} /></Field>
              <Field label="Email"><input className={inputClass} value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} /></Field>
            </div>
            <Field label="Delivery address"><input className={inputClass} value={creating.deliveryAddress} onChange={(e) => setCreating({ ...creating, deliveryAddress: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Item"><input className={inputClass} value={creating.itemName} onChange={(e) => setCreating({ ...creating, itemName: e.target.value })} /></Field>
              <Field label="Qty"><input type="number" min="1" className={inputClass} value={creating.quantity} onChange={(e) => setCreating({ ...creating, quantity: e.target.value })} /></Field>
              <Field label="Unit price (₹)"><input type="number" min="0" className={inputClass} value={creating.unitPrice} onChange={(e) => setCreating({ ...creating, unitPrice: e.target.value })} /></Field>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default Orders;
