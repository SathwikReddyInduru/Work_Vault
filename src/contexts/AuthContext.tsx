// src/contexts/AuthContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  hasPin: boolean;
  isLoading: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setPin: (pin: string) => Promise<void>;
  removePin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('wv:unlocked') === '1'  // survive Vite HMR reloads; cleared on window close
  );
  const [hasPin, setHasPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // wait until we know PIN status

  useEffect(() => {
    window.electronAPI.authHasPin().then((has) => {
      setHasPin(has);
      if (!has) {
        setIsAuthenticated(true);        // no PIN set → auto-unlock
        sessionStorage.setItem('wv:unlocked', '1');
      } else if (sessionStorage.getItem('wv:unlocked') === '1') {
        setIsAuthenticated(true);        // PIN set but already unlocked this session
      }
      setIsLoading(false);
    });
  }, []);

  const unlock = useCallback(async (pin: string) => {
    const ok = await window.electronAPI.authVerifyPin(pin);
    if (ok) {
      setIsAuthenticated(true);
      sessionStorage.setItem('wv:unlocked', '1');
    }
    return ok;
  }, []);

  const lock = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('wv:unlocked');
  }, []);

  const setPin = useCallback(async (pin: string) => {
    await window.electronAPI.authSetPin(pin);
    setHasPin(true);
  }, []);

  const removePin = useCallback(async () => {
    await window.electronAPI.authRemovePin();
    setHasPin(false);
    setIsAuthenticated(true); // removing PIN means no lock → stay unlocked
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasPin, isLoading, unlock, lock, setPin, removePin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};