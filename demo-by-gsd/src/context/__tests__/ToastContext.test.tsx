import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { ToastProvider, useToast } from '../ToastContext';

// Mock Toast component since we test Context in isolation
vi.mock('../../components/Toast', () => ({
  default: ({ message, type }: { message: string; type: string }) => (
    <div data-testid="mock-toast" data-type={type}>
      {message}
    </div>
  ),
}));

// Test helper component to access useToast hook
function TestConsumer({ onToast }: { onToast: (showToast: ReturnType<typeof useToast>['showToast']) => void }) {
  const toast = useToast();
  return (
    <button
      data-testid="trigger-toast"
      onClick={() => onToast(toast.showToast)}
    >
      Trigger
    </button>
  );
}

// Helper to render with ToastProvider
function renderWithProvider(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('Test 1: ToastProvider renders children correctly', () => {
      renderWithProvider(
        <div data-testid="child">Child Content</div>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('useToast hook', () => {
    it('Test 2: useToast throws error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      function TestComponentWithoutProvider() {
        useToast();
        return null;
      }

      expect(() => render(<TestComponentWithoutProvider />)).toThrow(
        'useToast must be used within a ToastProvider'
      );

      consoleSpy.mockRestore();
    });

    it('Test 3: showToast updates toast state with message and type', () => {
      renderWithProvider(
        <TestConsumer
          onToast={(showToast) => {
            showToast('Test message', 'success');
          }}
        />
      );

      // Initially no toast
      expect(screen.queryByTestId('mock-toast')).not.toBeInTheDocument();

      // Trigger toast
      act(() => {
        screen.getByTestId('trigger-toast').click();
      });

      // Toast should appear with correct message and type
      const toast = screen.getByTestId('mock-toast');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Test message');
      expect(toast).toHaveAttribute('data-type', 'success');
    });

    it('Test 4: Toast auto-dismisses after 3 seconds', () => {
      renderWithProvider(
        <TestConsumer
          onToast={(showToast) => {
            showToast('Disappearing message', 'success');
          }}
        />
      );

      // Trigger toast
      act(() => {
        screen.getByTestId('trigger-toast').click();
      });

      // Toast should be visible
      expect(screen.getByTestId('mock-toast')).toBeInTheDocument();

      // Fast-forward 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Toast should be dismissed
      expect(screen.queryByTestId('mock-toast')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('clears previous timeout when new toast is triggered', () => {
      renderWithProvider(
        <TestConsumer
          onToast={(showToast) => {
            showToast('First message', 'success');
          }}
        />
      );

      // Trigger first toast
      act(() => {
        screen.getByTestId('trigger-toast').click();
      });

      expect(screen.getByTestId('mock-toast')).toHaveTextContent('First message');

      // Wait 2 seconds (before auto-dismiss)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Trigger second toast (should replace first and reset timer)
      act(() => {
        screen.getByTestId('trigger-toast').click();
      });

      expect(screen.getByTestId('mock-toast')).toHaveTextContent('First message');

      // Wait another 2 seconds (total 4 from first toast, but only 2 from second)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Toast should still be visible (only 2s since second toast)
      expect(screen.getByTestId('mock-toast')).toBeInTheDocument();

      // Wait 1 more second (3s from second toast)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Now toast should be dismissed
      expect(screen.queryByTestId('mock-toast')).not.toBeInTheDocument();
    });

    it('supports error type toast', () => {
      renderWithProvider(
        <TestConsumer
          onToast={(showToast) => {
            showToast('Error occurred!', 'error');
          }}
        />
      );

      act(() => {
        screen.getByTestId('trigger-toast').click();
      });

      const toast = screen.getByTestId('mock-toast');
      expect(toast).toHaveAttribute('data-type', 'error');
    });
  });
});
