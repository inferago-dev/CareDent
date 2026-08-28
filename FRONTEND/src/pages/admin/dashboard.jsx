import useFetch from '../../hooks/useFetch';
import { AlertTriangle, Boxes, CreditCard, FileText, Mail, Package, ShoppingCart, TrendingUp, Users, Wrench } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { ErrorBlock, LoadingBlock, StatusPill } from '../../components/ui';
import { formatCurrency } from '../../lib/format';
import { Btn, DataTable, Panel, Td } from '../../components/admin/AdminBits';

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

export default Dashboard;
