/**
 * Tests for style data validation utilities
 * These tests validate the validation functions for Style and StyleData types
 */

import { describe, it, expect } from 'vitest';
import { validateStyle, validateStyleData } from './validate';
import type { Style, StyleData } from '../types/style';

describe('validateStyle', () => {
  it('should return true for valid style object', () => {
    const validStyle: Style = {
      id: 'test-style',
      name: 'Test Style',
      description: 'A test style',
      cssVariables: {
        '--color-bg': '#000000',
      },
      promptText: 'Test prompt',
    };

    expect(validateStyle(validStyle)).toBe(true);
  });

  it('should return false for null', () => {
    expect(validateStyle(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(validateStyle(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(validateStyle('string')).toBe(false);
    expect(validateStyle(123)).toBe(false);
    expect(validateStyle(true)).toBe(false);
  });

  it('should return false for missing id field', () => {
    const invalidStyle = {
      name: 'Test',
      description: 'Test',
      cssVariables: {},
      promptText: 'Test',
    };

    expect(validateStyle(invalidStyle)).toBe(false);
  });

  it('should return false for missing name field', () => {
    const invalidStyle = {
      id: 'test',
      description: 'Test',
      cssVariables: {},
      promptText: 'Test',
    };

    expect(validateStyle(invalidStyle)).toBe(false);
  });

  it('should return false for missing description field', () => {
    const invalidStyle = {
      id: 'test',
      name: 'Test',
      cssVariables: {},
      promptText: 'Test',
    };

    expect(validateStyle(invalidStyle)).toBe(false);
  });

  it('should return false for missing cssVariables field', () => {
    const invalidStyle = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      promptText: 'Test',
    };

    expect(validateStyle(invalidStyle)).toBe(false);
  });

  it('should return false for missing promptText field', () => {
    const invalidStyle = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      cssVariables: {},
    };

    expect(validateStyle(invalidStyle)).toBe(false);
  });

  it('should return false if cssVariables is not an object', () => {
    const invalidStyle = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      cssVariables: 'not-an-object',
      promptText: 'Test',
    };

    expect(validateStyle(invalidStyle)).toBe(false);
  });

  it('should return false if cssVariables is null', () => {
    const invalidStyle = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      cssVariables: null,
      promptText: 'Test',
    };

    expect(validateStyle(invalidStyle)).toBe(false);
  });
});

describe('validateStyleData', () => {
  it('should return true for valid StyleData object', () => {
    const validData: StyleData = {
      styles: [
        {
          id: 'style-1',
          name: 'Style 1',
          description: 'First style',
          cssVariables: {},
          promptText: 'Prompt 1',
        },
      ],
    };

    expect(validateStyleData(validData)).toBe(true);
  });

  it('should return true for empty styles array', () => {
    const emptyData: StyleData = {
      styles: [],
    };

    expect(validateStyleData(emptyData)).toBe(true);
  });

  it('should return true for multiple valid styles', () => {
    const multipleStyles: StyleData = {
      styles: [
        {
          id: 'style-1',
          name: 'Style 1',
          description: 'First style',
          cssVariables: { '--color-bg': '#000' },
          promptText: 'Prompt 1',
        },
        {
          id: 'style-2',
          name: 'Style 2',
          description: 'Second style',
          cssVariables: { '--color-bg': '#fff' },
          promptText: 'Prompt 2',
        },
      ],
    };

    expect(validateStyleData(multipleStyles)).toBe(true);
  });

  it('should return false for null', () => {
    expect(validateStyleData(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(validateStyleData(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(validateStyleData('string')).toBe(false);
    expect(validateStyleData(123)).toBe(false);
    expect(validateStyleData([])).toBe(false);
  });

  it('should return false for missing styles array', () => {
    const invalidData = {};

    expect(validateStyleData(invalidData)).toBe(false);
  });

  it('should return false if styles is not an array', () => {
    const invalidData = {
      styles: 'not-an-array',
    };

    expect(validateStyleData(invalidData)).toBe(false);
  });

  it('should return false if any style in array is invalid', () => {
    const invalidData = {
      styles: [
        {
          id: 'valid-style',
          name: 'Valid',
          description: 'Valid style',
          cssVariables: {},
          promptText: 'Valid prompt',
        },
        {
          // Missing required fields
          id: 'invalid-style',
        },
      ],
    };

    expect(validateStyleData(invalidData)).toBe(false);
  });
});
