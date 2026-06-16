// src/components/tools/PasswordGenerator.tsx
import { useClipboard } from '@/hooks/useClipboard';
import { Check, Copy, RefreshCw, ShieldCheck } from 'lucide-react';
import React, { useCallback, useState } from 'react';

const api = () => (window as any).electronAPI;

function localGenerate(opts: {
  length: number; uppercase: boolean; lowercase: boolean;
  numbers: boolean; symbols: boolean;
}): string {
  let pool = '';
  if (opts.uppercase) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.lowercase) pool += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.numbers) pool += '0123456789';
  if (opts.symbols) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!pool) pool = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: opts.length }, () =>
    pool[Math.floor(Math.random() * pool.length)]
  ).join('');
}

function strengthLabel(pwd: string): { label: string; color: string; width: string } {
  const has = (re: RegExp) => re.test(pwd);
  const score =
    (pwd.length >= 12 ? 1 : 0) +
    (pwd.length >= 16 ? 1 : 0) +
    (has(/[A-Z]/) ? 1 : 0) +
    (has(/[a-z]/) ? 1 : 0) +
    (has(/[0-9]/) ? 1 : 0) +
    (has(/[^A-Za-z0-9]/) ? 1 : 0);
  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
  if (score <= 3) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' };
  if (score <= 4) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
  return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
}

export const PasswordGenerator: React.FC = () => {
  const { copy } = useClipboard();
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({
    uppercase: true, lowercase: true, numbers: true, symbols: false,
  });

  const generate = useCallback(async () => {
    try {
      const res = await api().generatePassword({ length, ...opts });
      if (res.success && res.data) { setPassword(res.data); return; }
    } catch { /* fall through to local */ }
    setPassword(localGenerate({ length, ...opts }));
  }, [length, opts]);

  React.useEffect(() => { generate(); }, []);

  const handleCopy = async () => {
    if (!password) return;
    await copy(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggle = (key: keyof typeof opts) =>
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }));

  const strength = password ? strengthLabel(password) : null;

  const checkboxClass = 'w-4 h-4 rounded border-slate-600 bg-slate-700 text-violet-500 focus:ring-violet-500/30 cursor-pointer';
  const labelCls = 'text-sm text-slate-300 select-none cursor-pointer';

  return (
    <div className="space-y-4">
      {/* Output */}
      <div className="relative">
        <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-24 font-mono text-sm text-slate-200 break-all min-h-[52px] leading-relaxed">
          {password || <span className="text-slate-600">Click generate…</span>}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            onClick={generate}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            title="Regenerate"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            title="Copy"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Strength bar */}
      {strength && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Strength</span>
            <span className="font-medium text-slate-300">{strength.label}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
          </div>
        </div>
      )}

      {/* Length slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Length</span>
          <span className="font-mono font-medium text-slate-200">{length}</span>
        </div>
        <input
          type="range" min={8} max={64} value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-violet-500 cursor-pointer"
        />
      </div>

      {/* Character options */}
      <div className="grid grid-cols-2 gap-2">
        {([
          ['uppercase', 'Uppercase (A–Z)'],
          ['lowercase', 'Lowercase (a–z)'],
          ['numbers', 'Numbers (0–9)'],
          ['symbols', 'Symbols (!@#…)'],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={opts[key]}
              onChange={() => toggle(key)}
              className={checkboxClass}
            />
            <span className={labelCls}>{label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={generate}
        className="w-full py-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <ShieldCheck size={15} />
        Generate Password
      </button>
    </div>
  );
};