// src/pages/LoginPage.tsx
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useRef, useState } from 'react';

const PIN_LENGTH = 6;

export const LoginPage: React.FC = () => {
  const { unlock, hasPin, setPin } = useAuth();
  const [pin, setPin2] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [confirmPin, setConfirmPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [step, setStep] = useState<'enter' | 'setup' | 'confirm'>(!hasPin ? 'setup' : 'enter');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setStep(!hasPin ? 'setup' : 'enter');
  }, [hasPin]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [step]);

  const shake = (msg: string) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const clearInputs = (which: 'pin' | 'confirm' | 'both' = 'both') => {
    if (which === 'pin' || which === 'both') {
      setPin2(Array(PIN_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
    if (which === 'confirm' || which === 'both') {
      setConfirmPin(Array(PIN_LENGTH).fill(''));
      setTimeout(() => confirmRefs.current[0]?.focus(), 50);
    }
  };

  const handleDigit = (
    idx: number,
    val: string,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onComplete: (fullPin: string) => void
  ) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...arr];
    next[idx] = val;
    setArr(next);
    setError('');
    if (val && idx < PIN_LENGTH - 1) refs.current[idx + 1]?.focus();
    if (val && idx === PIN_LENGTH - 1) {
      const full = next.join('');
      if (full.length === PIN_LENGTH) onComplete(full);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    idx: number,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === 'Backspace' && !refs.current[idx]?.value && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleEnterComplete = async (full: string) => {
    setLoading(true);
    const ok = await unlock(full);
    setLoading(false);
    if (!ok) {
      shake('Invalid PIN. Try again.');
      clearInputs('pin');
    }
  };

  const handleSetupComplete = (full: string) => {
    setStep('confirm');
    setTimeout(() => confirmRefs.current[0]?.focus(), 50);
  };

  const handleConfirmComplete = async (full: string) => {
    const entered = pin.join('');
    if (full !== entered) {
      shake('PINs do not match. Start over.');
      clearInputs('both');
      setStep('setup');
      return;
    }
    setLoading(true);
    await setPin(entered);
    await unlock(entered);
    setLoading(false);
  };

  const renderDots = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onComplete: (v: string) => void
  ) => (
    <div className="flex gap-2">
      {arr.map((val, i) => (
        <div key={i} className="relative">
          <input
            ref={(el) => (refs.current[i] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleDigit(i, e.target.value, arr, setArr, refs, onComplete)}
            onKeyDown={(e) => handleKeyDown(e, i, refs)}
            className="w-10 h-12 text-center text-xl font-bold bg-slate-900/80 border-2 rounded-xl outline-none transition-all duration-200
              text-cyan-300 caret-cyan-400
              border-slate-700 focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(34,211,238,0.4)]
              placeholder-slate-700"
            placeholder="•"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center overflow-hidden relative select-none">

      {/* Animated grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Corner brackets */}
      {[
        'top-6 left-6 border-t-2 border-l-2',
        'top-6 right-6 border-t-2 border-r-2',
        'bottom-6 left-6 border-b-2 border-l-2',
        'bottom-6 right-6 border-b-2 border-r-2',
      ].map((cls, i) => (
        <div key={i} className={`absolute w-8 h-8 border-cyan-500/40 ${cls}`} />
      ))}

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className={`relative z-10 flex flex-col items-center gap-8 transition-all duration-150 ${shaking ? 'animate-[shake_0.4s_ease]' : ''}`}>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <img src="/dragon.png" width={50} height={50} className="text-cyan-400" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-widest text-slate-100 uppercase">WorkVault</h1>
            <p className="text-[10px] tracking-[0.3em] text-cyan-500/70 uppercase mt-0.5">Secure Workspace</p>
          </div>
        </div>

        {/* Panel */}
        <div className="w-80 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">

          {/* Scan line top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-t-2xl" />

          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400/80 uppercase">
              {step === 'enter' ? 'Identity Verification' : step === 'setup' ? 'Initialize Security' : 'Confirm PIN'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {step === 'enter' ? 'Enter your PIN to unlock' : step === 'setup' ? 'Set a 6-digit access PIN' : 'Re-enter PIN to confirm'}
            </p>
          </div>

          {/* PIN input */}
          {step === 'enter' && renderDots(pin, setPin2, inputRefs, handleEnterComplete)}
          {step === 'setup' && renderDots(pin, setPin2, inputRefs, handleSetupComplete)}
          {step === 'confirm' && renderDots(confirmPin, setConfirmPin, confirmRefs, handleConfirmComplete)}

          {/* Error */}
          <div className="h-4">
            {error && (
              <p className="text-[11px] text-red-400 tracking-wide text-center">{error}</p>
            )}
          </div>

          {/* Status */}
          {loading && (
            <div className="flex items-center gap-2 text-cyan-400/60">
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-[10px] tracking-widest text-slate-700 uppercase">
          Local · Encrypted · Private
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;