import React, { useState } from 'react';
import { Search, Package, Clock, Truck, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';

const DEMO_ORDER = {
  id: 'ORD-99120',
  product: 'Gamma Overhanging Dental Chair',
  clinic: 'Ramesh Multispecialty Dental Center',
  status: 'Delivered'
};

const STEPS = [
  { label: 'Order Confirmed', icon: Package, date: '02 Aug 2025' },
  { label: 'Processing & QC', icon: Clock, date: '03 Aug 2025' },
  { label: 'Dispatched', icon: Truck, date: '05 Aug 2025' },
  { label: 'Out for Delivery', icon: MapPin, date: '08 Aug 2025' },
  { label: 'Delivered & Installed', icon: CheckCircle2, date: '08 Aug 2025' }
];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    const query = orderId.trim().toUpperCase();
    if (!query) return;
    setResult(query === DEMO_ORDER.id ? 'found' : 'not-found');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* HEADER + SEARCH */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24 sm:py-32">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
            Track Order
          </span>
          <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
            Where&apos;s your equipment right now?
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mt-6">
            Enter your order ID to see live status — from confirmation to certified installation.
          </p>

          <form onSubmit={handleTrack} className="mt-10 flex flex-col sm:flex-row items-stretch gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ORD-99120"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3.5 transition-all active:scale-[0.98] shrink-0"
            >
              Track Order
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-4">
            Try the demo order <span className="font-mono text-slate-300">{DEMO_ORDER.id}</span>
          </p>
        </div>
      </section>

      {/* RESULT */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {result === 'not-found' && (
            <div key="not-found" className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 animate-rise-in">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-medium text-slate-900">No order found for &quot;{orderId}&quot;</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Double-check your order ID from the confirmation email, or contact us directly for an update.
              </p>
              <a
                href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
              >
                Call {COMPANY_DETAILS.phoneNumbers[0]}
              </a>
            </div>
          )}

          {result === 'found' && (
            <div key="found" className="space-y-8 animate-rise-in">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Order {DEMO_ORDER.id}</div>
                  <div className="text-lg font-medium text-slate-900">{DEMO_ORDER.product}</div>
                  <div className="text-sm text-slate-500 mt-1">{DEMO_ORDER.clinic}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {DEMO_ORDER.status}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                {STEPS.map((step, idx) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                        <step.icon className="w-4 h-4" />
                      </div>
                      {idx < STEPS.length - 1 && <div className="w-px flex-1 bg-cyan-200 my-1" />}
                    </div>
                    <div className={idx < STEPS.length - 1 ? 'pb-8' : ''}>
                      <div className="font-medium text-slate-900 text-sm">{step.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!result && (
            <div className="text-center text-sm text-slate-400 py-10">
              Enter an order ID above to see its live tracking status.
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
