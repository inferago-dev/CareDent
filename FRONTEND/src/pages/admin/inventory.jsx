import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { adminApi } from '../../lib/api';
import { Spinner } from '../../components/ui';
import { formatCurrency } from '../../lib/format';
import { Btn, DataTable, Field, Modal, Td, inputClass } from '../../components/admin/AdminBits';
import { ErrorLine, ListShell } from './shared';
import { stockTone } from './helpers';

const STOCK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low' },
  { id: 'out', label: 'Out of stock' },
];

function Inventory({ notify }) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [state, setState] = useState('all');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, reload } = useFetch(
    (signal) => adminApi.inventory({ q: debounced || undefined, state: state !== 'all' ? state : undefined }, { signal }),
    [debounced, state]
  );

  const items = data?.data || [];
  const summary = data?.summary;

  // Quick +1 / -1 for goods received or a unit going out by hand.
  const nudge = async (product, delta) => {
    setBusyId(product._id);
    try {
      await adminApi.adjustStock(product._id, { delta });
      reload();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.adjustStock(editing._id, {
        stock: Number(editing.stock),
        lowStockThreshold: Number(editing.lowStockThreshold),
        reorderQuantity: Number(editing.reorderQuantity),
        note: editing.note || undefined,
      });
      notify(`${editing.name} stock updated`);
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryTile label="SKUs" value={summary.skus} />
          <SummaryTile label="Units on hand" value={summary.unitsOnHand} />
          <SummaryTile label="Low stock" value={summary.lowStock} tone={summary.lowStock ? 'text-amber-400' : undefined} />
          <SummaryTile label="Out of stock" value={summary.outOfStock} tone={summary.outOfStock ? 'text-red-400' : undefined} />
          <SummaryTile label="Stock value" value={formatCurrency(summary.stockValue)} small />
        </div>
      )}

      <ListShell
        title="Inventory"
        subtitle="Stock is deducted automatically when an order is confirmed, and restored if it is cancelled"
        search={search} setSearch={setSearch}
        loading={loading} error={error} reload={reload}
        action={
          <div className="flex items-center gap-1 rounded-lg bg-slate-950 border border-slate-700 p-1">
            {STOCK_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setState(f.id)}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                  state === f.id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        <DataTable head={['Product', 'Category', 'On hand', 'Reorder at', 'Adjust', '']} empty="No products match.">
          {items.map((p) => (
            <tr key={p._id}>
              <Td>
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{p.slug}</div>
              </Td>
              <Td>{p.category}</Td>
              <Td>
                <span className={`text-base font-bold ${stockTone(p)}`}>{p.stock}</span>
                {p.stock <= 0 && <span className="ml-2 text-[10px] font-bold uppercase text-red-400">Out</span>}
                {p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 2) && (
                  <span className="ml-2 text-[10px] font-bold uppercase text-amber-400">Low</span>
                )}
              </Td>
              <Td>{p.lowStockThreshold}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <Btn variant="ghost" disabled={busyId === p._id || p.stock <= 0} onClick={() => nudge(p, -1)} title="Remove one">
                    <Minus className="w-3.5 h-3.5" />
                  </Btn>
                  <Btn variant="ghost" disabled={busyId === p._id} onClick={() => nudge(p, 1)} title="Add one">
                    <Plus className="w-3.5 h-3.5" />
                  </Btn>
                </div>
              </Td>
              <Td>
                <div className="flex justify-end">
                  <Btn variant="ghost" onClick={() => { setEditing({ ...p, note: '' }); setFormError(null); }}>
                    Set count
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </ListShell>

      <Modal
        open={Boolean(editing)} onClose={() => setEditing(null)}
        title={editing ? `Stock · ${editing.name}` : ''}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? <Spinner className="w-3.5 h-3.5 text-white" /> : 'Save'}</Btn></>}
      >
        {editing && (
          <>
            {formError && <ErrorLine message={formError} />}
            <Field label="Units on hand" hint="Absolute count — use this after a physical stock check.">
              <input type="number" min="0" className={inputClass} value={editing.stock}
                onChange={(e) => setEditing({ ...editing, stock: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Reorder at" hint="Flags as low at or below this.">
                <input type="number" min="0" className={inputClass} value={editing.lowStockThreshold}
                  onChange={(e) => setEditing({ ...editing, lowStockThreshold: e.target.value })} />
              </Field>
              <Field label="Suggested order qty">
                <input type="number" min="0" className={inputClass} value={editing.reorderQuantity}
                  onChange={(e) => setEditing({ ...editing, reorderQuantity: e.target.value })} />
              </Field>
            </div>
            <Field label="Note">
              <input className={inputClass} value={editing.note} placeholder="Stock check 14 Aug, 2 damaged in transit"
                onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
            </Field>
          </>
        )}
      </Modal>
    </div>
  );
}

function SummaryTile({ label, value, tone = 'text-white', small = false }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`${small ? 'text-lg' : 'text-2xl'} font-bold ${tone} mt-2`}>{value}</div>
    </div>
  );
}

export default Inventory;
