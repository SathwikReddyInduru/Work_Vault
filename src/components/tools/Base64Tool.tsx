// src/components/tools/Base64Tool.tsx
import { useClipboard } from '@/hooks/useClipboard';
import { ArrowDownUp, Check, Copy, Eraser } from 'lucide-react';
import React, { useState } from 'react';

type Mode = 'encode' | 'decode';

export const Base64Tool: React.FC = () => {
  const { copy } = useClipboard();
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const process = (value: string, m: Mode = mode) => {
    setInput(value);
    setError('');
    if (!value.trim()) { setOutput(''); return; }
    try {
      if (m === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(value))));
      } else {
        setOutput(decodeURIComponent(escape(atob(value.trim()))));
      }
    } catch {
      setError(m === 'decode' ? 'Invalid Base64 input' : 'Could not encode input');
      setOutput('');
    }
  };

  const switchMode = () => {
    const next: Mode = mode === 'encode' ? 'decode' : 'encode';
    setMode(next);
    // Swap input/output
    setInput(output);
    process(output, next);
  };

  const handleCopy = async () => {
    await copy(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(''); setOutput(''); setError(''); };

  const inputLabel = mode === 'encode' ? 'Plain text' : 'Base64 string';
  const outputLabel = mode === 'encode' ? 'Base64 encoded' : 'Decoded text';

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 gap-0.5">
          {(['encode', 'decode'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); process(input, m); }}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${mode === m ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {m}
            </button>
          ))}
        </div>
        {output && (
          <button
            onClick={switchMode}
            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            title="Swap input/output"
          >
            <ArrowDownUp size={12} /> Swap
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

      {/* Input */}
      <div>
        <label className="block text-xs text-slate-500 mb-1">{inputLabel}</label>
        <textarea
          value={input}
          onChange={(e) => process(e.target.value)}
          placeholder={mode === 'encode' ? 'Type or paste text to encode…' : 'Paste Base64 string to decode…'}
          rows={5}
          spellCheck={false}
          className={`w-full font-mono text-xs bg-slate-900 border rounded-xl px-3 py-2.5 text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors placeholder:text-slate-600 ${error ? 'border-red-500/50' : 'border-slate-700'}`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-500">{outputLabel}</label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="w-full font-mono text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-emerald-400 overflow-x-auto max-h-48 whitespace-pre-wrap break-words">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};