import { useState } from 'react';
import { adminApi, fileUrl } from '../../lib/api';
import { Spinner, StatusPill } from '../../components/ui';
import { formatDate, formatDateTime } from '../../lib/format';
import { Btn, DataTable, Field, Modal, Td, inputClass } from '../../components/admin/AdminBits';
import { TICKET_STATUSES } from '../../lib/domain';
import { ErrorLine, ListShell } from './shared';
import { dateInput, useAdminList } from './helpers';

function Tickets({ notify }) {
  const { items, loading, error, reload, search, setSearch } = useAdminList(adminApi.serviceRequests);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.updateServiceRequest(editing._id, {
        status: editing.status,
        priority: editing.priority,
        assignedEngineer: editing.assignedEngineer || undefined,
        note: editing.note || undefined,
        ...(editing.scheduledFor ? { scheduledFor: editing.scheduledFor } : {}),
        resolutionNotes: editing.resolutionNotes || undefined,
      });
      notify(`Ticket ${editing.reference} updated`);
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
        title="Service requests" subtitle="Site assessments, breakdowns and installations"
        search={search} setSearch={setSearch} loading={loading} error={error} reload={reload}
      >
        <DataTable head={['Ref', 'Clinic', 'Equipment', 'Type', 'Priority', 'Engineer', 'Status', '']} empty="No service requests yet.">
          {items.map((t) => (
            <tr key={t._id}>
              <Td className="font-mono text-cyan-400">{t.reference}</Td>
              <Td>
                <div className="text-white font-semibold">{t.clinicName || t.contactName}</div>
                <div className="text-[11px] text-slate-500">{t.phone}</div>
              </Td>
              <Td>{t.equipment}</Td>
              <Td>{t.serviceType}</Td>
              <Td>{t.priority}</Td>
              <Td>{t.assignedEngineer || '—'}</Td>
              <Td><StatusPill status={t.status} /></Td>
              <Td><div className="flex justify-end"><Btn variant="ghost" onClick={() => { setEditing({ ...t, note: '' }); setFormError(null); }}>Open</Btn></div></Td>
            </tr>
          ))}
        </DataTable>
      </ListShell>

      <Modal
        open={Boolean(editing)} onClose={() => setEditing(null)}
        title={editing ? `Ticket ${editing.reference}` : ''}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Save'}</Btn></>}
      >
        {editing && (
          <>
            {formError && <ErrorLine message={formError} />}
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 text-xs space-y-1 text-slate-400">
              <div><span className="text-slate-500">Type:</span> <span className="text-slate-200">{editing.serviceType}</span></div>
              <div><span className="text-slate-500">Equipment:</span> <span className="text-slate-200">{editing.equipment}</span>{editing.serialNumber ? ` (${editing.serialNumber})` : ''}</div>
              <div><span className="text-slate-500">Issue:</span> {editing.issue}</div>
              <div><span className="text-slate-500">Contact:</span> {editing.contactName} · {editing.phone}</div>
              {editing.address && <div><span className="text-slate-500">Address:</span> {editing.address}</div>}

              {/* Pre-installation site assessments carry measurements + a floor plan. */}
              {editing.siteAssessment && (
                <div className="pt-2 mt-2 border-t border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold uppercase text-slate-500">Site assessment</div>
                  {editing.siteAssessment.location && (
                    <div><span className="text-slate-500">Location:</span> {editing.siteAssessment.location}</div>
                  )}
                  <div>
                    <span className="text-slate-500">Room:</span>{' '}
                    {[
                      editing.siteAssessment.roomLength && `${editing.siteAssessment.roomLength} ft (L)`,
                      editing.siteAssessment.roomWidth && `${editing.siteAssessment.roomWidth} ft (W)`,
                      editing.siteAssessment.ceilingHeight && `${editing.siteAssessment.ceilingHeight} ft (ceiling)`,
                    ].filter(Boolean).join(' × ') || 'not supplied'}
                  </div>
                  {editing.siteAssessment.preferredDate && (
                    <div><span className="text-slate-500">Preferred date:</span> {formatDate(editing.siteAssessment.preferredDate)}</div>
                  )}
                </div>
              )}

              {editing.attachments?.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase text-slate-500">
                    Attachments ({editing.attachments.length})
                  </div>
                  {editing.attachments.map((file) => (
                    <a
                      key={file.url}
                      href={fileUrl(file.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-cyan-400 hover:text-cyan-300 truncate transition-colors"
                    >
                      {file.name || file.url.split('/').pop()}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select className={inputClass} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select className={inputClass} value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Assigned engineer"><input className={inputClass} value={editing.assignedEngineer || ''} onChange={(e) => setEditing({ ...editing, assignedEngineer: e.target.value })} /></Field>
              <Field label="Scheduled for"><input type="date" className={inputClass} value={dateInput(editing.scheduledFor)} onChange={(e) => setEditing({ ...editing, scheduledFor: e.target.value })} /></Field>
            </div>
            <Field label="Update note"><input className={inputClass} value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} placeholder="Replaced suction valve; flushed lines" /></Field>
            <Field label="Resolution notes"><textarea rows={3} className={inputClass} value={editing.resolutionNotes || ''} onChange={(e) => setEditing({ ...editing, resolutionNotes: e.target.value })} /></Field>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold uppercase text-slate-500 mb-2">History</div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {editing.updates?.map((u, i) => (
                  <li key={i}><span className="text-slate-200">{u.status}</span> — {u.note} <span className="text-slate-600">{formatDateTime(u.at)}</span></li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default Tickets;
