import { useToast } from '../context/ToastContext';

interface CopyButtonProps {
  /**
   * The text to copy to clipboard
   */
  text: string;

  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * CopyButton - A reusable button component that copies text to clipboard
 *
 * Features:
 * - Uses Clipboard API (navigator.clipboard.writeText)
 * - Shows toast notification on success/failure
 * - Handles HTTPS requirement gracefully
 * - Accessible with aria-label
 */
export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      // Check if clipboard API is available (requires HTTPS or localhost)
      if (!navigator.clipboard?.writeText) {
        showToast('复制失败', 'error');
        return;
      }

      await navigator.clipboard.writeText(text);
      showToast('设计提示词已复制', 'success');
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('复制失败', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-[var(--color-bg)] bg-[var(--color-primary)] shadow-[0_12px_30px_-16px_var(--color-primary)] hover:brightness-105 hover:shadow-[0_18px_36px_-18px_var(--color-primary)] active:scale-[0.99] border border-transparent touch-manipulation transition-[background-color,color,box-shadow,transform,filter] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ${className}`}
      aria-label="复制设计提示词"
    >
      复制设计提示词
    </button>
  );
}
