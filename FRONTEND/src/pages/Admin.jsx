import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Wrench, 
  CreditCard, BarChart3, Globe, Settings, TrendingUp, AlertCircle, 
  CheckCircle2, Plus, Edit, Trash2, Search, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../data/products';

export default function Admin() {
  const [adminTab, setAdminTab] = useState('dashboard');

  const adminOrders = [
    { id: 'ORD-99120', customer: 'Dr. A. Ramesh', product: 'Gamma Overhanging Chair', amount: '₹2,45,000', status: 'Delivered', date: 'Today' },
    { id: 'ORD-99121', customer: 'SmileCare Clinic', product: 'Gamma Premium Chair (2 Units)', amount: '₹4,90,000', status: 'Processing', date: 'Yesterday' },
    { id: 'ORD-99122', customer: 'Saveetha Hospital', product: 'Woodpecker X-Ray Unit', amount: '₹1,15,000', status: 'Pending Dispatch', date: '06 Aug 2025' }
  ];

  const adminServiceTickets = [
    { id: 'TKT-22910', clinic: 'Smile Care Hospital', issue: 'Suction Line Inspection', priority: 'High', status: 'Assigned (Eng. Sivakumar)' },
    { id: 'TKT-22911', clinic: 'Varma Dental', issue: 'LED Light Sensor Replacement', priority: 'Urgent', status: 'Pending Parts' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-lg">
            AD
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Care Dent Admin</h3>
            <span className="text-[11px] text-cyan-400 font-semibold">Master Management</span>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="space-y-1 text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products & Catalogue', icon: Package },
            { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingCart },
            { id: 'inventory', label: 'Inventory & Spares', icon: BarChart3 },
            { id: 'customers', label: 'Customers & Clinics', icon: Users },
            { id: 'quotations', label: 'Quotations', icon: FileText },
            { id: 'service-requests', label: 'Service Requests', icon: Wrench },
            { id: 'payments', label: 'Payments & Invoices', icon: CreditCard },
            { id: 'reports', label: 'Analytics Reports', icon: TrendingUp },
            { id: 'content', label: 'Website Content Manager', icon: Globe },
            { id: 'settings', label: 'Admin Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const active = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800">
          <Link to="/" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-2">
            <span>← Exit to Public Site</span>
          </Link>
        </div>
      </aside>

      {/* ADMIN MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
              ADMIN CONTROL PANEL
            </span>
            <h1 className="text-2xl font-bold text-white mt-2 capitalize">{adminTab.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => alert('Quick export triggered')} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700">
              Export Monthly Report
            </button>
            <button onClick={() => setAdminTab('products')} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow">
              + Add New Product
            </button>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {adminTab === 'dashboard' && (
          <div key="dashboard" className="space-y-8 animate-rise-in">
            
            {/* 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">New Quotation Requests</div>
                <div className="text-3xl font-extrabold text-cyan-400">14</div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +28% vs last month
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Open Service Requests</div>
                <div className="text-3xl font-extrabold text-amber-400">5</div>
                <div className="text-[11px] text-amber-400 font-semibold">2 Urgent Breakdowns</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Orders This Month</div>
                <div className="text-3xl font-extrabold text-emerald-400">22</div>
                <div className="text-[11px] text-slate-400">18 Delivered, 4 In Transit</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Revenue (Aug 2025)</div>
                <div className="text-3xl font-extrabold text-white">₹42.8L</div>
                <div className="text-[11px] text-cyan-400 font-semibold">On target</div>
              </div>
            </div>

            {/* Sales Trend Bar Visualizer */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Monthly Chair Sales & Revenue Trend
              </h3>
              <div className="h-40 flex items-end gap-4 pt-6 pb-2 border-b border-slate-800">
                {[
                  { m: 'Mar', val: 40 },
                  { m: 'Apr', val: 65 },
                  { m: 'May', val: 55 },
                  { m: 'Jun', val: 80 },
                  { m: 'Jul', val: 95 },
                  { m: 'Aug', val: 100 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      style={{ height: `${item.val}%` }}
                      className="w-full bg-cyan-600 rounded-t-lg hover:bg-cyan-500 transition-all relative group"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.val}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">{item.m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders & Tickets Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Orders Table */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-sm text-white">Recent Orders</h4>
                  <button onClick={() => setAdminTab('orders')} className="text-xs text-cyan-400 font-bold">View All →</button>
                </div>

                <div className="space-y-2">
                  {adminOrders.map(o => (
                    <div key={o.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{o.customer}</div>
                        <div className="text-slate-400">{o.product}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cyan-400">{o.amount}</div>
                        <span className="text-[10px] font-bold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Requests Table */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-sm text-white">Open Technical Tickets</h4>
                  <button onClick={() => setAdminTab('service-requests')} className="text-xs text-cyan-400 font-bold">View All →</button>
                </div>

                <div className="space-y-2">
                  {adminServiceTickets.map(t => (
                    <div key={t.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{t.clinic}</div>
                        <div className="text-slate-400">{t.issue}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold bg-amber-950 text-amber-400 px-2 py-0.5 rounded">{t.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB */}
        {adminTab === 'products' && (
          <div key="products" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 animate-rise-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Dental Chair Catalogue List</h3>
              <span className="text-xs text-slate-400">{DENTAL_CHAIRS.length} Active Chair Models</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 uppercase text-slate-500 font-bold">
                    <th className="py-3 px-4">Model Name</th>
                    <th className="py-3 px-4">Series</th>
                    <th className="py-3 px-4">Programs</th>
                    <th className="py-3 px-4">Optic Scaler</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {DENTAL_CHAIRS.map(c => (
                    <tr key={c.id} className="border-b border-slate-800/60 hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                      <td className="py-3 px-4 text-cyan-400 font-semibold">{c.series}</td>
                      <td className="py-3 px-4">{c.specifications[0]?.value || '6 Programs'}</td>
                      <td className="py-3 px-4">{c.keyDifferentiators[2] || 'Optic Scaler'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => alert(`Edit ${c.name}`)} className="text-cyan-400 font-bold hover:underline">Edit</button>
                        <button onClick={() => alert(`Delete ${c.name}`)} className="text-red-400 font-bold hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WEBSITE CONTENT EDITOR TAB */}
        {adminTab === 'content' && (
          <div key="content" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 animate-rise-in">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Live Website Content Manager</h3>
              <p className="text-xs text-slate-400">Update homepage hero headline, announcement bar, and testimonials without code.</p>
            </div>

            <div className="space-y-4 max-w-2xl text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Top Announcement Bar Text</label>
                <input
                  type="text"
                  defaultValue="30+ Years of Dental Industry Expertise — Pan-India Installation & AMC"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Homepage Hero Headline</label>
                <input
                  type="text"
                  defaultValue="Premium Dental Chairs & Clinical Solutions"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Hero Subheading</label>
                <textarea
                  rows={3}
                  defaultValue="Advanced Ergonomics & Clinical Excellence. Engineered for supreme clinician legroom, integrated optic scaling, zero-downtime reliability."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl"
                />
              </div>

              <button onClick={() => alert('Website Content Saved Successfully!')} className="bg-cyan-600 text-white font-bold py-2.5 px-6 rounded-xl shadow">
                Save Content Changes
              </button>
            </div>
          </div>
        )}

        {/* FALLBACK FOR OTHER TABS */}
        {['orders', 'inventory', 'customers', 'quotations', 'service-requests', 'payments', 'reports', 'settings'].includes(adminTab) && (
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center space-y-4">
            <h3 className="text-xl font-bold text-white capitalize">{adminTab.replace('-', ' ')} Control Panel</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Real-time records for {adminTab}. Manage entries, filter by date, or export spreadsheet reports.
            </p>
            <div className="pt-2">
              <button onClick={() => setAdminTab('dashboard')} className="bg-cyan-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl">
                Return to Dashboard Overview
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
