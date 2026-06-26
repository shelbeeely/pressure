// Type declarations for Pressure.js

export interface PressureBlock {
  /** Called when a press begins. */
  start?(event: Event): void;
  /** Called when a press ends. */
  end?(): void;
  /** Called when pressure exceeds 0.5 ("force click" / "deep press"). */
  startDeepPress?(event: Event): void;
  /** Called when a deep press ends. */
  endDeepPress?(): void;
  /**
   * Called on every pressure change.
   * @param force A value between 0 and 1.
   */
  change?(force: number, event: Event): void;
  /**
   * Called on first touch when the device does not support pressure
   * and the polyfill option is disabled.
   */
  unsupported?(event: Event): void;
}

export interface PressureOptions {
  /**
   * When `true` (default) a time-based fallback is used on devices
   * that do not support pressure. Set to `false` to fire `unsupported`
   * instead.
   */
  polyfill?: boolean;
  /** Milliseconds to ramp from 0 → 1 in polyfill mode. Default: 1000. */
  polyfillSpeedUp?: number;
  /** Milliseconds to ramp from 1 → 0 on release in polyfill mode. Default: 0 (instant). */
  polyfillSpeedDown?: number;
  /**
   * Prevents text selection and iOS callout actions on the element.
   * Default: `true`.
   */
  preventSelect?: boolean;
  /**
   * Constrain Pressure to a specific input type.
   * - `'touch'`   – touch events only (3D Touch / Apple Pencil via touch API)
   * - `'pointer'` – pointer events only (Wacom, Apple Pencil via pointer API)
   * - `null`      – auto-detect (default)
   */
  only?: 'touch' | 'pointer' | null;
}

type Selector = string | Element | NodeList | ArrayLike<Element>;

export interface PressureStatic {
  /**
   * Attach pressure listeners to one or more elements.
   * @param selector CSS selector string, DOM element, NodeList, or array-like.
   * @param block    Callback object.
   * @param options  Optional configuration overrides.
   */
  set(selector: Selector, block: PressureBlock, options?: PressureOptions): void;

  /**
   * Set site-wide default options.
   * Per-element options passed to `set()` always take precedence.
   */
  config(options: PressureOptions): void;

  /**
   * Map a value from one numeric range to another.
   * @param x      Input value.
   * @param inMin  Lower bound of the input range.
   * @param inMax  Upper bound of the input range.
   * @param outMin Lower bound of the output range.
   * @param outMax Upper bound of the output range.
   */
  map(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
}

declare const Pressure: PressureStatic;

export { Pressure };
export default Pressure;
