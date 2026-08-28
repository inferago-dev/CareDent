import { useState } from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Spinner } from '../../components/ui';
import { Btn, DataTable, Field, Modal, Td, inputClass } from '../../components/admin/AdminBits';
import { ListShell } from './shared';
import { stockTone, useAdminList } from './helpers';

const EMPTY_PRODUCT = {
  slug: '', name: '', tagline: '', kind: 'chair', category: 'Dental Chairs',
  series: '', brand: 'Care Dent', badge: '', description: '', heroImage: '',
  keyDifferentiators: '', sortOrder: 0,
};

function Products({ notify }) {
  const { items, loading, error, reload, search, setSearch } = useAdminList(adminApi.products);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...editing,
        sortOrder: Number(editing.sortOrder) || 0,
        keyDifferentiators: String(editing.keyDifferentiators || '')
          .split('\n').map((s) => s.trim()).filter(Boolean),
      };
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;

      if (editing._id) await adminApi.updateProduct(editing._id, payload);
      else await adminApi.createProduct(payload);

      notify(editing._id ? 'Product updated' : 'Product created');
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const archive = async (p) => {
    if (!window.confirm(`Archive "${p.name}"? It will disappear from the public catalogue.`)) return;
    try {
      await adminApi.deleteProduct(p._id);
      notify('Product archived');
      reload();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <>
      <ListShell
        title="Catalogue"
        subtitle="Everything shown on the public products page"
        search={search} setSearch={setSearch}
        loading={loading} error={error} reload={reload}
        action={<Btn onClick={() => { setEditing({ ...EMPTY_PRODUCT }); setFormError(null); }}><Plus className="w-3.5 h-3.5" /> New product</Btn>}
      >
        <DataTable head={['Name', 'Kind', 'Category', 'Stock', 'Order', 'Live', '']} empty="No products found.">
          {items.map((p) => (
            <tr key={p._id}>
              <Td>
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{p.slug}</div>
              </Td>
              <Td className="capitalize">{p.kind}</Td>
              <Td>{p.category}</Td>
              <Td><span className={`font-bold ${stockTone(p)}`}>{p.stock ?? 0}</span></Td>
              <Td>{p.sortOrder}</Td>
              <Td>
                <span className={`text-[11px] font-bold ${p.isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {p.isActive ? 'Live' : 'Archived'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5 justify-end">
                  <Btn variant="ghost" onClick={() => {
                    setEditing({ ...p, keyDifferentiators: (p.keyDifferentiators || []).join('\n') });
                    setFormError(null);
                  }}>Edit</Btn>
                  {p.isActive && <Btn variant="danger" onClick={() => archive(p)}><Trash2 className="w-3.5 h-3.5" /></Btn>}
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </ListShell>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?._id ? `Edit ${editing.name}` : 'New product'}
        wide
        footer={
          <>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Save'}</Btn>
          </>
        }
      >
        {editing && (
          <>
            {formError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200">{formError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name"><input className={inputClass} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Slug" hint="URL segment, e.g. gamma-premium">
                <input className={inputClass} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </Field>
              <Field label="Kind">
                <select className={inputClass} value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value })}>
                  <option value="chair">Dental chair</option>
                  <option value="equipment">Equipment</option>
                </select>
              </Field>
              <Field label="Category"><input className={inputClass} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
              <Field label="Series"><input className={inputClass} value={editing.series || ''} onChange={(e) => setEditing({ ...editing, series: e.target.value })} /></Field>
              <Field label="Brand"><input className={inputClass} value={editing.brand || ''} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} /></Field>
              <Field label="Badge"><input className={inputClass} value={editing.badge || ''} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} /></Field>
              <Field label="Sort order"><input type="number" className={inputClass} value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value })} /></Field>
            </div>
            <Field label="Tagline"><input className={inputClass} value={editing.tagline || ''} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} /></Field>
            <Field label="Hero image URL" hint="Public path such as /products/gamma.jpg, or a full URL">
              <input className={inputClass} value={editing.heroImage || ''} onChange={(e) => setEditing({ ...editing, heroImage: e.target.value })} />
            </Field>
            <Field label="Description"><textarea rows={4} className={inputClass} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
            <Field label="Key features" hint="One per line">
              <textarea rows={6} className={inputClass} value={editing.keyDifferentiators} onChange={(e) => setEditing({ ...editing, keyDifferentiators: e.target.value })} />
            </Field>
          </>
        )}
      </Modal>
    </>
  );
}

export default Products;
