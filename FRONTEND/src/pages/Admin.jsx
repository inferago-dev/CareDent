import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Wrench,
  CreditCard, Globe, TrendingUp, Plus, Trash2, Search,
  ShieldCheck, LogOut, RefreshCw, Mail, Download, Upload, AlertCircle,
  Boxes, Minus, AlertTriangle,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { adminApi, BASE_URL } from '../lib/api';
import {
  LoadingBlock, ErrorBlock, StatusPill, formatCurrency, formatDate, formatDateTime, Spinner,
} from '../components/ui';
import { Panel, DataTable, Td, Btn, Field, inputClass, Modal, Toast } from '../components/admin/AdminBits';

const FILE_ROOT = BASE_URL.replace(/\/api$/, '');

const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products & Catalogue', icon: Package },
  { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
  { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingCart },
  { id: 'quotations', label: 'Quotations', icon: FileText },
  { id: 'service-requests', label: 'Service Requests', icon: Wrench },
  { id: 'invoices', label: 'Invoices & Payments', icon: CreditCard },
  { id: 'customers', label: 'Customers & Clinics', icon: Users },
  { id: 'messages', label: 'Website Enquiries', icon: Mail },
  { id: 'documents', label: 'Documents', icon: Globe },
];

const ORDER_STATUSES = [
  'Pending Confirmation', 'Confirmed', 'Processing', 'Pending Dispatch',
  'Dispatched', 'Installation Scheduled', 'Delivered', 'Completed', 'Cancelled',
];
const TICKET_STATUSES = [
  'Open', 'Acknowledged', 'Engineer Assigned', 'Pending Parts', 'In Progress',
  'Resolved', 'Closed', 'Cancelled',
];
const QUOTE_STATUSES = ['New', 'In Review', 'Quoted', 'Approved', 'Rejected', 'Expired'];

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const notify = useCallback((message, tone = 'ok') => setToast({ message, tone }), []);

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const active = MENU.find((m) => m.id === tab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">

      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-lg">
            AD
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-white">Care Dent Admin</h3>
            <span className="text-[11px] text-cyan-400 font-semibold truncate block">{user?.name}</span>
          </div>
        </div>

        <nav className="space-y-1 text-xs font-semibold">
          {MENU.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800 space-y-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
            ← Exit to public site
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
              Admin control panel
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">{active?.label}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Signed in as {user?.email}</span>
          </div>
        </div>

        {tab === 'dashboard' && <Dashboard onJump={setTab} />}
        {tab === 'products' && <Products notify={notify} />}
        {tab === 'inventory' && <Inventory notify={notify} />}
        {tab === 'orders' && <Orders notify={notify} />}
        {tab === 'quotations' && <Quotations notify={notify} />}
        {tab === 'service-requests' && <Tickets notify={notify} />}
        {tab === 'invoices' && <Invoices notify={notify} />}
        {tab === 'customers' && <Customers notify={notify} />}
        {tab === 'messages' && <Messages notify={notify} />}
        {tab === 'documents' && <Documents notify={notify} />}
      </main>

      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}

/* ============================== dashboard ============================== */

function Dashboard({ onJump }) {
  const { data, loading, error, reload } = useFetch((signal) => adminApi.dashboard({ signal }), []);

  if (loading) return <LoadingBlock label="Loading dashboard…" dark />;
  if (error) return <ErrorBlock error={error} onRetry={reload} dark />;

  const { stats, recentOrders, recentQuotes, recentTickets, lowStockItems = [] } = data.data;

  const cards = [
    { label: 'Customers', value: stats.customers, tab: 'customers', icon: Users },
    { label: 'Products live', value: stats.products, tab: 'products', icon: Package },
    { label: 'Open orders', value: stats.ordersOpen, sub: `${stats.ordersTotal} total`, tab: 'orders', icon: ShoppingCart },
    { label: 'New quote requests', value: stats.quotesNew, tab: 'quotations', icon: FileText },
    { label: 'Open service tickets', value: stats.ticketsOpen, tab: 'service-requests', icon: Wrench },
    { label: 'Unread enquiries', value: stats.messagesNew, tab: 'messages', icon: Mail },
    { label: 'Low stock', value: stats.lowStock, tab: 'inventory', icon: AlertTriangle },
    { label: 'Out of stock', value: stats.outOfStock, tab: 'inventory', icon: Boxes },
    { label: 'Collected', value: formatCurrency(stats.revenueCollected), tab: 'invoices', icon: TrendingUp, small: true },
    { label: 'Billed', value: formatCurrency(stats.revenueBilled), tab: 'invoices', icon: CreditCard, small: true },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => onJump(c.tab)}
              className="text-left bg-slate-900 border border-slate-800 hover:border-cyan-700 rounded-2xl p-5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{c.label}</span>
                <Icon className="w-4 h-4 text-slate-600" />
              </div>
              <div className={`${c.small ? 'text-lg' : 'text-2xl'} font-bold text-white mt-2`}>{c.value}</div>
              {c.sub && <div className="text-[11px] text-slate-500 mt-0.5">{c.sub}</div>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="Latest orders" action={<Btn variant="ghost" onClick={() => onJump('orders')}>View all</Btn>}>
          <DataTable head={['Ref', 'Customer', 'Amount', 'Status']} empty="No orders yet.">
            {recentOrders.map((o) => (
              <tr key={o._id}>
                <Td className="font-mono text-cyan-400">{o.reference}</Td>
                <Td>{o.clinicName || o.customerName}</Td>
                <Td>{formatCurrency(o.totalAmount)}</Td>
                <Td><StatusPill status={o.status} /></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel title="Latest quote requests" action={<Btn variant="ghost" onClick={() => onJump('quotations')}>View all</Btn>}>
          <DataTable head={['Ref', 'Clinic', 'Product', 'Status']} empty="No quote requests yet.">
            {recentQuotes.map((q) => (
              <tr key={q._id}>
                <Td className="font-mono text-cyan-400">{q.reference}</Td>
                <Td>{q.clinicName || q.name}</Td>
                <Td>{q.product}</Td>
                <Td><StatusPill status={q.status} /></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      {lowStockItems.length > 0 && (
        <Panel
          title="Needs reordering"
          subtitle="At or below the reorder point"
          action={<Btn variant="ghost" onClick={() => onJump('inventory')}>Manage stock</Btn>}
        >
          <DataTable head={['Product', 'On hand', 'Reorder at', 'Suggested order']} empty="Nothing to reorder.">
            {lowStockItems.map((p) => (
              <tr key={p._id}>
                <Td className="text-white font-semibold">{p.name}</Td>
                <Td><span className={p.stock <= 0 ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>{p.stock}</span></Td>
                <Td>{p.lowStockThreshold}</Td>
                <Td>{p.reorderQuantity || '—'}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      <Panel title="Open service tickets" action={<Btn variant="ghost" onClick={() => onJump('service-requests')}>View all</Btn>}>
        <DataTable head={['Ref', 'Clinic', 'Equipment', 'Priority', 'Engineer', 'Status']} empty="No open tickets. ">
          {recentTickets.map((t) => (
            <tr key={t._id}>
              <Td className="font-mono text-cyan-400">{t.reference}</Td>
              <Td>{t.clinicName || '—'}</Td>
              <Td>{t.equipment}</Td>
              <Td>{t.priority}</Td>
              <Td>{t.assignedEngineer || '—'}</Td>
              <Td><StatusPill status={t.status} /></Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}

/* ============================== shared list shell ============================== */

function ListShell({ title, subtitle, search, setSearch, action, loading, error, reload, children }) {
  return (
    <Panel
      title={title}
      subtitle={subtitle}
      action={
        <div className="flex items-center gap-2">
          {setSearch && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 outline-none w-40"
              />
            </div>
          )}
          <Btn variant="ghost" onClick={reload} title="Refresh"><RefreshCw className="w-3.5 h-3.5" /></Btn>
          {action}
        </div>
      }
    >
      {loading && <LoadingBlock label="Loading…" dark />}
      {error && <ErrorBlock error={error} onRetry={reload} dark />}
      {!loading && !error && children}
    </Panel>
  );
}

/** Shared list state: search box + reload, wired to an admin endpoint. */
function useAdminList(endpoint, deps = []) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const state = useFetch(
    (signal) => endpoint({ q: debounced || undefined, limit: 100 }, { signal }),
    [debounced, ...deps]
  );

  return { ...state, search, setSearch, items: state.data?.data || [] };
}

/* ============================== products ============================== */

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

/* ============================== inventory ============================== */

const STOCK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low' },
  { id: 'out', label: 'Out of stock' },
];

function stockTone(p) {
  if (p.stock <= 0) return 'text-red-400';
  if (p.stock <= (p.lowStockThreshold ?? 2)) return 'text-amber-400';
  return 'text-emerald-400';
}

function Inventory({ notify }) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [state, setState] = useState('all');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  React.useEffect(() => {
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

/* ============================== orders ============================== */

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

/* ============================== quotations ============================== */

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
                {QUOTE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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

/* ============================== service tickets ============================== */

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
        title="Service requests" subtitle="Breakdowns, AMC visits and installations"
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
              <div><span className="text-slate-500">Equipment:</span> <span className="text-slate-200">{editing.equipment}</span>{editing.serialNumber ? ` (${editing.serialNumber})` : ''}</div>
              <div><span className="text-slate-500">Issue:</span> {editing.issue}</div>
              <div><span className="text-slate-500">Contact:</span> {editing.contactName} · {editing.phone}</div>
              {editing.address && <div><span className="text-slate-500">Address:</span> {editing.address}</div>}
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

/* ============================== invoices ============================== */

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

/* ============================== customers ============================== */

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

/* ============================== messages ============================== */

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

/* ============================== documents ============================== */

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
                  href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `${FILE_ROOT}${doc.fileUrl}`}
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

/* ============================== helpers ============================== */

function ErrorLine({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <p className="text-xs text-red-200">{message}</p>
    </div>
  );
}

/** Mongo dates arrive as ISO strings; <input type="date"> wants YYYY-MM-DD. */
function dateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}
