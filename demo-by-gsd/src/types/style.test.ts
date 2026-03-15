/**
 * Tests for TypeScript style interfaces
 * These tests validate that the Style and StyleData interfaces have the correct structure
 */

import { describe, it, expect } from 'vitest';
import type { Style, StyleData } from './style';

describe('Style interface', () => {
  it('should have required fields: id, name, description, cssVariables, promptText', () => {
    // This test validates the interface structure at compile time
    // If the interface is missing any field, TypeScript will error
    const style: Style = {
      id: 'test-style',
      name: 'Test Style',
      description: 'A test style for validation',
      cssVariables: {
        '--color-bg': '#000000',
        '--color-text': '#ffffff',
      },
      promptText: '## Test Prompt\n\nThis is a test prompt.',
    };

    // Runtime validation
    expect(style.id).toBe('test-style');
    expect(style.name).toBe('Test Style');
    expect(style.description).toBe('A test style for validation');
    expect(style.cssVariables).toBeDefined();
    expect(style.promptText).toBeDefined();
  });

  it('should allow cssVariables to be Record<string, string>', () => {
    const style: Style = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      cssVariables: {
        '--color-bg': '#0a0a0b',
        '--color-text': '#e5e5e7',
        '--color-primary': '#00ff88',
        '--color-border': 'rgba(255, 255, 255, 0.06)',
      },
      promptText: 'Test prompt',
    };

    // Validate cssVariables is an object with string values
    expect(typeof style.cssVariables).toBe('object');
    expect(Object.keys(style.cssVariables).length).toBe(4);
    expect(typeof style.cssVariables['--color-bg']).toBe('string');
  });

  it('should have promptText as a non-empty string', () => {
    const style: Style = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      cssVariables: {},
      promptText: '## Design Preferences\n\nSome content here.',
    };

    expect(typeof style.promptText).toBe('string');
    expect(style.promptText.length).toBeGreaterThan(0);
  });
});

describe('StyleData interface', () => {
  it('should have styles array', () => {
    const styleData: StyleData = {
      styles: [
        {
          id: 'terminal-noir',
          name: 'Terminal Noir',
          description: 'Dark theme with neon accents',
          cssVariables: {
            '--color-bg': '#0a0a0b',
          },
          promptText: 'Test prompt',
        },
      ],
    };

    expect(Array.isArray(styleData.styles)).toBe(true);
    expect(styleData.styles.length).toBe(1);
  });

  it('should allow multiple styles in the array', () => {
    const styleData: StyleData = {
      styles: [
        {
          id: 'style-1',
          name: 'Style 1',
          description: 'First style',
          cssVariables: {},
          promptText: 'Prompt 1',
        },
        {
          id: 'style-2',
          name: 'Style 2',
          description: 'Second style',
          cssVariables: {},
          promptText: 'Prompt 2',
        },
      ],
    };

    expect(styleData.styles.length).toBe(2);
    expect(styleData.styles[0].id).toBe('style-1');
    expect(styleData.styles[1].id).toBe('style-2');
  });

  it('should allow empty styles array', () => {
    const styleData: StyleData = {
      styles: [],
    };

    expect(styleData.styles).toEqual([]);
  });
});
