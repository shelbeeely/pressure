import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Adapter } from '../src/adapters/adapter.js';
import { Config } from '../src/config.js';

// Reset Config before each test.
beforeEach(() => {
  Config.set({ polyfill: true, polyfillSpeedUp: 1000, polyfillSpeedDown: 0,
               preventSelect: true, only: null });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function makeAdapter(blockOverride = {}, options = {}) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const block = { start: vi.fn(), end: vi.fn(), change: vi.fn(),
                  startDeepPress: vi.fn(), endDeepPress: vi.fn(),
                  unsupported: vi.fn(), ...blockOverride };
  return { el, block, adapter: new Adapter(el, block, options) };
}

describe('Adapter state machine', () => {
  it('starts as not pressed', () => {
    const { adapter } = makeAdapter();
    expect(adapter.isPressed()).toBe(false);
  });

  it('_startPress sets pressed and calls start callback', () => {
    const { adapter, block } = makeAdapter();
    const event = new Event('pointerdown');
    adapter._startPress(event);
    expect(adapter.isPressed()).toBe(true);
    expect(block.start).toHaveBeenCalledWith(event);
  });

  it('_startPress is a no-op when already pressed', () => {
    const { adapter, block } = makeAdapter();
    const event = new Event('pointerdown');
    adapter._startPress(event);
    adapter._startPress(event);
    expect(block.start).toHaveBeenCalledTimes(1);
  });

  it('_endPress calls end callback and resets state', () => {
    const { adapter, block } = makeAdapter();
    const event = new Event('pointerdown');
    adapter._startPress(event);
    adapter._endPress();
    expect(adapter.isPressed()).toBe(false);
    expect(block.end).toHaveBeenCalledTimes(1);
  });

  it('_startDeepPress fires when force >= 0.5', () => {
    const { adapter, block } = makeAdapter();
    adapter._startPress(new Event('pointerdown'));
    adapter.deepPress(0.6, new Event('pointermove'));
    expect(block.startDeepPress).toHaveBeenCalledTimes(1);
  });

  it('_endDeepPress fires when force drops below 0.5', () => {
    const { adapter, block } = makeAdapter();
    adapter._startPress(new Event('pointerdown'));
    adapter.deepPress(0.6, new Event('pointermove'));
    adapter.deepPress(0.3, new Event('pointermove'));
    expect(block.endDeepPress).toHaveBeenCalledTimes(1);
  });
});

describe('Adapter polyfill', () => {
  it('runs the polyfill and increments force over time', () => {
    const { adapter, block } = makeAdapter({}, { polyfill: true, polyfillSpeedUp: 100 });
    const event = new Event('touchstart');
    adapter.fail(event, adapter.runKey);

    // After 10ms intervals the polyfill increments force (10/100 = 0.1 per tick)
    vi.advanceTimersByTime(50);
    expect(block.change).toHaveBeenCalled();
    const lastForce = block.change.mock.calls.at(-1)[0];
    expect(lastForce).toBeGreaterThan(0);
    expect(lastForce).toBeLessThanOrEqual(1);
  });

  it('calls unsupported when polyfill is disabled', () => {
    const { adapter, block } = makeAdapter({}, { polyfill: false });
    const event = new Event('touchstart');
    adapter.fail(event, adapter.runKey);
    expect(block.unsupported).toHaveBeenCalledWith(event);
  });
});
