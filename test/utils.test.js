import { describe, it, expect } from 'vitest';
import { map, isElement } from '../src/utils.js';

describe('map()', () => {
  it('maps a mid-range value linearly', () => {
    expect(map(0.5, 0, 1, 0, 100)).toBe(50);
  });

  it('maps the minimum to the output minimum', () => {
    expect(map(0, 0, 1, 100, 200)).toBe(100);
  });

  it('maps the maximum to the output maximum', () => {
    expect(map(1, 0, 1, 100, 200)).toBe(200);
  });

  it('handles inverted output range (clamping not required)', () => {
    expect(map(0.5, 0, 1, 200, 100)).toBe(150);
  });

  it('works with non-unit input ranges', () => {
    expect(map(5, 0, 10, 0, 1)).toBe(0.5);
  });
});

describe('isElement()', () => {
  it('returns false for null', () => {
    expect(isElement(null)).toBe(false);
  });

  it('returns false for a plain object', () => {
    expect(isElement({})).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isElement('div')).toBe(false);
  });

  it('returns true for a real DOM element', () => {
    const el = document.createElement('div');
    expect(isElement(el)).toBe(true);
  });

  it('returns false for a text node', () => {
    const text = document.createTextNode('hello');
    expect(isElement(text)).toBe(false);
  });
});
