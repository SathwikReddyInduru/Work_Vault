// src/components/tools/DiffChecker.tsx
import { Check, Copy, Eraser } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useClipboard } from '@/hooks/useClipboard';

type DiffType = 'equal' | 'added' | 'removed';

interface DiffLine {
  type: DiffType;
  text: string;
  leftLine: number | null;
  rightLine: number | null;
}

function computeDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');

  // Myers diff — simple LCS-based line diff
  const m = leftLines.length;
  const n = rightLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const result: DiffLine[] = [];
  let i = m, j = n;
  let leftLine = m, rightLine = n;

  const ops: Array<{ type: DiffType; left: string | null; right: string | null }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      ops.unshift({ type: 'equal', left: leftLines[i - 1], right: rightLines[j - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: 'added', left: null, right: rightLines[j - 1] });
      j--;
    } else {
      ops.unshift({ type: 'removed', left: leftLines[i - 1], right: null });
      i--;
    }
  }

  let lNum = 1, rNum = 1;
  for (const op of ops) {
    if (op.type === 'equal') {
      result.push({ type: 'equal', text: op.left!, leftLine: lNum++, rightLine: rNum++ });
    } else if (op.type === 'removed') {
      result.push({ type: 'removed', text: op.left!, leftLine: lNum++, rightLine: null });
    } else {
      result.push({ type: 'added', text: op.right!, leftLine: null, rightLine: rNum++ });
    }
  }

  return result;
}

const LINE_COLORS: Record<DiffType, string> = {
  equal:   'text-slate-400',
  added:   'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500/50',
  removed: 'bg-red-500/10 text-red-300 border-l-2 border-red-500/50',
};

const LINE_NUM_COLORS: Record<DiffType, string> = {
  equal:   'text-slate-600',
  added:   'text-emerald-600',
  removed: 'text-red-600',
};

const PREFIX: Record<DiffType, string> = {
  equal:   ' ',
  added:   '+',
  removed: '-',
};

export const DiffChecker: React.FC = () => {
  const { copy } = useClipboard();
  const [left, setLeft]   = useState('');
  const [right, setRight] = useState('');
  const [copied, setCopied] = useState(false);
  const [view, setView]   = useState<'unified' | 'split'>('unified');

  const diff = useMemo(() => {
    if (!left && !right) return [];
    return computeDiff(left, right);
  }, [left, right]);

  const stats = useMemo(() => ({
    added:   diff.filter(d => d.type === 'added').length,
    removed: diff.filter(d => d.type === 'removed').length,
  }), [diff]);

  const hasChanges = stats.added > 0 || stats.removed > 0;

  const handleCopy = async () => {
    const text = diff.map(d => `${PREFIX[d.type]} ${d.text}`).join('\n');
    await copy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setLeft(''); setRight(''); };

  const textareaClass =
    'flex-1 w-full min-h-0 font-mono text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors placeholder:text-slate-600 overflow-y-auto';

  return (
    <div className="flex flex-col h-full gap-3 min-h-0">

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
          {(['unified', 'split'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 capitalize transition-colors ${
                view === v
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Stats */}
        {(left || right) && (
          <div className="flex items-center gap-2 text-xs">
            {stats.added > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono">
                +{stats.added}
              </span>
            )}
            {stats.removed > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 font-mono">
                -{stats.removed}
              </span>
            )}
            {!hasChanges && (left || right) && (
              <span className="text-slate-500">No differences</span>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {diff.length > 0 && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy diff'}
            </button>
          )}
          <button
            onClick={clear}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            title="Clear"
          >
            <Eraser size={13} />
          </button>
        </div>
      </div>

      {/* Input panes */}
      <div className="flex gap-3 flex-shrink-0" style={{ height: '160px' }}>
        <div className="flex flex-col flex-1 min-w-0">
          <label className="text-xs text-slate-500 mb-1.5">Original</label>
          <textarea
            value={left}
            onChange={e => setLeft(e.target.value)}
            placeholder="Paste original text here…"
            spellCheck={false}
            className={textareaClass}
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <label className="text-xs text-slate-500 mb-1.5">Changed</label>
          <textarea
            value={right}
            onChange={e => setRight(e.target.value)}
            placeholder="Paste changed text here…"
            spellCheck={false}
            className={textareaClass}
          />
        </div>
      </div>

      {/* Diff output */}
      {diff.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col">
          <label className="text-xs text-slate-500 mb-1.5 flex-shrink-0">Diff</label>

          {view === 'unified' ? (
            <div className="flex-1 min-h-0 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl">
              <table className="w-full font-mono text-xs border-collapse">
                <tbody>
                  {diff.map((line, idx) => (
                    <tr key={idx} className={LINE_COLORS[line.type]}>
                      <td className={`select-none w-8 text-right pr-2 pl-2 py-0.5 border-r border-slate-800 ${LINE_NUM_COLORS[line.type]}`}>
                        {line.leftLine ?? ''}
                      </td>
                      <td className={`select-none w-8 text-right pr-2 pl-2 py-0.5 border-r border-slate-800 ${LINE_NUM_COLORS[line.type]}`}>
                        {line.rightLine ?? ''}
                      </td>
                      <td className={`select-none w-4 text-center py-0.5 border-r border-slate-800 font-bold ${LINE_NUM_COLORS[line.type]}`}>
                        {PREFIX[line.type]}
                      </td>
                      <td className="px-3 py-0.5 whitespace-pre-wrap break-all">{line.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex gap-2 flex-1 min-h-0">
              {/* Left pane — removed + equal */}
              <div className="flex-1 min-w-0 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl">
                <table className="w-full font-mono text-xs border-collapse">
                  <tbody>
                    {diff
                      .filter(d => d.type !== 'added')
                      .map((line, idx) => (
                        <tr key={idx} className={line.type === 'removed' ? LINE_COLORS.removed : LINE_COLORS.equal}>
                          <td className={`select-none w-8 text-right pr-2 pl-2 py-0.5 border-r border-slate-800 ${LINE_NUM_COLORS[line.type]}`}>
                            {line.leftLine}
                          </td>
                          <td className="px-3 py-0.5 whitespace-pre-wrap break-all">{line.text}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {/* Right pane — added + equal */}
              <div className="flex-1 min-w-0 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl">
                <table className="w-full font-mono text-xs border-collapse">
                  <tbody>
                    {diff
                      .filter(d => d.type !== 'removed')
                      .map((line, idx) => (
                        <tr key={idx} className={line.type === 'added' ? LINE_COLORS.added : LINE_COLORS.equal}>
                          <td className={`select-none w-8 text-right pr-2 pl-2 py-0.5 border-r border-slate-800 ${LINE_NUM_COLORS[line.type]}`}>
                            {line.rightLine}
                          </td>
                          <td className="px-3 py-0.5 whitespace-pre-wrap break-all">{line.text}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
