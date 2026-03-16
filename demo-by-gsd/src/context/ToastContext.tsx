import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import Toast from '../components/Toast';

/**
 * Toast type for visual differentiation
 */
export type ToastType = 'success' | 'error';

/**
 * Toast state structure
 */
interface ToastState {
  message: string;
  type: ToastType;
}

/**
 * Context value interface
 */
interface ToastContextValue {
  /**
   * Show a toast notification
   * @param message - The message to display
   * @param type - The type of toast (success or error)
   */
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider - Provides toast notification functionality to the component tree
 *
 * Features:
 * - Single toast at a time (new toast replaces old)
 * - Auto-dismiss after 3 seconds
 * - Proper cleanup on unmount
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set the new toast
    setToast({ message, type });

    // Auto-dismiss after 3 seconds
    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </ToastContext.Provider>
  );
}

/**
 * useToast - Hook to access toast functionality
 *
 * @throws Error if used outside of ToastProvider
 * @returns ToastContextValue with showToast function
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
