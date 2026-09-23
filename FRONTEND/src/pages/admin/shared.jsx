import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { LoadingBlock, ErrorBlock } from '../../components/ui';
import { Panel, Btn } from '../../components/admin/AdminBits';

/* The chrome every admin list screen is built from. */

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

function ErrorLine({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <p className="text-xs text-red-200">{message}</p>
    </div>
  );
}

export { ListShell, ErrorLine };
