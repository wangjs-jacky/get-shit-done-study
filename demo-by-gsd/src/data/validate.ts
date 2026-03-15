/**
 * Validation utilities for style data
 *
 * These functions provide runtime type checking for Style and StyleData types,
 * useful for validating imported JSON data or unknown input.
 */

import type { Style, StyleData } from '../types/style';

/**
 * Validates that an unknown value conforms to the Style interface.
 *
 * @param style - The value to validate
 * @returns True if the value is a valid Style, false otherwise
 */
export function validateStyle(style: unknown): style is Style {
  if (typeof style !== 'object' || style === null) {
    return false;
  }

  const s = style as Record<string, unknown>;

  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.description === 'string' &&
    typeof s.cssVariables === 'object' &&
    s.cssVariables !== null &&
    typeof s.promptText === 'string'
  );
}

/**
 * Validates that an unknown value conforms to the StyleData interface.
 *
 * @param data - The value to validate
 * @returns True if the value is a valid StyleData, false otherwise
 */
export function validateStyleData(data: unknown): data is StyleData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.styles)) {
    return false;
  }

  return d.styles.every(validateStyle);
}
