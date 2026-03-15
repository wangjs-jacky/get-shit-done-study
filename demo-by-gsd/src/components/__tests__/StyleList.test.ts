/**
 * Tests for StyleList component
 *
 * Note: Astro components (.astro) cannot be directly imported in Vitest.
 * These tests verify the component structure through integration testing.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('StyleList component', () => {
  // Read the component source to verify structure
  const componentPath = join(process.cwd(), 'src/components/StyleList.astro');
  const componentSource = readFileSync(componentPath, 'utf-8');

  it('imports Style type', () => {
    expect(componentSource).toContain("import type { Style }");
  });

  it('imports StyleCard component', () => {
    expect(componentSource).toContain("import StyleCard from './StyleCard.astro'");
  });

  it('contains Props interface with styles array', () => {
    expect(componentSource).toContain('interface Props');
    expect(componentSource).toContain('styles: Style[]');
  });

  it('contains selectedId prop', () => {
    expect(componentSource).toContain('selectedId?: string | null');
  });

  it('has flex column layout', () => {
    expect(componentSource).toContain('flex');
    expect(componentSource).toContain('flex-col');
  });

  it('has gap between items', () => {
    expect(componentSource).toContain('gap-3');
  });

  it('is scrollable with overflow-y-auto', () => {
    expect(componentSource).toContain('overflow-y-auto');
  });

  it('has max-height for scrollable area', () => {
    expect(componentSource).toContain('max-h-[calc(100vh-8rem)]');
  });

  it('maps over styles to render StyleCards', () => {
    expect(componentSource).toContain('styles.map');
    expect(componentSource).toContain('<StyleCard');
  });

  it('passes selected prop based on selectedId', () => {
    expect(componentSource).toContain('style.id === selectedId');
    expect(componentSource).toContain('selected=');
  });

  it('has padding for spacing', () => {
    expect(componentSource).toContain('p-4');
  });
});
