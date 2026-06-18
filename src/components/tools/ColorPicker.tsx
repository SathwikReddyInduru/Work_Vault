// src/components/tools/ColorPicker.tsx
import { Check, Copy } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useClipboard } from '@/hooks/useClipboard';

// ── helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
  else if (max === gg) h = ((bb - rr) / d + 2) / 6;
  else h = ((rr - gg) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
    else if (max === gg) h = ((bb - rr) / d + 2) / 6;
    else h = ((rr - gg) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function luminance(r: number, g: number, b: number): number {
  const c = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrastRatio(r: number, g: number, b: number): number {
  const L = luminance(r, g, b);
  const Lw = 1;   // white
  return parseFloat(((Lw + 0.05) / (L + 0.05)).toFixed(2));
}

function wcagLabel(ratio: number): { label: string; color: string } {
  if (ratio >= 7)   return { label: 'AAA', color: 'text-emerald-400' };
  if (ratio >= 4.5) return { label: 'AA',  color: 'text-blue-400' };
  if (ratio >= 3)   return { label: 'AA Large', color: 'text-amber-400' };
  return { label: 'Fail', color: 'text-red-400' };
}

function generateShades(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return [10, 20, 30, 40, 50, 60, 70, 80, 90].map(l => {
    // hsl to hex
    const hh = h / 360, ss = s / 100, ll = l / 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    if (ss === 0) {
      const v = Math.round(ll * 255);
      return rgbToHex(v, v, v);
    }
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
    const p = 2 * ll - q;
    return rgbToHex(
      Math.round(hue2rgb(p, q, hh + 1/3) * 255),
      Math.round(hue2rgb(p, q, hh) * 255),
      Math.round(hue2rgb(p, q, hh - 1/3) * 255),
    );
  });
}

// ── component ─────────────────────────────────────────────────────────────────

interface CopyBtnProps { text: string; label?: string; className?: string }
const CopyBtn: React.FC<CopyBtnProps> = ({ text, label, className = '' }) => {
  const { copy } = useClipboard();
  const [done, setDone] = useState(false);
  const handle = async () => {
    await copy(text);
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };
  return (
    <button
      onClick={handle}
      className={`flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200 transition-colors ${className}`}
      title={`Copy ${label ?? text}`}
    >
      {done ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
      {label && <span>{done ? 'Copied' : label}</span>}
    </button>
  );
};

export const ColorPicker: React.FC = () => {
  const [hex, setHex] = useState('#6366f1');
  const [hexInput, setHexInput] = useState('#6366f1');
  const [inputError, setInputError] = useState(false);

  const rgb = hexToRgb(hex) ?? { r: 99, g: 102, b: 241 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const contrast = contrastRatio(rgb.r, rgb.g, rgb.b);
  const wcag = wcagLabel(contrast);
  const shades = generateShades(hex);

  const handleColorInput = (value: string) => {
    setHex(value);
    setHexInput(value);
    setInputError(false);
  };

  const handleHexInput = (value: string) => {
    setHexInput(value);
    const clean = value.startsWith('#') ? value : '#' + value;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      setHex(clean);
      setInputError(false);
    } else {
      setInputError(true);
    }
  };

  const formats = [
    { label: 'HEX', value: hex.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'HSV', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Picker row */}
      <div className="flex gap-4 items-start">
        {/* Native color picker */}
        <label
          className="relative cursor-pointer flex-shrink-0"
          title="Pick a color"
          style={{ width: 80, height: 80 }}
        >
          <div
            className="w-full h-full rounded-xl border-2 border-slate-700 overflow-hidden"
            style={{ backgroundColor: hex }}
          />
          <input
            type="color"
            value={hex}
            onChange={e => handleColorInput(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        {/* Hex text input + WCAG */}
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Hex value</label>
            <input
              type="text"
              value={hexInput}
              onChange={e => handleHexInput(e.target.value)}
              placeholder="#000000"
              maxLength={7}
              spellCheck={false}
              className={`w-full h-9 font-mono text-sm bg-slate-900 border rounded-xl px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors ${
                inputError ? 'border-red-500/60' : 'border-slate-700'
              }`}
            />
            {inputError && <p className="text-xs text-red-400 mt-1">Enter a valid 6-digit hex</p>}
          </div>

          {/* Contrast */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">vs white:</span>
            <span className="font-mono text-slate-300">{contrast}:1</span>
            <span className={`font-semibold ${wcag.color}`}>{wcag.label}</span>
          </div>
        </div>
      </div>

      {/* Format table */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        {formats.map((f, idx) => (
          <div
            key={f.label}
            className={`flex items-center justify-between px-3 py-2 ${
              idx < formats.length - 1 ? 'border-b border-slate-800' : ''
            }`}
          >
            <span className="text-xs text-slate-500 w-10 flex-shrink-0">{f.label}</span>
            <span className="font-mono text-xs text-slate-200 flex-1 mx-2">{f.value}</span>
            <CopyBtn text={f.value} label="Copy" />
          </div>
        ))}
      </div>

      {/* RGB sliders */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500">Adjust channels</p>
        {(['r', 'g', 'b'] as const).map(ch => {
          const trackColors: Record<string, string> = {
            r: 'linear-gradient(to right, #0f0f0f, #ff0000)',
            g: 'linear-gradient(to right, #0f0f0f, #00ff00)',
            b: 'linear-gradient(to right, #0f0f0f, #0000ff)',
          };
          return (
            <div key={ch} className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 w-4 uppercase">{ch}</span>
              <div className="relative flex-1 h-4 flex items-center">
                <div
                  className="absolute inset-y-1/2 -translate-y-1/2 w-full h-2 rounded-full"
                  style={{ background: trackColors[ch] }}
                />
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={rgb[ch]}
                  onChange={e => {
                    const newRgb = { ...rgb, [ch]: Number(e.target.value) };
                    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                    setHex(newHex);
                    setHexInput(newHex);
                  }}
                  className="relative w-full appearance-none bg-transparent cursor-pointer accent-violet-500"
                  style={{ zIndex: 1 }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400 w-7 text-right">{rgb[ch]}</span>
            </div>
          );
        })}
      </div>

      {/* Shades strip */}
      {shades.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Shades</p>
          <div className="flex gap-1">
            {shades.map((shade, idx) => (
              <div key={idx} className="flex-1 group relative">
                <button
                  onClick={() => { setHex(shade); setHexInput(shade); setInputError(false); }}
                  className="w-full rounded-lg transition-transform hover:scale-110 hover:z-10"
                  style={{ backgroundColor: shade, height: 32 }}
                  title={shade}
                />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-600 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  {(idx + 1) * 100}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
