// src/components/tools/JwtDecoder.tsx
import { useClipboard } from '@/hooks/useClipboard';
import { AlertTriangle, Check, CheckCircle2, Clock, Copy, Eraser } from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ── helpers ───────────────────────────────────────────────────────────────────

function base64UrlDecode(str: string): string {
  // Convert base64url → base64, then decode
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '=='.slice((base64.length % 4) || 4);
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
}

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: { header: string; payload: string; signature: string };
}

type DecodeResult =
  | { ok: true; data: DecodedJwt }
  | { ok: false; error: string };

function decodeJwt(token: string): DecodeResult {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { ok: false, error: 'A JWT must have exactly 3 parts separated by dots.' };
  }
  try {
    const header  = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return {
      ok: true,
      data: {
        header,
        payload,
        signature: parts[2],
        raw: { header: parts[0], payload: parts[1], signature: parts[2] },
      },
    };
  } catch {
    return { ok: false, error: 'Failed to decode — make sure this is a valid JWT.' };
  }
}

function formatTs(unix: number): string {
  try {
    return new Date(unix * 1000).toLocaleString();
  } catch {
    return String(unix);
  }
}

function expStatus(payload: Record<string, unknown>): 'valid' | 'expired' | 'no-exp' {
  if (typeof payload.exp !== 'number') return 'no-exp';
  return payload.exp * 1000 > Date.now() ? 'valid' : 'expired';
}

// ── sub-components ────────────────────────────────────────────────────────────

interface JsonBlockProps {
  label: string;
  colorClass: string;   // text color for label dot
  data: Record<string, unknown>;
  raw: string;
}

const TIMESTAMP_KEYS = new Set(['exp', 'iat', 'nbf', 'auth_time', 'updated_at']);

const JsonBlock: React.FC<JsonBlockProps> = ({ label, colorClass, data, raw }) => {
  const { copy } = useClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copy(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colorClass}`} />
          <span className="text-xs font-medium text-slate-400">{label}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200 transition-colors"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        {/* Key-value rows */}
        {Object.entries(data).map(([k, v], idx, arr) => {
          const isTs = TIMESTAMP_KEYS.has(k) && typeof v === 'number';
          return (
            <div
              key={k}
              className={`flex gap-3 px-3 py-2 ${idx < arr.length - 1 ? 'border-b border-slate-800' : ''}`}
            >
              <span className="text-xs font-mono text-violet-400 flex-shrink-0 min-w-[80px]">{k}</span>
              <span className="text-xs font-mono text-slate-200 break-all">
                {isTs
                  ? <>{String(v)} <span className="text-slate-500">({formatTs(v as number)})</span></>
                  : typeof v === 'object'
                    ? JSON.stringify(v)
                    : String(v)
                }
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const PLACEHOLDER =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const JwtDecoder: React.FC = () => {
  const [input, setInput] = useState('');

  const result = useMemo((): DecodeResult | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    return decodeJwt(trimmed);
  }, [input]);

  const clear = () => setInput('');

  const status = result?.ok ? expStatus(result.data.payload) : null;

  return (
    <div className="flex flex-col gap-4 h-full min-h-0 overflow-y-auto pr-1">

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-slate-500">JWT token</label>
          {input && (
            <button
              onClick={clear}
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              title="Clear"
            >
              <Eraser size={13} />
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={4}
          spellCheck={false}
          className={`w-full font-mono text-xs bg-slate-900 border rounded-xl px-3 py-2.5 text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors placeholder:text-slate-600 ${
            result && !result.ok ? 'border-red-500/50' : 'border-slate-700'
          }`}
        />
        {result && !result.ok && (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle size={11} /> {result.error}
          </p>
        )}
      </div>

      {/* Expiry status badge */}
      {result?.ok && (
        <div className="flex items-center gap-2">
          {status === 'expired' && (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle size={12} /> Token expired
            </span>
          )}
          {status === 'valid' && (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={12} /> Token valid
            </span>
          )}
          {status === 'no-exp' && (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-700 text-slate-400 border border-slate-600">
              <Clock size={12} /> No expiry claim
            </span>
          )}
          <span className="text-xs text-slate-600 ml-auto">
            Signature is <span className="text-amber-500/80">not verified</span> — client-side only
          </span>
        </div>
      )}

      {/* Decoded sections */}
      {result?.ok && (
        <div className="flex flex-col gap-4">
          <JsonBlock
            label="Header"
            colorClass="bg-violet-500"
            data={result.data.header}
            raw={result.data.raw.header}
          />
          <JsonBlock
            label="Payload"
            colorClass="bg-blue-500"
            data={result.data.payload}
            raw={result.data.raw.payload}
          />

          {/* Signature */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-400">Signature</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              <p className="font-mono text-xs text-amber-400/80 break-all">{result.data.signature}</p>
              <p className="text-[10px] text-slate-600 mt-1.5">
                Verify this signature server-side using your secret / public key.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
