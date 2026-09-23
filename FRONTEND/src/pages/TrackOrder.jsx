import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Clock, Truck, MapPin, CheckCircle2, XCircle, Wrench, FileText, Phone, ArrowUpRight } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import { publicApi } from '../lib/api';
import { Spinner, StatusPill } from '../components/ui';
import { formatDate, formatDateTime } from '../lib/format';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import Reveal from '../components/Reveal';
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

// Declared once: the same array feeds the visible breadcrumb and the
// BreadcrumbList markup, so the two can never disagree.
const BREADCRUMB_TRAIL = [{ name: 'Home', path: '/' }, { name: 'Track Order', path: '/track-order' }];

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
        schema={breadcrumbSchema(BREADCRUMB_TRAIL)}
      />

      {/* HEADER + SEARCH */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative container-page max-w-3xl text-center">
          <Reveal>
            <Breadcrumbs trail={BREADCRUMB_TRAIL} align="center" />
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Track
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              Where&apos;s your equipment right now?
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mt-6">
              Enter the reference from your confirmation to see live status — from order
              confirmation through to certified installation.
            </p>
          </Reveal>

          <Reveal delay={180} y={16}>
          {/* Mode switch */}
          <div className="mt-10 inline-flex flex-wrap justify-center rounded-full border border-white/10 bg-white/5 p-1 text-sm font-medium">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => switchMode(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  mode === id ? 'bg-white text-blue-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleTrack}
            className="mt-5 max-w-xl mx-auto flex items-center gap-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 p-1.5 pl-5 focus-within:border-cyan-400 focus-within:bg-white/10 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              aria-label={`${active.label} reference`}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={active.placeholder}
              className="flex-1 min-w-0 bg-transparent py-2.5 text-white text-sm placeholder:text-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={state.status === 'loading' || !reference.trim()}
              className="group inline-flex items-center gap-3 rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm py-1.5 pl-5 pr-1.5 transition-all active:scale-[0.98] shrink-0"
            >
              <span>Track</span>
              <span className="w-8 h-8 rounded-full bg-white text-blue-950 flex items-center justify-center">
                {state.status === 'loading' ? (
                  <Spinner className="w-4 h-4 text-blue-950" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </span>
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-4">
            The reference is in your confirmation email — or sign in to the{' '}
            <Link to="/portal" className="text-slate-300 hover:text-cyan-400 transition-colors">customer portal</Link>{' '}
            to see everything at once.
          </p>
          </Reveal>
        </div>
      </section>

      {/* RESULT */}
      <section className="section-y">
        <div className="container-page max-w-3xl">

          {state.status === 'idle' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MODES.map(({ id, label, placeholder, icon: Icon }, idx) => (
                <Reveal key={id} delay={idx * 80} y={24}>
                <button
                  type="button"
                  onClick={() => switchMode(id)}
                  className={`group w-full h-full text-left bg-white border rounded-2xl p-6 space-y-4 transition-all duration-500 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 ${
                    mode === id ? 'border-cyan-300' : 'border-slate-200'
                  }`}
                >
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    mode === id ? 'bg-cyan-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 group-hover:text-cyan-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="block">
                    <span className="block font-medium text-slate-900">{label}</span>
                    <span className="block text-sm text-slate-500 mt-1">Reference looks like {placeholder.replace('e.g. ', '')}</span>
                  </span>
                </button>
                </Reveal>
              ))}
            </div>
          )}

          {state.status === 'loading' && (
            <div className="flex justify-center py-10"><Spinner className="w-7 h-7 text-cyan-600" /></div>
          )}

          {state.status === 'error' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-5 animate-rise-in">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl tracking-tighter font-medium text-blue-950">
                  Nothing found for &quot;{reference.toUpperCase()}&quot;
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto">{state.message}</p>
              </div>
              <a
                href={COMPANY_DETAILS.phoneHrefs[0]}
                className="inline-flex items-center gap-2 rounded-full bg-blue-950 hover:bg-blue-900 text-white font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
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
    <div className="bg-blue-950 text-white rounded-2xl p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3">{label}</div>
        <div className="text-2xl sm:text-3xl tracking-tighter font-medium leading-[1.15] break-words">{title}</div>
        {subtitle && <div className="text-sm text-slate-400 mt-2">{subtitle}</div>}
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
    <div className="bg-white border border-slate-200 rounded-2xl p-7 sm:p-8">
      <div className="text-xs uppercase tracking-widest text-slate-400 mb-6">Status history</div>
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
    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
      <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
      <div className="text-slate-900 font-medium mt-1 text-sm">{value}</div>
    </div>
  );
}
