import { useState } from 'react';
import { adminApi } from '../../lib/api';
import { Spinner, StatusPill } from '../../components/ui';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/format';
import { Btn, DataTable, Field, Modal, Td, inputClass } from '../../components/admin/AdminBits';
import { QUOTATION_STATUSES } from '../../lib/domain';
import { ErrorLine, ListShell } from './shared';
import { dateInput, useAdminList } from './helpers';

function Quotations({ notify }) {
  const { items, loading, error, reload, search, setSearch } = useAdminList(adminApi.quotations);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await adminApi.replyQuotation(editing._id, replyText.trim());
      notify(`Reply emailed to ${editing.email}`);
      setReplyText('');
      reload();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.updateQuotation(editing._id, {
        status: editing.status,
        ...(editing.quotedAmount !== '' && editing.quotedAmount != null ? { quotedAmount: Number(editing.quotedAmount) } : {}),
        ...(editing.validTill ? { validTill: editing.validTill } : {}),
        adminNotes: editing.adminNotes || undefined,
      });
      notify(`Quotation ${editing.reference} updated`);
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
        title="Quote requests" subtitle="Every request from the website's quote modal"
        search={search} setSearch={setSearch} loading={loading} error={error} reload={reload}
      >
        <DataTable head={['Ref', 'Clinic / contact', 'Product', 'Qty', 'Received', 'Amount', 'Status', '']} empty="No quote requests yet.">
          {items.map((q) => (
            <tr key={q._id}>
              <Td className="font-mono text-cyan-400">{q.reference}</Td>
              <Td>
                <div className="text-white font-semibold">{q.clinicName || q.name}</div>
                <div className="text-[11px] text-slate-500">{q.phone} · {q.email}</div>
              </Td>
              <Td>{q.product}</Td>
              <Td>{q.quantity}</Td>
              <Td>{formatDate(q.createdAt)}</Td>
              <Td>{q.quotedAmount ? formatCurrency(q.quotedAmount) : '—'}</Td>
              <Td><StatusPill status={q.status} /></Td>
              <Td><div className="flex justify-end"><Btn variant="ghost" onClick={() => { setEditing({ ...q, quotedAmount: q.quotedAmount ?? '' }); setFormError(null); }}>Open</Btn></div></Td>
            </tr>
          ))}
        </DataTable>
      </ListShell>

      <Modal
        open={Boolean(editing)} onClose={() => { setEditing(null); setReplyText(''); }}
        title={editing ? `Quotation ${editing.reference}` : ''}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Save'}</Btn></>}
      >
        {editing && (
          <>
            {formError && <ErrorLine message={formError} />}
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 text-xs space-y-1 text-slate-400">
              <div><span className="text-slate-500">Product:</span> <span className="text-slate-200">{editing.product} ×{editing.quantity}</span></div>
              <div><span className="text-slate-500">Contact:</span> <span className="text-slate-200">{editing.name}</span> · {editing.phone} · {editing.email}</div>
              {editing.address && <div><span className="text-slate-500">Address:</span> {editing.address}</div>}
              {editing.notes && <div><span className="text-slate-500">Notes:</span> {editing.notes}</div>}
            </div>
            <Field label="Status" hint="Setting this to 'Quoted' emails the customer their quotation.">
              <select className={inputClass} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                {QUOTATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quoted amount (₹)">
                <input type="number" min="0" className={inputClass} value={editing.quotedAmount} onChange={(e) => setEditing({ ...editing, quotedAmount: e.target.value })} />
              </Field>
              <Field label="Valid till">
                <input type="date" className={inputClass} value={dateInput(editing.validTill)} onChange={(e) => setEditing({ ...editing, validTill: e.target.value })} />
              </Field>
            </div>
            <Field label="Internal notes"><textarea rows={3} className={inputClass} value={editing.adminNotes || ''} onChange={(e) => setEditing({ ...editing, adminNotes: e.target.value })} /></Field>

            {editing.adminReply?.message && (
              <div className="rounded-lg bg-cyan-950/30 border border-cyan-900/50 p-4 text-xs space-y-1">
                <div className="text-cyan-400 font-semibold uppercase tracking-wide text-[10px]">
                  Last reply sent {formatDateTime(editing.adminReply.sentAt)}
                </div>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{editing.adminReply.message}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Field label="Email the customer" hint="Sends now, separate from Save above. Mentions we'll also call to follow up.">
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder="Thanks for your quote request — we're reviewing it and..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </Field>
              <div className="flex justify-end">
                <Btn onClick={sendReply} disabled={sendingReply || !replyText.trim()}>
                  {sendingReply ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Send reply'}
                </Btn>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default Quotations;
