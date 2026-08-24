import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, FileText, Wrench, Download, User, LogOut,
  FileDown, RefreshCw, ExternalLink, Mail, Check,
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { portalApi, authApi, BASE_URL } from '../lib/api';
import Seo from '../components/Seo';
import {
  LoadingBlock, ErrorBlock, EmptyBlock, StatusPill, FieldError, formatCurrency, formatDate,
} from '../components/ui';

const FILE_ROOT = BASE_URL.replace(/\/api$/, '');
const fileUrl = (path) => (path?.startsWith('http') ? path : `${FILE_ROOT}${path}`);

export default function Portal() {
  const [activeTab, setActiveTab] = useState('orders');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error, reload } = useFetch((signal) => portalApi.overview({ signal }), []);

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const d = data?.data;
  const orders = d?.orders || [];
  const quotations = d?.quotations || [];
  const tickets = d?.tickets || [];
  const invoices = d?.invoices || [];
  const documents = d?.documents || [];
  const messages = d?.messages || [];
  const stats = d?.stats;

  const TABS = [
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, count: orders.length },
    { id: 'quotations', label: 'Quotations', icon: FileText, count: quotations.length },
    { id: 'service', label: 'Service Requests', icon: Wrench, count: tickets.length },
    { id: 'messages', label: 'My Enquiries', icon: Mail, count: messages.length },
    { id: 'invoices', label: 'Invoices', icon: FileDown, count: invoices.length },
    { id: 'downloads', label: 'Downloads', icon: Download, count: documents.length },
    { id: 'account', label: 'My Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row">
      <Seo title="Customer Portal" noindex />

      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 bg-blue-950 text-white p-6 space-y-8 shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-md">
            CD
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base leading-tight">Customer Portal</h3>
            <span className="text-xs text-cyan-400 font-semibold truncate block">
              {user?.clinicName || COMPANY_DETAILS.name}
            </span>
          </div>
        </Link>

        <button
          onClick={() => setActiveTab('account')}
          className="w-full text-left p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 space-y-1 text-xs transition-colors"
          title="Manage your account"
        >
          <div className="font-bold text-white flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">{user?.name}</span>
          </div>
          <div className="text-slate-400 truncate">{user?.email}</div>
          {user?.phone && <div className="text-cyan-300 font-mono text-[10px]">{user.phone}</div>}
        </button>

        <nav className="space-y-1 text-sm font-semibold">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    active ? 'bg-white text-cyan-700' : 'bg-white/10 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/10 space-y-1">
          <Link to="/" className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <ExternalLink className="w-4 h-4" />
            <span>Back to website</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 max-w-6xl">

        {loading && <LoadingBlock label="Loading your account…" />}
        {error && <ErrorBlock error={error} onRetry={reload} />}

        {!loading && !error && d && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
                <p className="text-sm text-slate-500 mt-1">Everything Care Dent has on file for your clinic.</p>
              </div>
              <button
                onClick={reload}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-cyan-700 transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Orders" value={stats.orders} />
              <Stat label="Active quotations" value={stats.activeQuotes} tone="text-cyan-600" />
              <Stat label="Open service tickets" value={stats.openTickets} tone="text-amber-600" />
              <Stat label="Outstanding" value={formatCurrency(stats.outstanding)} tone={stats.outstanding > 0 ? 'text-red-600' : 'text-emerald-600'} small />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">

              {activeTab === 'orders' && (
                <Section title="Your equipment orders" action={<Link to="/products" className="text-xs font-bold text-cyan-600 hover:underline">+ Browse products</Link>}>
                  {orders.length === 0 ? (
                    <EmptyBlock title="No orders yet" description="Once you place an order it will appear here with live tracking." action={<Link to="/products" className="text-sm font-medium text-cyan-700 hover:underline">Browse the catalogue</Link>} />
                  ) : (
                    <Table head={['Order ID', 'Equipment', 'Qty', 'Ordered', 'Amount', 'Status', '']}>
                      {orders.map((o) => (
                        <tr key={o._id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-cyan-600">{o.reference}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{o.items.map((i) => i.name).join(', ')}</td>
                          <td className="py-3 px-4">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(o.createdAt)}</td>
                          <td className="py-3 px-4 font-bold">{formatCurrency(o.totalAmount)}</td>
                          <td className="py-3 px-4"><StatusPill status={o.status} /></td>
                          <td className="py-3 px-4 text-right">
                            <Link to="/track-order" className="text-cyan-600 hover:underline font-bold">Track →</Link>
                          </td>
                        </tr>
                      ))}
                    </Table>
                  )}
                </Section>
              )}

              {activeTab === 'quotations' && (
                <Section title="Official quotations">
                  {quotations.length === 0 ? (
                    <EmptyBlock title="No quotations yet" description="Request a quote from any product page and it will show up here." />
                  ) : (
                    <Table head={['Reference', 'Product', 'Qty', 'Requested', 'Valid till', 'Amount', 'Status']}>
                      {quotations.map((q) => (
                        <tr key={q._id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-cyan-600">{q.reference}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{q.product}</td>
                          <td className="py-3 px-4">{q.quantity}</td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(q.createdAt)}</td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(q.validTill)}</td>
                          <td className="py-3 px-4 font-bold">{q.quotedAmount ? formatCurrency(q.quotedAmount) : '—'}</td>
                          <td className="py-3 px-4"><StatusPill status={q.status} /></td>
                        </tr>
                      ))}
                    </Table>
                  )}
                </Section>
              )}

              {activeTab === 'service' && (
                <Section title="Service requests" action={<Link to="/services#book-service" className="text-xs font-bold text-cyan-600 hover:underline">+ Book a visit</Link>}>
                  {tickets.length === 0 ? (
                    <EmptyBlock title="No service requests" description="Log a breakdown or a site visit and track the engineer's progress here." action={<Link to="/services#book-service" className="text-sm font-medium text-cyan-700 hover:underline">Book a service visit</Link>} />
                  ) : (
                    <Table head={['Ticket', 'Equipment', 'Issue', 'Logged', 'Priority', 'Status']}>
                      {tickets.map((t) => (
                        <tr key={t._id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-cyan-600">{t.reference}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{t.equipment}</td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{t.issue}</td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(t.createdAt)}</td>
                          <td className="py-3 px-4">{t.priority}</td>
                          <td className="py-3 px-4"><StatusPill status={t.status} /></td>
                        </tr>
                      ))}
                    </Table>
                  )}
                </Section>
              )}

              {activeTab === 'invoices' && (
                <Section title="Invoices &amp; payments">
                  {invoices.length === 0 ? (
                    <EmptyBlock title="No invoices yet" description="Invoices are published here as soon as they are raised." />
                  ) : (
                    <Table head={['Invoice', 'Description', 'Issued', 'Due', 'Amount', 'Paid', 'Status']}>
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-cyan-600">{inv.reference}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{inv.description || '—'}</td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(inv.issuedOn)}</td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(inv.dueOn)}</td>
                          <td className="py-3 px-4 font-bold">{formatCurrency(inv.amount)}</td>
                          <td className="py-3 px-4">{formatCurrency(inv.amountPaid)}</td>
                          <td className="py-3 px-4"><StatusPill status={inv.status} /></td>
                        </tr>
                      ))}
                    </Table>
                  )}
                </Section>
              )}

              {activeTab === 'messages' && (
                <Section title="Your enquiries" action={<Link to="/contact" className="text-xs font-bold text-cyan-600 hover:underline">+ New enquiry</Link>}>
                  {messages.length === 0 ? (
                    <EmptyBlock title="No enquiries yet" description="Messages you send from the Contact page will appear here, along with our reply." action={<Link to="/contact" className="text-sm font-medium text-cyan-700 hover:underline">Contact Care Dent</Link>} />
                  ) : (
                    <div className="space-y-4">
                      {messages.map((m) => (
                        <div key={m._id} className="border border-slate-200 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold text-slate-900">{m.subject || 'General Enquiry'}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{formatDate(m.createdAt)}</div>
                            </div>
                            <StatusPill status={m.status} />
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{m.message}</p>
                          {m.adminReply?.message && (
                            <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 space-y-1">
                              <div className="text-[11px] font-bold uppercase tracking-wide text-cyan-700">
                                Care Dent replied · {formatDate(m.adminReply.sentAt)}
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{m.adminReply.message}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {activeTab === 'account' && <AccountSettings user={user} />}

              {activeTab === 'downloads' && (
                <Section title="Manuals &amp; documents">
                  {documents.length === 0 ? (
                    <EmptyBlock title="No documents yet" description="Installation manuals and warranty certificates appear here after handover." />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {documents.map((doc) => (
                        <a
                          key={doc._id}
                          href={fileUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">{doc.title}</div>
                            <div className="text-xs text-slate-500">
                              {doc.category} · {doc.fileSize ? `${(doc.fileSize / 1048576).toFixed(1)} MB` : ''} · {formatDate(doc.createdAt)}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </Section>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, tone = 'text-slate-900', small = false }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-xs font-bold text-slate-400 uppercase">{label}</div>
      <div className={`${small ? 'text-lg' : 'text-2xl'} font-bold ${tone} mt-1`}>{value}</div>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="space-y-4 animate-rise-in">
      <div className="flex items-center justify-between border-b pb-4 gap-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function AccountSettings({ user }) {
  const { updateProfile } = useAuth();
  const inputClass =
    'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:bg-slate-50 disabled:text-slate-500';

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    clinicName: user?.clinicName || '',
    city: user?.city || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSaving(false);
    }
  };

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwFieldErrors, setPwFieldErrors] = useState({});

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwFieldErrors({});
    setPwSaved(false);
    if (pw.newPassword !== pw.confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      setPwError(err.message);
      setPwFieldErrors(err.fieldErrors || {});
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <Section title="Profile details">
        <form onSubmit={saveProfile} className="space-y-4 max-w-xl">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Name</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <FieldError message={fieldErrors.name} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email</label>
              <input className={inputClass} value={user?.email || ''} disabled title="Contact Care Dent to change your email" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Phone</label>
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <FieldError message={fieldErrors.phone} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Clinic name</label>
              <input className={inputClass} value={form.clinicName} onChange={(e) => setForm({ ...form, clinicName: e.target.value })} />
              <FieldError message={fieldErrors.clinicName} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">City</label>
              <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <FieldError message={fieldErrors.city} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Clinic address</label>
            <textarea rows={2} className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <FieldError message={fieldErrors.address} />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-blue-950 hover:bg-cyan-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="text-sm text-emerald-600 font-medium inline-flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </Section>

      <Section title="Change password">
        <form onSubmit={changePassword} className="space-y-4 max-w-xl">
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Current password</label>
            <input type="password" className={inputClass} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
            <FieldError message={pwFieldErrors.currentPassword} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">New password</label>
              <input type="password" className={inputClass} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
              <FieldError message={pwFieldErrors.newPassword} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Confirm new password</label>
              <input type="password" className={inputClass} value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={pwSaving}
              className="inline-flex items-center gap-2 rounded-full bg-blue-950 hover:bg-cyan-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors disabled:opacity-50"
            >
              {pwSaving ? 'Updating…' : 'Update password'}
            </button>
            {pwSaved && (
              <span className="text-sm text-emerald-600 font-medium inline-flex items-center gap-1">
                <Check className="w-4 h-4" /> Updated
              </span>
            )}
          </div>
        </form>
      </Section>
    </div>
  );
}

function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase">
            {head.map((h, i) => (
              <th key={i} className={`py-3 px-4 ${i === head.length - 1 && !h ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
