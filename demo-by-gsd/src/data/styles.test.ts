/**
 * Tests for styles.json data structure
 * These tests validate that the style data file is valid and contains expected data
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { StyleData, Style } from '../types/style';

// Import the JSON data
import stylesData from './styles.json';

describe('styles.json', () => {
  it('should be a valid JSON file that exists', () => {
    const filePath = join(process.cwd(), 'src/data/styles.json');
    expect(existsSync(filePath)).toBe(true);

    // Should be parseable as JSON
    const content = readFileSync(filePath, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('should have styles array with at least one entry', () => {
    expect(stylesData).toHaveProperty('styles');
    expect(Array.isArray(stylesData.styles)).toBe(true);
    expect(stylesData.styles.length).toBeGreaterThanOrEqual(1);
  });

  describe('Terminal Noir style', () => {
    let terminalNoir: Style | undefined;

    beforeAll(() => {
      terminalNoir = stylesData.styles.find((s) => s.id === 'terminal-noir');
    });

    it('should have Terminal Noir style defined', () => {
      expect(terminalNoir).toBeDefined();
    });

    it('should have all required fields', () => {
      expect(terminalNoir).toHaveProperty('id');
      expect(terminalNoir).toHaveProperty('name');
      expect(terminalNoir).toHaveProperty('description');
      expect(terminalNoir).toHaveProperty('cssVariables');
      expect(terminalNoir).toHaveProperty('promptText');
    });

    it('should have correct name', () => {
      expect(terminalNoir?.name).toBe('Terminal Noir');
    });

    it('should have expected CSS variables', () => {
      const vars = terminalNoir?.cssVariables;
      expect(vars).toBeDefined();

      // Core colors
      expect(vars).toHaveProperty('--color-bg', '#0a0a0b');
      expect(vars).toHaveProperty('--color-bg-elevated', '#131316');
      expect(vars).toHaveProperty('--color-text', '#e5e5e7');
      expect(vars).toHaveProperty('--color-text-muted', '#6b6b76');
      expect(vars).toHaveProperty('--color-border', 'rgba(255, 255, 255, 0.06)');

      // Accent colors - neon style
      expect(vars).toHaveProperty('--color-primary', '#00ff88');
      expect(vars).toHaveProperty('--color-primary-dim', 'rgba(0, 255, 136, 0.15)');
      expect(vars).toHaveProperty('--color-amber', '#ffb800');
      expect(vars).toHaveProperty('--color-red', '#ff4757');
      expect(vars).toHaveProperty('--color-blue', '#00d4ff');

      // Glass effects
      expect(vars).toHaveProperty('--glass-bg', 'rgba(255, 255, 255, 0.02)');
      expect(vars).toHaveProperty('--glass-border', 'rgba(255, 255, 255, 0.05)');
    });

    it('should have non-empty promptText', () => {
      expect(typeof terminalNoir?.promptText).toBe('string');
      expect(terminalNoir?.promptText.length).toBeGreaterThan(100);
    });

    it('should contain design preferences in promptText', () => {
      const prompt = terminalNoir?.promptText || '';
      // Should contain key design elements
      expect(prompt).toContain('设计偏好');
      expect(prompt).toContain('Terminal Noir');
    });

    it('should contain CSS variable definitions in promptText', () => {
      const prompt = terminalNoir?.promptText || '';
      expect(prompt).toContain('--color-bg');
      expect(prompt).toContain('--color-primary');
    });
  });
});
