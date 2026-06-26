import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdapterPointer } from '../src/adapters/adapter_pointer.js';
import { Config } from '../src/config.js';

beforeEach(() => {
  Config.set({ polyfill: true, polyfillSpeedUp: 1000, polyfillSpeedDown: 0,
               preventSelect: true, only: null });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function makeEvent(type, pressure, pointerType = 'pen') {
  return Object.assign(new Event(type), { pressure, pointerType });
}

function makeAdapter(blockOverride = {}, options = {}) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const block = { start: vi.fn(), end: vi.fn(), change: vi.fn(),
                  startDeepPress: vi.fn(), endDeepPress: vi.fn(),
                  unsupported: vi.fn(), ...blockOverride };
  return { el, block, adapter: new AdapterPointer(el, block, options) };
}

describe('AdapterPointer – pen/stylus with real pressure', () => {
  it('starts press and fires change for a pen pointer with real pressure', () => {
    const { adapter, block } = makeAdapter();
    const down = makeEvent('pointerdown', 0.6, 'pen');
    adapter.support(down);
    expect(adapter.isPressed()).toBe(true);
    expect(block.start).toHaveBeenCalledWith(down);
    expect(block.change).toHaveBeenCalledWith(0.6, down);
  });

  it('fires change on pointermove for pen with real pressure', () => {
    const { adapter, block } = makeAdapter();
    adapter.support(makeEvent('pointerdown', 0.6, 'pen'));
    const move = makeEvent('pointermove', 0.8, 'pen');
    adapter.change(move);
    expect(block.change).toHaveBeenCalledWith(0.8, move);
  });

  it('fails with polyfill for pen pressure === 0.5 (placeholder value)', () => {
    const { adapter, block } = makeAdapter();
    adapter.support(makeEvent('pointerdown', 0.5, 'pen'));
    vi.advanceTimersByTime(100);
    expect(block.start).toHaveBeenCalled();
    expect(block.change).toHaveBeenCalled();
    expect(adapter.isPressed()).toBe(true);
  });
});

describe('AdapterPointer – touch pointer (Android finger)', () => {
  it('always fails for touch pointerType regardless of pressure value', () => {
    const { adapter, block } = makeAdapter({}, { polyfill: true });
    // Chrome Canary 151 on Android may report pressure=1 for touch
    adapter.support(makeEvent('pointerdown', 1, 'touch'));
    vi.advanceTimersByTime(100);
    // Polyfill should have fired, not native pressure path
    expect(block.start).toHaveBeenCalled();
    expect(block.change).toHaveBeenCalled();
  });

  it('fails for touch pointerType with pressure=0.5 (spec default)', () => {
    const { adapter, block } = makeAdapter({}, { polyfill: true });
    adapter.support(makeEvent('pointerdown', 0.5, 'touch'));
    vi.advanceTimersByTime(100);
    expect(block.start).toHaveBeenCalled();
  });

  it('calls unsupported for touch pointerType when polyfill is disabled', () => {
    const { adapter, block } = makeAdapter({}, { polyfill: false });
    adapter.support(makeEvent('pointerdown', 1, 'touch'));
    expect(block.unsupported).toHaveBeenCalled();
    expect(block.start).not.toHaveBeenCalled();
  });

  it('ignores pointermove change events from touch pointerType', () => {
    const { adapter, block } = makeAdapter({}, { polyfill: true });
    // Start via polyfill
    adapter.support(makeEvent('pointerdown', 0.5, 'touch'));
    vi.advanceTimersByTime(10);
    const callsBefore = block.change.mock.calls.length;
    // A touch pointermove should NOT fire _changePress (which would set nativeSupport=true)
    adapter.change(makeEvent('pointermove', 0.8, 'touch'));
    // change call count must not have increased from the touch pointermove alone
    expect(block.change.mock.calls.length).toBe(callsBefore);
  });
});
