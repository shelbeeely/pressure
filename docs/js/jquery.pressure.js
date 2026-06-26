// Pressure v2.2.0 | Stuart Yamartino | MIT License | 2015 - 2026
import Pressure from './pressure.js';

// Holds the site-wide default configuration for Pressure.
const Config = {
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

/**
 * Map a value from one numeric range to another.
 * Mirrors the Processing / Arduino map() function.
 * @see https://processing.org/reference/map_.html
 */
function map(x, inMin, inMax, outMin, outMax) {
  return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Install the Pressure jQuery plugin onto a jQuery instance.
 *
 * @example
 * import $ from 'jquery';
 * import { installPressureJQuery } from 'pressure/jquery';
 * installPressureJQuery($);
 *
 * $('#el').pressure({ change(force) { console.log(force); } });
 */
function installPressureJQuery($) {
  if (!$) throw new Error('Pressure jQuery plugin requires a jQuery instance.');

  $.fn.pressure = function (closure, options) {
    Pressure.set(this, closure, options);
    return this;
  };

  $.pressureConfig = function (options) {
    Config.set(options);
  };

  $.pressureMap = function (x, inMin, inMax, outMin, outMax) {
    return map(x, inMin, inMax, outMin, outMax);
  };
}

export { installPressureJQuery as default, installPressureJQuery };
