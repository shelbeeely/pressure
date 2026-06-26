import { describe, it, expect, beforeEach } from 'vitest';
import { Config } from '../src/config.js';

// Reset Config to defaults before each test.
const DEFAULTS = {
  polyfill: true,
  polyfillSpeedUp: 1000,
  polyfillSpeedDown: 0,
  preventSelect: true,
  only: null,
};

beforeEach(() => {
  Config.set(DEFAULTS);
});

describe('Config.get()', () => {
  it('returns the global default when the option is absent from the local object', () => {
    expect(Config.get('polyfill', {})).toBe(true);
  });

  it('returns the local override when provided', () => {
    expect(Config.get('polyfill', { polyfill: false })).toBe(false);
  });

  it('returns null for the default "only" option', () => {
    expect(Config.get('only', {})).toBeNull();
  });
});

describe('Config.set()', () => {
  it('updates a known key', () => {
    Config.set({ polyfill: false });
    expect(Config.polyfill).toBe(false);
  });

  it('updates multiple keys at once', () => {
    Config.set({ polyfillSpeedUp: 500, polyfillSpeedDown: 200 });
    expect(Config.polyfillSpeedUp).toBe(500);
    expect(Config.polyfillSpeedDown).toBe(200);
  });

  it('ignores unknown keys', () => {
    const before = { ...Config };
    Config.set({ unknownOption: 'boom' });
    expect(Config.polyfill).toBe(before.polyfill);
    expect('unknownOption' in Config).toBe(false);
  });

  it('does not allow overwriting get or set methods', () => {
    const originalGet = Config.get;
    Config.set({ get: () => 'hacked' });
    expect(Config.get).toBe(originalGet);
  });
});
