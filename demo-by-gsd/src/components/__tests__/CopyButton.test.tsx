import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../../context/ToastContext';
import CopyButton from '../CopyButton';

// Mock navigator.clipboard
const mockClipboardWriteText = vi.fn();

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockClipboardWriteText,
  },
  writable: true,
});

// Mock window.matchMedia for prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('CopyButton', () => {
  beforeEach(() => {
    mockClipboardWriteText.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render button with correct text and aria-label', () => {
    render(
      <ToastProvider>
        <CopyButton text="Test prompt" />
      </ToastProvider>
    );

    const button = screen.getByRole('button', { name: /copy prompt to clipboard/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Copy Prompt');
  });

  it('should call navigator.clipboard.writeText with provided text on click', async () => {
    mockClipboardWriteText.mockResolvedValueOnce(undefined);

    render(
      <ToastProvider>
        <CopyButton text="Test prompt text" />
      </ToastProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClipboardWriteText).toHaveBeenCalledWith('Test prompt text');
    expect(mockClipboardWriteText).toHaveBeenCalledTimes(1);
  });

  it('should show success toast on successful copy', async () => {
    mockClipboardWriteText.mockResolvedValueOnce(undefined);

    render(
      <ToastProvider>
        <CopyButton text="Test prompt" />
      </ToastProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Prompt copied!')).toBeInTheDocument();
    });
  });

  it('should show error toast on copy failure', async () => {
    mockClipboardWriteText.mockRejectedValueOnce(new Error('Copy failed'));

    render(
      <ToastProvider>
        <CopyButton text="Test prompt" />
      </ToastProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Copy failed')).toBeInTheDocument();
    });
  });

  it('should show error toast when clipboard writeText is not available', async () => {
    // Temporarily mock writeText as undefined
    // @ts-expect-error - Testing edge case
    const originalWriteText = navigator.clipboard.writeText;
    // @ts-expect-error - Testing edge case
    navigator.clipboard.writeText = undefined;

    render(
      <ToastProvider>
        <CopyButton text="Test prompt" />
      </ToastProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Copy failed')).toBeInTheDocument();
    });

    // Restore clipboard
    // @ts-expect-error - Restoring mock
    navigator.clipboard.writeText = originalWriteText;
  });

  it('should apply custom className when provided', () => {
    render(
      <ToastProvider>
        <CopyButton text="Test prompt" className="custom-class" />
      </ToastProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
