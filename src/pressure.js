import { Config } from './config.js';
import { map, isElement } from './utils.js';
import { PressureElement } from './element.js';

function loopPressureElements(selector, closure, options = {}) {
  if (typeof selector === 'string' || selector instanceof String) {
    document.querySelectorAll(selector).forEach(el => new PressureElement(el, closure, options));
  } else if (isElement(selector)) {
    new PressureElement(selector, closure, options);
  } else {
    // Node list, jQuery object, or any array-like.
    Array.from(selector).forEach(el => new PressureElement(el, closure, options));
  }
}

//--------------------- Public API ---------------------//
const Pressure = {
  /** Attach pressure listeners to one or more elements. */
  set(selector, closure, options) {
    loopPressureElements(selector, closure, options);
  },

  /** Set site-wide default options. */
  config(options) {
    Config.set(options);
  },

  /**
   * Map a value from one numeric range to another.
   * @example Pressure.map(force, 0, 1, 100, 200) → pixels
   */
  map(x, inMin, inMax, outMin, outMax) {
    return map(x, inMin, inMax, outMin, outMax);
  },
};

export { Pressure };
export default Pressure;
