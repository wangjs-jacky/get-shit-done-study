import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PhoneFrame from '../PhoneFrame';

describe('PhoneFrame', () => {
  it('renders children inside the frame', () => {
    render(
      <PhoneFrame>
        <div>Test Content</div>
      </PhoneFrame>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('uses a responsive screen container instead of fixed pixel dimensions', () => {
    const { container } = render(
      <PhoneFrame>
        <div>Content</div>
      </PhoneFrame>
    );

    const screenContent = container.querySelector('.w-full.aspect-\\[14\\/25\\]');
    expect(screenContent).toBeInTheDocument();
  });

  it('includes dynamic island element', () => {
    const { container } = render(
      <PhoneFrame>
        <div>Content</div>
      </PhoneFrame>
    );

    // Dynamic island should be present
    const dynamicIsland = container.querySelector('.w-28.h-8.rounded-full');
    expect(dynamicIsland).toBeInTheDocument();
  });

  it('includes home indicator', () => {
    const { container } = render(
      <PhoneFrame>
        <div>Content</div>
      </PhoneFrame>
    );

    // Home indicator should be present at bottom
    const homeIndicator = container.querySelector('.w-32.h-1.rounded-full');
    expect(homeIndicator).toBeInTheDocument();
  });

  it('applies reflection overlay', () => {
    const { container } = render(
      <PhoneFrame>
        <div>Content</div>
      </PhoneFrame>
    );

    // Reflection effect should be present
    const reflection = container.querySelector('.pointer-events-none');
    expect(reflection).toBeInTheDocument();
  });
});
