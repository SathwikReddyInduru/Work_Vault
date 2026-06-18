import { useToast } from './useToast';

export const useClipboard = () => {
  const toast = useToast();

  const copy = async (text: string, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error('Failed to copy');
    }
  };

  /**
   * Copies items sequentially with a delay between each.
   * Returns a promise that resolves when ALL copies are done.
   */
  const copySequential = async (
    items: { value: string; label: string }[],
    delayMs = 1000
  ): Promise<void> => {
    const valid = items.filter((i) => i.value);
    if (valid.length === 0) return;

    for (let i = 0; i < valid.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, delayMs));
      try {
        await navigator.clipboard.writeText(valid[i].value);
        toast.success(valid[i].label);
      } catch {
        toast.error(`Failed to copy ${valid[i].label}`);
      }
    }
  };

  return { copy, copySequential };
};