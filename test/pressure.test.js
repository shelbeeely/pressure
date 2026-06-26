import { describe, it, expect, vi, beforeEach } from 'vitest';
import Pressure from '../src/pressure.js';
import { Config } from '../src/config.js';

// Reset Config before each test.
beforeEach(() => {
  Config.set({ polyfill: true, polyfillSpeedUp: 1000, polyfillSpeedDown: 0,
               preventSelect: true, only: null });
});

describe('Pressure.map()', () => {
  it('delegates to the map utility', () => {
    expect(Pressure.map(0.5, 0, 1, 0, 100)).toBe(50);
  });
});

describe('Pressure.config()', () => {
  it('sets global config values', () => {
    Pressure.config({ polyfill: false });
    expect(Config.polyfill).toBe(false);
    // restore
    Pressure.config({ polyfill: true });
  });
});

describe('Pressure.set()', () => {
  it('accepts a CSS selector string', () => {
    const el = document.createElement('div');
    el.id = 'test-el';
    document.body.appendChild(el);

    expect(() => {
      Pressure.set('#test-el', { change(force) { /* noop */ } });
    }).not.toThrow();

    document.body.removeChild(el);
  });

  it('accepts a DOM element directly', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    expect(() => {
      Pressure.set(el, { change(force) { /* noop */ } });
    }).not.toThrow();

    document.body.removeChild(el);
  });

  it('accepts a NodeList', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.className = 'multi';
    b.className = 'multi';
    document.body.appendChild(a);
    document.body.appendChild(b);

    expect(() => {
      Pressure.set(document.querySelectorAll('.multi'), { change() {} });
    }).not.toThrow();

    document.body.removeChild(a);
    document.body.removeChild(b);
  });

  it('sets userSelect: none on the element when preventSelect is true', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    Pressure.set(el, {}, { preventSelect: true });
    expect(el.style.userSelect).toBe('none');
    document.body.removeChild(el);
  });

  it('does not set userSelect when preventSelect is false', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    Pressure.set(el, {}, { preventSelect: false });
    expect(el.style.userSelect).toBe('');
    document.body.removeChild(el);
  });
});
