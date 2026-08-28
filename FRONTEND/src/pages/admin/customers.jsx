import { useState } from 'react';
import { adminApi } from '../../lib/api';
import { Spinner } from '../../components/ui';
import { formatDate } from '../../lib/format';
import { Btn, DataTable, Field, Modal, Td, inputClass } from '../../components/admin/AdminBits';
import { ErrorLine, ListShell } from './shared';
import { useAdminList } from './helpers';

function Customers({ notify }) {
  const { items, loading, error, reload, search, setSearch } = useAdminList(adminApi.customers);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const toggle = async (c) => {
    try {
      await adminApi.setCustomerActive(c._id, !c.isActive);
      notify(c.isActive ? 'Account disabled' : 'Account enabled');
      reload();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.updateCustomer(editing._id, {
        name: editing.name,
        phone: editing.phone,
        clinicName: editing.clinicName,
        city: editing.city,
        address: editing.address,
      });
      notify('Customer details updated');
      setEditing(null);
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
        title="Customers" subtitle="Clinics with a portal account"
        search={search} setSearch={setSearch} loading={loading} error={error} reload={reload}
      >
        <DataTable head={['Name', 'Clinic', 'Contact', 'City', 'Joined', 'Status', '']} empty="No customers yet.">
          {items.map((c) => (
            <tr key={c._id}>
              <Td className="text-white font-semibold">{c.name}</Td>
              <Td>{c.clinicName || '—'}</Td>
              <Td><div>{c.email}</div><div className="text-[11px] text-slate-500">{c.phone || '—'}</div></Td>
              <Td>{c.city || '—'}</Td>
              <Td>{formatDate(c.createdAt)}</Td>
              <Td>
                <span className={`text-[11px] font-bold ${c.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {c.isActive ? 'Active' : 'Disabled'}
                </span>
              </Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => { setEditing({ ...c }); setFormError(null); }}>Edit</Btn>
                  <Btn variant={c.isActive ? 'danger' : 'ghost'} onClick={() => toggle(c)}>
                    {c.isActive ? 'Disable' : 'Enable'}
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </ListShell>

      <Modal
        open={Boolean(editing)} onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : ''}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Save'}</Btn></>}
      >
        {editing && (
          <>
            {formError && <ErrorLine message={formError} />}
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-400">
              Email and password are managed by the customer, not editable here — for their security.
              <div className="text-slate-200 mt-1">{editing.email}</div>
            </div>
            <Field label="Name"><input className={inputClass} value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone"><input className={inputClass} value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
              <Field label="Clinic name"><input className={inputClass} value={editing.clinicName || ''} onChange={(e) => setEditing({ ...editing, clinicName: e.target.value })} /></Field>
            </div>
            <Field label="City"><input className={inputClass} value={editing.city || ''} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></Field>
            <Field label="Address"><textarea rows={2} className={inputClass} value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
          </>
        )}
      </Modal>
    </>
  );
}

export default Customers;
