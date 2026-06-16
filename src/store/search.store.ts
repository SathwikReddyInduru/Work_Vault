import { create } from 'zustand';

interface SearchState {
  globalQuery: string;
  setGlobalQuery: (q: string) => void;
  clearGlobalQuery: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  globalQuery: '',
  setGlobalQuery: (q) => set({ globalQuery: q }),
  clearGlobalQuery: () => set({ globalQuery: '' }),
}));
