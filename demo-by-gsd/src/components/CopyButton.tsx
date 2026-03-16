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
        showToast('Copy failed', 'error');
        return;
      }

      await navigator.clipboard.writeText(text);
      showToast('Prompt copied!', 'success');
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('Copy failed', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-[var(--color-bg-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${className}`}
      aria-label="Copy prompt to clipboard"
    >
      Copy Prompt
    </button>
  );
}
