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
  return { copy };
};
