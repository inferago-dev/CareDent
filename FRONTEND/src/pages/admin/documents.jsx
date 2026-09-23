import { useState } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { adminApi, fileUrl } from '../../lib/api';
import { Spinner } from '../../components/ui';
import { formatDate } from '../../lib/format';
import { Btn, DataTable, Td } from '../../components/admin/AdminBits';
import { ListShell } from './shared';

function Documents({ notify }) {
  const { data, loading, error, reload } = useFetch((signal) => adminApi.documents({ signal }), []);
  const [uploading, setUploading] = useState(false);
  const items = data?.data || [];

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name);
    fd.append('category', 'Manual');
    fd.append('isPublic', 'true');

    setUploading(true);
    try {
      await adminApi.uploadDocument(fd);
      notify('Document uploaded');
      reload();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    try {
      await adminApi.deleteDocument(doc._id);
      notify('Document deleted');
      reload();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <ListShell
      title="Documents" subtitle="Manuals, brochures and warranty certificates"
      loading={loading} error={error} reload={reload}
      action={
        <label className="inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer transition-colors">
          {uploading ? <Spinner className="w-3.5 h-3.5 text-white" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{uploading ? 'Uploading…' : 'Upload'}</span>
          <input type="file" accept="application/pdf,image/*" className="hidden" onChange={upload} disabled={uploading} />
        </label>
      }
    >
      <DataTable head={['Title', 'Category', 'Size', 'Visibility', 'Uploaded', '']} empty="No documents uploaded yet.">
        {items.map((doc) => (
          <tr key={doc._id}>
            <Td className="text-white font-semibold">{doc.title}</Td>
            <Td>{doc.category}</Td>
            <Td>{doc.fileSize ? `${(doc.fileSize / 1048576).toFixed(1)} MB` : '—'}</Td>
            <Td>{doc.isPublic ? 'Public' : (doc.user?.name || 'Private')}</Td>
            <Td>{formatDate(doc.createdAt)}</Td>
            <Td>
              <div className="flex items-center gap-1.5 justify-end">
                <a
                  href={fileUrl(doc.fileUrl)}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <Btn variant="danger" onClick={() => remove(doc)}><Trash2 className="w-3.5 h-3.5" /></Btn>
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
    </ListShell>
  );
}

export default Documents;
