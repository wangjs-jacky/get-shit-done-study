import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

/**
 * Toast component - Displays a notification message
 *
 * Features:
 * - Renders via Portal to document.body
 * - Fixed position at bottom-right
 * - Fade-in animation on mount
 * - Supports success and error types
 * - Accessible with role="alert"
 *
 * @param message - The message to display
 * @param type - The type of toast (success or error)
 */
export default function Toast({ message, type }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation after mount
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return createPortal(
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${
        type === 'success'
          ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
          : 'bg-[var(--color-red)] text-white'
      }`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>,
    document.body
  );
}
