// src/components/tools/UuidGenerator.tsx
import { useClipboard } from '@/hooks/useClipboard';
import { Check, Copy, RefreshCw, Trash2 } from 'lucide-react';
import React, { useCallback, useState } from 'react';

const api = () => (window as any).electronAPI;

function localUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function getUUID(): Promise<string> {
  try {
    const res = await api().generateUUID();
    if (res.success && res.data) return res.data;
  } catch { /* fall through */ }
  return localUUID();
}

export const UuidGenerator: React.FC = () => {
  const { copy } = useClipboard();
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = useCallback(async () => {
    const generated = await Promise.all(Array.from({ length: count }, getUUID));
    setUuids((prev) => [...generated, ...prev].slice(0, 20));
  }, [count]);

  React.useEffect(() => { generate(); }, []);

  const handleCopy = async (uuid: string, idx: number) => {
    await copy(uuid);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAll = async () => {
    await copy(uuids.join('\n'));
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-slate-400 whitespace-nowrap">Generate</span>
          <input
            type="number" min={1} max={10} value={count}
            onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value))))}
            className="w-16 bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <span className="text-xs text-slate-400">at a time</span>
        </div>
        {uuids.length > 1 && (
          <button
            onClick={copyAll}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <Copy size={12} /> Copy all
          </button>
        )}
        {uuids.length > 0 && (
          <button
            onClick={() => setUuids([])}
            className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      <button
        onClick={generate}
        className="w-full py-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw size={15} />
        Generate UUID{count > 1 ? 's' : ''}
      </button>

      {/* UUID list */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {uuids.map((uuid, idx) => (
          <div
            key={uuid + idx}
            className="group flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 hover:border-slate-600 transition-colors"
          >
            <span className="font-mono text-sm text-slate-300 select-all">{uuid}</span>
            <button
              onClick={() => handleCopy(uuid, idx)}
              className="ml-3 p-1 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
            >
              {copiedIndex === idx
                ? <Check size={13} className="text-emerald-400" />
                : <Copy size={13} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};