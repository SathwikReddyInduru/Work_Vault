// src/components/layout/GlobalSearch.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { AppWindow, CheckSquare, Database, FileText, Globe, Link2, Search, X } from 'lucide-react';

const api = () => (window as any).electronAPI;

type ResultKind = 'website' | 'application' | 'note' | 'link' | 'task' | 'db';

interface SearchResult {
  id: number;
  kind: ResultKind;
  label: string;
  sub: string;
  route: string;
}

const KIND_META: Record<ResultKind, { icon: React.ReactNode; color: string; heading: string }> = {
  website:     { icon: <Globe size={13} />,       color: 'text-blue-400',    heading: 'Websites' },
  application: { icon: <AppWindow size={13} />,   color: 'text-purple-400',  heading: 'Applications' },
  note:        { icon: <FileText size={13} />,    color: 'text-amber-400',   heading: 'Notes' },
  link:        { icon: <Link2 size={13} />,       color: 'text-emerald-400', heading: 'Quick Links' },
  task:        { icon: <CheckSquare size={13} />, color: 'text-rose-400',    heading: 'Tasks' },
  db:          { icon: <Database size={13} />,    color: 'text-cyan-400',    heading: 'DB Connections' },
};

const KIND_ORDER: ResultKind[] = ['website', 'application', 'note', 'link', 'task', 'db'];

async function fetchAll(): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  try {
    const [websites, apps, notes, links, tasks, dbs] = await Promise.allSettled([
      api().getWebsites(), api().getApplications(), api().getNotes(),
      api().getLinks(), api().getTasks(), api().getDbConnections(),
    ]);
    if (websites.status === 'fulfilled' && websites.value?.success)
      for (const w of websites.value.data ?? [])
        results.push({ id: w.id, kind: 'website', label: w.name, sub: w.url ?? '', route: '/websites' });
    if (apps.status === 'fulfilled' && apps.value?.success)
      for (const a of apps.value.data ?? [])
        results.push({ id: a.id, kind: 'application', label: a.name, sub: a.environment ?? '', route: '/applications' });
    if (notes.status === 'fulfilled' && notes.value?.success)
      for (const n of notes.value.data ?? [])
        results.push({ id: n.id, kind: 'note', label: n.title, sub: n.category ?? '', route: '/notes' });
    if (links.status === 'fulfilled' && links.value?.success)
      for (const l of links.value.data ?? [])
        results.push({ id: l.id, kind: 'link', label: l.title, sub: l.url ?? '', route: '/links' });
    if (tasks.status === 'fulfilled' && tasks.value?.success)
      for (const t of tasks.value.data ?? [])
        results.push({ id: t.id, kind: 'task', label: t.name, sub: t.status.replace('_', ' '), route: '/tasks' });
    if (dbs.status === 'fulfilled' && dbs.value?.success)
      for (const d of dbs.value.data ?? [])
        results.push({ id: d.id, kind: 'db', label: d.name, sub: d.user_schema ?? '', route: '/db-connections' });
  } catch { /* no electron */ }
  return results;
}

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [allItems, setAllItems] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchAll().then(setAllItems); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allItems.filter((i) => i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)).slice(0, 30);
  }, [allItems, query]);

  const grouped = useMemo(() => {
    const map = new Map<ResultKind, SearchResult[]>();
    for (const item of filtered) { if (!map.has(item.kind)) map.set(item.kind, []); map.get(item.kind)!.push(item); }
    return KIND_ORDER.filter((k) => map.has(k)).map((k) => ({ kind: k, items: map.get(k)! }));
  }, [filtered]);

  const close = useCallback(() => { setOpen(false); setQuery(''); setActiveIdx(0); }, []);

  const go = useCallback((result: SearchResult) => { navigate(result.route); close(); }, [navigate, close]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIdx(0);
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter')     { e.preventDefault(); go(filtered[activeIdx]); }
    if (e.key === 'Escape')    { close(); }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node) || dropRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const showDropdown = open && query.trim().length > 0;
  let flatIdx = -1;

  return (
    <>
      <div ref={wrapRef} className="flex-1 max-w-md relative flex items-center">
        <Search size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim()) setOpen(true); }}
          placeholder="Search everything..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-8 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
        {query && (
          <button onClick={close} className="absolute right-2.5 text-slate-500 hover:text-slate-300 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {showDropdown && createPortal(
        <div ref={dropRef} style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
          className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {grouped.length === 0
            ? <p className="px-4 py-5 text-xs text-slate-500 text-center">No results for "{query}"</p>
            : <div className="max-h-[420px] overflow-y-auto py-1">
                {grouped.map(({ kind, items }) => {
                  const meta = KIND_META[kind];
                  return (
                    <div key={kind}>
                      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                        <span className={clsx('flex-shrink-0', meta.color)}>{meta.icon}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{meta.heading}</span>
                      </div>
                      {items.map((item) => {
                        flatIdx++;
                        const idx = flatIdx;
                        return (
                          <button key={`${item.kind}-${item.id}`} onClick={() => go(item)} onMouseEnter={() => setActiveIdx(idx)}
                            className={clsx('w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                              activeIdx === idx ? 'bg-slate-700/70' : 'hover:bg-slate-700/40')}>
                            <span className={clsx('flex-shrink-0', meta.color)}>{meta.icon}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-medium text-slate-200 truncate">{item.label}</span>
                              {item.sub && <span className="block text-[10px] text-slate-500 truncate">{item.sub}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
          }
        </div>,
        document.body
      )}
    </>
  );
};