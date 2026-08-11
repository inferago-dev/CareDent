import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, FileText, Wrench, Download, Bell, User, LogOut, 
  CheckCircle2, Clock, FileDown, ShieldCheck, Search, Filter 
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';

export default function Portal() {
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  const mockUser = {
    name: "Dr. Sivakumar Ramesh",
    clinic: "Ramesh Multispecialty Dental Center",
    email: "jashvish.siva@gmail.com",
    phone: "+91 94441 53599",
    city: "Chennai, Tamil Nadu"
  };

  const portalOrders = [
    { id: 'ORD-99120', item: 'Gamma Overhanging Dental Chair', qty: 1, date: '02 Aug 2025', amount: '₹2,45,000', status: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'ORD-88210', item: 'Woodpecker Portable X-Ray Unit', qty: 2, date: '15 Jul 2025', amount: '₹1,15,000', status: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'ORD-77401', item: 'Class-B Vacuum Autoclave (18L)', qty: 1, date: '10 Jun 2025', amount: '₹85,000', status: 'Completed', color: 'bg-emerald-100 text-emerald-800' }
  ];

  const portalQuotations = [
    { id: 'QT-55410', product: 'Gamma Premium Chair (2 Units) + Compressor', date: '04 Aug 2025', validTill: '04 Sep 2025', status: 'Active Quote', amount: '₹4,90,000' },
    { id: 'QT-44102', product: 'Annual Maintenance Contract (3 Chairs)', date: '20 May 2025', validTill: '20 Jun 2025', status: 'Approved', amount: '₹35,000' }
  ];

  const portalServiceRequests = [
    { id: 'TKT-22910', equipment: 'Gamma Overhanging (Chair #1)', issue: 'Routine Annual AMC Check & Suction Flush', date: '06 Aug 2025', priority: 'Medium', status: 'Engineer Assigned' },
    { id: 'TKT-11029', equipment: 'Oil-Free Air Compressor', issue: 'Pressure Switch Adjustment', date: '12 Jan 2025', priority: 'Low', status: 'Resolved' }
  ];

  const portalInvoices = [
    { id: 'INV-2025-081', description: 'Supply & Installation of Gamma Chair', date: '02 Aug 2025', amount: '₹2,45,000', status: 'Paid' },
    { id: 'INV-2025-045', description: 'Spare Handpiece Replacement', date: '15 Jul 2025', amount: '₹12,500', status: 'Paid' }
  ];

  const portalDownloads = [
    { name: 'Gamma Overhanging Installation Manual.pdf', size: '4.2 MB', date: 'Aug 2025' },
    { name: 'Care Dent Warranty Certificate - CD88491.pdf', size: '1.1 MB', date: 'Aug 2025' },
    { name: 'Woodpecker Scaler Maintenance Guide.pdf', size: '2.8 MB', date: 'Jul 2025' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-64 bg-slate-900 text-white p-6 space-y-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-md">
            CD
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Customer Portal</h3>
            <span className="text-[11px] text-cyan-400 font-semibold">{mockUser.clinic}</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1 text-xs">
          <div className="font-bold text-white flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mockUser.name}</span>
          </div>
          <div className="text-slate-400">{mockUser.email}</div>
          <div className="text-cyan-300 font-mono text-[10px]">{mockUser.phone}</div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1 text-sm font-semibold">
          {[
            { id: 'orders', label: 'My Orders', icon: ShoppingBag, count: portalOrders.length },
            { id: 'quotations', label: 'Quotations', icon: FileText, count: portalQuotations.length },
            { id: 'service', label: 'Service Requests', icon: Wrench, count: portalServiceRequests.length },
            { id: 'invoices', label: 'Invoices', icon: FileDown, count: portalInvoices.length },
            { id: 'downloads', label: 'Downloads', icon: Download, count: portalDownloads.length },
            { id: 'notifications', label: 'Notifications', icon: Bell, count: 2 }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  active ? 'bg-white text-cyan-700' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <Link
            to="/login"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 max-w-6xl">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Active Orders</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{portalOrders.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Quotations</div>
            <div className="text-2xl font-bold text-cyan-600 mt-1">{portalQuotations.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Open Service Tickets</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">1</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">AMC Status</div>
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mt-2">Active till 2026</div>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div key="orders" className="space-y-4 animate-rise-in">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-bold text-slate-900">Your Equipment Orders</h3>
                <Link to="/products" className="text-xs font-bold text-cyan-600 hover:underline">+ Browse Products</Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Equipment</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Order Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portalOrders.map(o => (
                      <tr key={o.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-600">{o.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{o.item}</td>
                        <td className="py-3 px-4">{o.qty}</td>
                        <td className="py-3 px-4 text-slate-500">{o.date}</td>
                        <td className="py-3 px-4 font-bold">{o.amount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${o.color}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link to="/track-order" className="text-cyan-600 hover:underline font-bold">Track →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* QUOTATIONS TAB */}
          {activeTab === 'quotations' && (
            <div key="quotations" className="space-y-4 animate-rise-in">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-bold text-slate-900">Official Quotations</h3>
                <Link to="/quote" className="text-xs font-bold text-cyan-600 hover:underline">+ Request New Quote</Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase">
                      <th className="py-3 px-4">Quote ID</th>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Est. Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portalQuotations.map(q => (
                      <tr key={q.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-600">{q.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{q.product}</td>
                        <td className="py-3 px-4 text-slate-500">{q.date}</td>
                        <td className="py-3 px-4 font-bold">{q.amount}</td>
                        <td className="py-3 px-4">
                          <span className="bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => alert(`Downloading quotation PDF ${q.id}`)} className="text-cyan-600 hover:underline font-bold flex items-center gap-1 justify-end">
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SERVICE REQUESTS TAB */}
          {activeTab === 'service' && (
            <div key="service" className="space-y-4 animate-rise-in">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-bold text-slate-900">Service & Breakdown Tickets</h3>
                <Link to="/services/request" className="text-xs font-bold text-cyan-600 hover:underline">+ New Ticket</Link>
              </div>

              <div className="space-y-3">
                {portalServiceRequests.map(s => (
                  <div key={s.id} className="p-4 border rounded-2xl bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-600 text-xs">{s.id}</span>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">{s.status}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{s.equipment}</h4>
                      <p className="text-xs text-slate-600">{s.issue}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">{s.date}</span>
                      <button onClick={() => alert(`Ticket ${s.id} details`)} className="text-xs font-bold text-cyan-600 hover:underline">View Ticket Log →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INVOICES TAB */}
          {activeTab === 'invoices' && (
            <div key="invoices" className="space-y-4 animate-rise-in">
              <h3 className="text-xl font-bold text-slate-900 border-b pb-4">Billing & Invoices</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portalInvoices.map(inv => (
                      <tr key={inv.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-600">{inv.id}</td>
                        <td className="py-3 px-4 font-bold">{inv.description}</td>
                        <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                        <td className="py-3 px-4 font-bold">{inv.amount}</td>
                        <td className="py-3 px-4"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">{inv.status}</span></td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => alert(`Downloading Invoice ${inv.id}`)} className="text-cyan-600 font-bold hover:underline">Tax Invoice PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DOWNLOADS TAB */}
          {activeTab === 'downloads' && (
            <div key="downloads" className="space-y-4 animate-rise-in">
              <h3 className="text-xl font-bold text-slate-900 border-b pb-4">Manuals & Certificates</h3>
              <div className="space-y-2">
                {portalDownloads.map((d, i) => (
                  <div key={i} className="p-4 border rounded-xl flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <FileDown className="w-5 h-5 text-cyan-600" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{d.name}</div>
                        <div className="text-xs text-slate-400">{d.size} · Added {d.date}</div>
                      </div>
                    </div>
                    <button onClick={() => alert(`Downloading ${d.name}`)} className="bg-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div key="notifications" className="space-y-4 animate-rise-in">
              <h3 className="text-xl font-bold text-slate-900 border-b pb-4">Notifications & Reminders</h3>
              <div className="space-y-3">
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-cyan-800">Preventative AMC Inspection Scheduled</div>
                  <div className="text-xs text-cyan-700">Mr. Sivakumar’s team will visit your Mugalivakkam clinic on Aug 15 for regular lubrication and Dryco filter check.</div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-emerald-800">Warranty Registered Successfully</div>
                  <div className="text-xs text-emerald-700">Your Gamma Overhanging Chair warranty is active until August 2026.</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
