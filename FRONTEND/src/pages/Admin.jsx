import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Wrench,
  CreditCard, Globe, Boxes, Mail, ShieldCheck, LogOut, ExternalLink,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/admin/AdminBits';
import Seo from '../components/Seo';

import Dashboard from './admin/dashboard';
import Products from './admin/products';
import Inventory from './admin/inventory';
import Orders from './admin/orders';
import Quotations from './admin/quotations';
import Tickets from './admin/tickets';
import Invoices from './admin/invoices';
import Customers from './admin/customers';
import Messages from './admin/messages';
import Documents from './admin/documents';

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
      <Seo title="Admin" noindex />

      {/*
        SIDEBAR

        Same story as the portal: `w-full` on a phone put ten menu items above
        the first row of data. Below lg the menu is one horizontally scrolling
        strip; the vertical sidebar returns at lg.
      */}
      <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-white">Care Dent Admin</h3>
              <span className="text-[11px] text-cyan-400 font-semibold truncate block">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <Link
              to="/"
              aria-label="Exit to public site"
              className="p-2.5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="p-2.5 rounded-lg text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav
          aria-label="Admin sections"
          className="flex lg:block gap-2 lg:gap-0 lg:space-y-1 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 lg:pb-0 text-xs font-semibold"
        >
          {MENU.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 lg:w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left whitespace-nowrap ${
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

        <div className="hidden lg:block pt-4 border-t border-slate-800 space-y-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
            ← Exit to public site
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
              Admin control panel
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">{active?.label}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
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
