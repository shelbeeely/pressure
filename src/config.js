// Holds the site-wide default configuration for Pressure.
export const Config = {
  // false disables the polyfill; the 'unsupported' callback fires instead.
  polyfill: true,
  // milliseconds to ramp from 0 → 1 in polyfill mode.
  polyfillSpeedUp: 1000,
  // milliseconds to ramp from 1 → 0 when the press ends in polyfill mode.
  polyfillSpeedDown: 0,
  // true prevents text selection, iOS callout, and force-touch system actions.
  preventSelect: true,
  // 'touch', or 'pointer' constrains Pressure to that event type; null = auto.
  only: null,

  /** Return the option value, falling back to the global config. */
  get(option, options) {
    return Object.prototype.hasOwnProperty.call(options, option) ? options[option] : this[option];
  },

  /** Merge options into the global config. */
  set(options) {
    for (const k of Object.keys(options)) {
      if (Object.prototype.hasOwnProperty.call(this, k) && k !== 'get' && k !== 'set') {
        this[k] = options[k];
      }
    }
  },
};
