import React, { useState } from 'react';
import { Search, Package, Clock, Truck, MapPin, CheckCircle2, XCircle, Wrench, FileText } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import { publicApi } from '../lib/api';
import { Spinner, StatusPill, formatDate, formatDateTime } from '../components/ui';
import Seo from '../components/Seo';
import { breadcrumbSchema } from '../lib/seo';
import { metaFor } from '../lib/pageMeta';

const MODES = [
  { id: 'order', label: 'Order', placeholder: 'e.g. ORD-000001', icon: Package },
  { id: 'service', label: 'Service Request', placeholder: 'e.g. TKT-000001', icon: Wrench },
  { id: 'quote', label: 'Quotation', placeholder: 'e.g. CD-QT-000001', icon: FileText },
];

const STEP_ICON = {
  'Pending Confirmation': Clock,
  Confirmed: CheckCircle2,
  Processing: Clock,
  'Pending Dispatch': Package,
  Dispatched: Truck,
  'Installation Scheduled': MapPin,
  Delivered: CheckCircle2,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

export default function TrackOrder() {
  const [mode, setMode] = useState('order');
  const [reference, setReference] = useState('');
  const [state, setState] = useState({ status: 'idle' }); // idle | loading | found | error

  const active = MODES.find((m) => m.id === mode);

  const handleTrack = async (e) => {
    e.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) return;

    setState({ status: 'loading' });
    try {
      const res =
        mode === 'order' ? await publicApi.trackOrder(ref)
        : mode === 'service' ? await publicApi.trackService(ref)
        : await publicApi.trackQuote(ref);
      setState({ status: 'found', data: res.data });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  };

  const switchMode = (id) => {
    setMode(id);
    setState({ status: 'idle' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/track-order')}
        schema={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Track Order', path: '/track-order' }])}
      />

      {/* HEADER + SEARCH */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24 sm:py-32">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
            Track
          </span>
          <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
            Where&apos;s your equipment right now?
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mt-6">
            Enter the reference from your confirmation to see live status — from order
            confirmation through to certified installation.
          </p>

          {/* Mode switch */}
          <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-medium">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => switchMode(m.id)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  mode === m.id ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleTrack} className="mt-6 flex flex-col sm:flex-row items-stretch gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={active.placeholder}
                className="w-full pl-11 pr-4 py-3.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={state.status === 'loading' || !reference.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-3.5 transition-all active:scale-[0.98] shrink-0"
            >
              {state.status === 'loading' ? <Spinner className="w-4 h-4 text-white" /> : 'Track'}
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-4">
            The reference is in your confirmation email — or sign in to the{' '}
            <a href="/portal" className="text-slate-300 hover:text-cyan-400 transition-colors">customer portal</a>{' '}
            to see everything at once.
          </p>
        </div>
      </section>

      {/* RESULT */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {state.status === 'idle' && (
            <div className="text-center text-sm text-slate-400 py-10">
              Enter a reference above to see its live status.
            </div>
          )}

          {state.status === 'loading' && (
            <div className="flex justify-center py-10"><Spinner className="w-7 h-7 text-cyan-600" /></div>
          )}

          {state.status === 'error' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 animate-rise-in">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-medium text-slate-900">Nothing found for &quot;{reference.toUpperCase()}&quot;</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">{state.message}</p>
              <a
                href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
              >
                Call {COMPANY_DETAILS.phoneNumbers[0]}
              </a>
            </div>
          )}

          {state.status === 'found' && mode === 'order' && <OrderResult data={state.data} />}
          {state.status === 'found' && mode === 'service' && <ServiceResult data={state.data} />}
          {state.status === 'found' && mode === 'quote' && <QuoteResult data={state.data} />}

        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, title, subtitle, status }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-lg font-medium text-slate-900 break-words">{title}</div>
        {subtitle && <div className="text-sm text-slate-500 mt-1">{subtitle}</div>}
      </div>
      <StatusPill status={status} className="w-fit shrink-0" />
    </div>
  );
}

function Timeline({ entries, currentStatus }) {
  if (!entries?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-sm text-slate-500 text-center">
        No status updates recorded yet. Current status: <strong>{currentStatus}</strong>.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
      {entries.map((entry, idx) => {
        const Icon = STEP_ICON[entry.status] || CheckCircle2;
        const isLast = idx === entries.length - 1;
        return (
          <div key={`${entry.status}-${entry.at}-${idx}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isLast ? 'bg-cyan-600 text-white' : 'bg-cyan-100 text-cyan-700'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-cyan-200 my-1" />}
            </div>
            <div className={isLast ? '' : 'pb-8'}>
              <div className="font-medium text-slate-900 text-sm">{entry.status}</div>
              {entry.note && <div className="text-sm text-slate-600 mt-0.5">{entry.note}</div>}
              <div className="text-xs text-slate-400 mt-0.5">
                {formatDateTime(entry.at)}{entry.by ? ` · ${entry.by}` : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderResult({ data }) {
  return (
    <div className="space-y-8 animate-rise-in">
      <SummaryCard
        label={`Order ${data.reference}`}
        title={data.items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ')}
        subtitle={data.customer}
        status={data.status}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Fact label="Placed on" value={formatDate(data.placedOn)} />
        <Fact label="Expected" value={formatDate(data.expectedDelivery)} />
        <Fact label="Installation" value={formatDate(data.installationDate)} />
        <Fact label="Engineer" value={data.assignedEngineer || '—'} />
      </div>

      <Timeline entries={data.timeline} currentStatus={data.status} />
    </div>
  );
}

function ServiceResult({ data }) {
  return (
    <div className="space-y-8 animate-rise-in">
      <SummaryCard
        label={`Service request ${data.reference}`}
        title={data.equipment}
        subtitle={`Priority: ${data.priority}`}
        status={data.status}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <Fact label="Logged on" value={formatDate(data.createdAt)} />
        <Fact label="Scheduled" value={formatDate(data.scheduledFor)} />
        <Fact label="Engineer" value={data.assignedEngineer || 'To be assigned'} />
      </div>
      <Timeline entries={data.updates} currentStatus={data.status} />
    </div>
  );
}

function QuoteResult({ data }) {
  return (
    <div className="space-y-8 animate-rise-in">
      <SummaryCard
        label={`Quotation ${data.reference}`}
        title={`${data.product}${data.quantity > 1 ? ` ×${data.quantity}` : ''}`}
        status={data.status}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <Fact label="Requested on" value={formatDate(data.createdAt)} />
        <Fact
          label="Quoted amount"
          value={data.quotedAmount ? `₹${data.quotedAmount.toLocaleString('en-IN')}` : 'Being prepared'}
        />
        <Fact label="Valid till" value={formatDate(data.validTill)} />
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
      <div className="text-[11px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className="text-slate-900 font-medium mt-1 text-sm">{value}</div>
    </div>
  );
}
