/**
 * TypeScript interfaces for style data
 *
 * These types define the structure of style data extracted from CLAUDE.md
 * and used throughout the Frontend Design Gallery application.
 */

/**
 * Represents a single design style with all its properties.
 *
 * @property id - Unique identifier for the style (e.g., 'terminal-noir')
 * @property name - Human-readable display name (e.g., 'Terminal Noir')
 * @property description - Brief description of the style's characteristics
 * @property cssVariables - CSS custom properties as key-value pairs
 * @property promptText - Full prompt text for copying to CLAUDE.md
 */
export interface Style {
  id: string;
  name: string;
  description: string;
  cssVariables: Record<string, string>;
  promptText: string;
}

/**
 * Container for all available styles.
 *
 * @property styles - Array of Style objects
 */
export interface StyleData {
  styles: Style[];
}
