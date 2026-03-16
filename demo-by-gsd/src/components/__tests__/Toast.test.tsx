import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Toast from '../Toast';

describe('Toast', () => {
  beforeEach(() => {
    // Clear document body between tests
    document.body.innerHTML = '';
  });

  describe('Rendering', () => {
    it('Test 1: Toast renders message text correctly', () => {
      render(<Toast message="Hello World" type="success" />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('Test 2: Toast applies success styles when type="success"', () => {
      render(<Toast message="Success!" type="success" />);

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      // Check that success classes are applied
      expect(toast.className).toContain('bg-[var(--color-primary)]');
    });

    it('Test 3: Toast applies error styles when type="error"', () => {
      render(<Toast message="Error occurred" type="error" />);

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      // Check that error classes are applied
      expect(toast.className).toContain('bg-[var(--color-red)]');
    });
  });

  describe('Animation', () => {
    it('Test 4: Toast has fade-in animation on mount', async () => {
      render(<Toast message="Animated toast" type="success" />);

      const toast = screen.getByRole('alert');

      // Initially should have opacity-0 (hidden state)
      expect(toast.className).toContain('opacity-0');

      // After requestAnimationFrame, should become visible
      await act(async () => {
        // Wait for requestAnimationFrame to execute
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      // Should now have opacity-100 (visible state)
      expect(toast.className).toContain('opacity-100');
    });
  });

  describe('Accessibility', () => {
    it('Test 5: Toast has role="alert" and aria-live="polite" for accessibility', () => {
      render(<Toast message="Accessible toast" type="success" />);

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Portal', () => {
    it('renders via Portal to document.body', () => {
      render(<Toast message="Portal toast" type="success" />);

      // Toast should be in document.body, not in the render container
      const toast = screen.getByRole('alert');
      expect(toast.parentElement).toBe(document.body);
    });
  });

  describe('Positioning', () => {
    it('has fixed positioning at bottom-right', () => {
      render(<Toast message="Positioned toast" type="success" />);

      const toast = screen.getByRole('alert');
      expect(toast.className).toContain('fixed');
      expect(toast.className).toContain('bottom-4');
      expect(toast.className).toContain('right-4');
    });
  });
});
