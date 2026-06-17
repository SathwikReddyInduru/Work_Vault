// src/components/tools/JsonFormatter.tsx
import { useClipboard } from '@/hooks/useClipboard';
import { Check, Copy, Eraser, Maximize2, Minimize2 } from 'lucide-react';
import React, { useState } from 'react';

export const JsonFormatter: React.FC = () => {
  const { copy } = useClipboard();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const process = (minify: boolean) => {
    const trimmed = input.trim();
    if (!trimmed) { setOutput(''); setError(''); return; }
    try {
      const parsed = JSON.parse(trimmed);
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent));
      setError('');
    } catch (e: any) {
      setError(e.message ?? 'Invalid JSON');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    await copy(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(''); setOutput(''); setError(''); };

  return (
    <div className="flex flex-col h-full gap-3 min-h-0">

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => process(false)}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Maximize2 size={12} /> Format
        </button>
        <button
          onClick={() => process(true)}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 rounded-lg transition-colors"
        >
          <Minimize2 size={12} /> Minify
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Indent</span>
            <input
              type="number"
              min={1}
              max={8}
              value={indent}
              onChange={(e) => setIndent(Math.max(1, Math.min(8, Number(e.target.value) || 2)))}
              className="w-12 h-7 text-xs text-center bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          {output && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
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

      {/* Two-panel layout */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* Left — Input */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <label className="block text-xs text-slate-500 mb-1.5 flex-shrink-0">Input</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder="Paste JSON here…"
            spellCheck={false}
            className={`flex-1 min-h-0 w-full font-mono text-xs bg-slate-900 border rounded-xl px-3 py-2.5 text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors placeholder:text-slate-600 overflow-y-auto ${
              error ? 'border-red-500/50' : 'border-slate-700'
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-400 flex-shrink-0">{error}</p>}
        </div>

        {/* Right — Output */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <label className="text-xs text-slate-500 mb-1.5 flex-shrink-0">Output</label>
          <pre className={`flex-1 min-h-0 w-full font-mono text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 overflow-auto whitespace-pre-wrap break-words ${
            output ? 'text-emerald-400' : 'text-slate-600'
          }`}>
            {output || 'Output will appear here…'}
          </pre>
        </div>

      </div>
    </div>
  );
};