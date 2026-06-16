// src/components/tools/JsonFormatter.tsx
import { useClipboard } from '@/hooks/useClipboard';
import { isValidJSON } from '@/utils/validators';
import { Check, Copy, Eraser, Maximize2, Minimize2 } from 'lucide-react';
import React, { useState } from 'react';

export const JsonFormatter: React.FC = () => {
  const { copy } = useClipboard();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const format = () => {
    const trimmed = input.trim();
    if (!trimmed) { setOutput(''); setError(''); return; }
    try {
      const parsed = JSON.parse(trimmed);
      setOutput(JSON.stringify(parsed, null, indent));
      setError('');
    } catch (e: any) {
      setError(e.message ?? 'Invalid JSON');
      setOutput('');
    }
  };

  const minify = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    try {
      const parsed = JSON.parse(trimmed);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e: any) {
      setError(e.message ?? 'Invalid JSON');
    }
  };

  const handleCopy = async () => {
    await copy(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(''); setOutput(''); setError(''); };

  const valid = input.trim() && isValidJSON(input.trim());

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={format}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Maximize2 size={12} /> Format
        </button>
        <button
          onClick={minify}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 rounded-lg transition-colors"
        >
          <Minimize2 size={12} /> Minify
        </button>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-slate-500">Indent</span>
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`w-7 h-7 text-xs rounded-lg transition-colors ${indent === n ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={clear}
          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          title="Clear"
        >
          <Eraser size={13} />
        </button>
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs text-slate-500 mb-1">Input</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          placeholder='Paste JSON here…'
          rows={7}
          spellCheck={false}
          className={`w-full font-mono text-xs bg-slate-900 border rounded-xl px-3 py-2.5 text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors placeholder:text-slate-600 ${error ? 'border-red-500/50' : 'border-slate-700'}`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-500">Output</label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="w-full font-mono text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-emerald-400 overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};