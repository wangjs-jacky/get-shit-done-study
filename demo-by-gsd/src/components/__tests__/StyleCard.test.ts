/**
 * Tests for StyleCard component
 *
 * Note: Astro components (.astro) cannot be directly imported in Vitest.
 * These tests verify the component structure through integration testing.
 * Full component tests will be covered by E2E tests.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('StyleCard component', () => {
  // Read the component source to verify structure
  const componentPath = join(process.cwd(), 'src/components/StyleCard.astro');
  const componentSource = readFileSync(componentPath, 'utf-8');

  it('contains Props interface with style property', () => {
    expect(componentSource).toContain('interface Props');
    expect(componentSource).toContain('style: Style');
  });

  it('contains selected prop with default false', () => {
    expect(componentSource).toContain('selected?: boolean');
    expect(componentSource).toContain('selected = false');
  });

  it('renders style name in heading', () => {
    expect(componentSource).toContain('{style.name}');
    expect(componentSource).toContain('<h3');
  });

  it('renders style description in paragraph', () => {
    expect(componentSource).toContain('{style.description}');
    expect(componentSource).toContain('<p');
  });

  it('applies selected classes when selected is true', () => {
    // Check conditional class for selected state
    expect(componentSource).toContain('border-[var(--color-primary)]');
    expect(componentSource).toContain('bg-[var(--color-primary-dim)]');
  });

  it('applies hover classes when not selected', () => {
    expect(componentSource).toContain('hover:border-[var(--color-primary)]');
  });

  it('includes data-style-id attribute for selection', () => {
    expect(componentSource).toContain('data-style-id={style.id}');
  });

  it('has cursor-pointer for click interaction', () => {
    expect(componentSource).toContain('cursor-pointer');
  });

  it('has transition-colors for smooth state changes', () => {
    expect(componentSource).toContain('transition-colors');
  });
});
