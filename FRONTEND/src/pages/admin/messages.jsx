import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Spinner, StatusPill } from '../../components/ui';
import { formatDate, formatDateTime } from '../../lib/format';
import { Btn, DataTable, Field, Modal, Td, inputClass } from '../../components/admin/AdminBits';
import { ListShell } from './shared';
import { useAdminList } from './helpers';

function Messages({ notify }) {
  const { items, loading, error, reload } = useAdminList(adminApi.messages);
  const [open, setOpen] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const setStatus = async (m, status) => {
    try {
      await adminApi.updateMessage(m._id, { status });
      notify(`Marked as ${status.toLowerCase()}`);
      setOpen(null);
      reload();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await adminApi.replyMessage(open._id, replyText.trim());
      notify(`Reply emailed to ${open.email}`);
      setReplyText('');
      setOpen(null);
      reload();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const remove = async (m) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await adminApi.deleteMessage(m._id);
      notify('Enquiry deleted');
      setOpen(null);
      reload();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <>
      <ListShell title="Website enquiries" subtitle="Messages from the contact form" loading={loading} error={error} reload={reload}>
        <DataTable head={['Received', 'From', 'Subject', 'Message', 'Status', '']} empty="No enquiries yet.">
          {items.map((m) => (
            <tr key={m._id}>
              <Td>{formatDate(m.createdAt)}</Td>
              <Td><div className="text-white font-semibold">{m.name}</div><div className="text-[11px] text-slate-500">{m.email}</div></Td>
              <Td>{m.subject}</Td>
              <Td className="max-w-xs"><div className="truncate">{m.message}</div></Td>
              <Td><StatusPill status={m.status} /></Td>
              <Td><div className="flex justify-end"><Btn variant="ghost" onClick={() => setOpen(m)}>Open</Btn></div></Td>
            </tr>
          ))}
        </DataTable>
      </ListShell>

      <Modal
        open={Boolean(open)} onClose={() => { setOpen(null); setReplyText(''); }} title={open ? `Enquiry from ${open.name}` : ''}
        footer={
          open && (
            <>
              <Btn variant="danger" onClick={() => remove(open)}><Trash2 className="w-3.5 h-3.5" /> Delete</Btn>
              <Btn variant="ghost" onClick={() => setStatus(open, 'Archived')}>Archive</Btn>
              <Btn onClick={sendReply} disabled={sending || !replyText.trim()}>
                {sending ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Send reply'}
              </Btn>
            </>
          )
        }
      >
        {open && (
          <>
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 text-xs text-slate-400 space-y-1">
              <div><span className="text-slate-500">Email:</span> <a className="text-cyan-400 hover:underline" href={`mailto:${open.email}`}>{open.email}</a></div>
              {open.phone && <div><span className="text-slate-500">Phone:</span> <a className="text-cyan-400 hover:underline" href={`tel:${open.phone}`}>{open.phone}</a></div>}
              <div><span className="text-slate-500">Subject:</span> {open.subject}</div>
              <div><span className="text-slate-500">Received:</span> {formatDateTime(open.createdAt)}</div>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{open.message}</p>

            {open.adminReply?.message && (
              <div className="rounded-lg bg-cyan-950/30 border border-cyan-900/50 p-4 text-xs space-y-1">
                <div className="text-cyan-400 font-semibold uppercase tracking-wide text-[10px]">
                  Last reply sent {formatDateTime(open.adminReply.sentAt)}
                </div>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{open.adminReply.message}</p>
              </div>
            )}

            <Field label="Reply" hint="Emails the customer directly and mentions we'll also call to follow up.">
              <textarea
                rows={4}
                className={inputClass}
                placeholder="Thanks for reaching out — we've received your enquiry and..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </Field>
          </>
        )}
      </Modal>
    </>
  );
}

export default Messages;
