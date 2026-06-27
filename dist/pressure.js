// Pressure v2.2.0 | Stuart Yamartino | MIT License | 2015 - 2026
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

/** Returns true if the value is a DOM Element. */
function isElement(o) {
  return typeof HTMLElement === 'object'
    ? o instanceof HTMLElement
    : o != null && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
}

/**
 * Base adapter – all device-specific adapters extend this class.
 * It owns the polyfill loop and the shared press-state machine.
 */
class Adapter {
  constructor(el, block, options) {
    this.el = el;
    this.block = block;
    this.options = options;
    this.pressed = false;
    this.deepPressed = false;
    this.nativeSupport = false;
    this.runningPolyfill = false;
    this.runKey = Math.random();
  }

  setPressed(value)     { this.pressed = value; }
  setDeepPressed(value) { this.deepPressed = value; }
  isPressed()           { return this.pressed; }
  isDeepPressed()       { return this.deepPressed; }

  add(event, handler) {
    this.el.addEventListener(event, handler, false);
  }

  runClosure(method, ...args) {
    if (method in this.block) {
      this.block[method].apply(this.el, args);
    }
  }

  fail(event, runKey) {
    if (Config.get('polyfill', this.options)) {
      if (this.runKey === runKey) {
        this.runPolyfill(event);
      }
    } else {
      this.runClosure('unsupported', event);
    }
  }

  bindUnsupportedEvent() {
    this.add('touchstart', (event) => this.runClosure('unsupported', event));
  }

  _startPress(event) {
    if (!this.isPressed()) {
      this.runningPolyfill = false;
      this.setPressed(true);
      this.runClosure('start', event);
    }
  }

  _startDeepPress(event) {
    if (this.isPressed() && !this.isDeepPressed()) {
      this.setDeepPressed(true);
      this.runClosure('startDeepPress', event);
    }
  }

  _changePress(force, event) {
    this.nativeSupport = true;
    this.runClosure('change', force, event);
  }

  _endDeepPress() {
    if (this.isPressed() && this.isDeepPressed()) {
      this.setDeepPressed(false);
      this.runClosure('endDeepPress');
    }
  }

  _endPress() {
    if (!this.runningPolyfill) {
      if (this.isPressed()) {
        this._endDeepPress();
        this.setPressed(false);
        this.runClosure('end');
      }
      this.runKey = Math.random();
      this.nativeSupport = false;
    } else {
      this.setPressed(false);
    }
  }

  deepPress(force, event) {
    force >= 0.5 ? this._startDeepPress(event) : this._endDeepPress();
  }

  runPolyfill(event) {
    const speedUp   = Config.get('polyfillSpeedUp',   this.options);
    const speedDown = Config.get('polyfillSpeedDown', this.options);
    this.increment = speedUp   === 0 ? 1 : 10 / speedUp;
    this.decrement = speedDown === 0 ? 1 : 10 / speedDown;
    this.setPressed(true);
    this.runClosure('start', event);
    if (!this.runningPolyfill) {
      this.loopPolyfillForce(0, event);
    }
  }

  loopPolyfillForce(force, event) {
    if (this.nativeSupport) return;

    if (this.isPressed()) {
      this.runningPolyfill = true;
      force = force + this.increment > 1 ? 1 : force + this.increment;
      this.runClosure('change', force, event);
      this.deepPress(force, event);
      setTimeout(() => this.loopPolyfillForce(force, event), 10);
    } else {
      force = force - this.decrement < 0 ? 0 : force - this.decrement;
      if (force < 0.5 && this.isDeepPressed()) {
        this.setDeepPressed(false);
        this.runClosure('endDeepPress');
      }
      if (force === 0) {
        this.runningPolyfill = false;
        this.setPressed(true);
        this._endPress();
      } else {
        this.runClosure('change', force, event);
        this.deepPress(force, event);
        setTimeout(() => this.loopPolyfillForce(force, event), 10);
      }
    }
  }

  // Expose map() for subclasses.
  static map(...args) { return map(...args); }
}

/**
 * Adapter for devices that expose pressure via the Pointer Events API.
 * This covers: Wacom/stylus tablets, Apple Pencil on iPad (iOS 13+),
 * and any future pointer-capable pressure device.
 */
class AdapterPointer extends Adapter {
  bindEvents() {
    this.add('pointerdown',  this.support.bind(this));
    this.add('pointermove',  this.change.bind(this));
    this.add('pointerup',    this._endPress.bind(this));
    this.add('pointerleave', this._endPress.bind(this));
    return this;
  }

  support(event) {
    if (!this.isPressed()) {
      // Touch pointers (finger) never carry real hardware pressure — only pen/stylus
      // pointers do. We also reject the spec-mandated placeholder values (0 and 0.5)
      // and anything > 1 that browsers sometimes emit.
      if (event.pointerType === 'touch' ||
          event.pressure === 0 || event.pressure === 0.5 || event.pressure > 1) {
        this.fail(event, this.runKey);
      } else {
        this._startPress(event);
        this._changePress(event.pressure, event);
      }
    }
  }

  change(event) {
    if (this.isPressed() && event.pointerType !== 'touch' &&
        event.pressure > 0 && event.pressure !== 0.5) {
      this._changePress(event.pressure, event);
      this.deepPress(event.pressure, event);
    }
  }
}

// Browser capability detection for pressure-sensitive input APIs.

let supportsTouch = false;
let supportsPointer = false;
let supportsTouchForceChange = false;

if (typeof window !== 'undefined') {
  let supportsTouchForce = false;

  if (typeof Touch !== 'undefined') {
    // Android requires arguments to construct a Touch; guard with try/catch.
    try {
      if (Object.prototype.hasOwnProperty.call(Touch.prototype, 'force') || 'force' in new Touch()) {
        supportsTouchForce = true;
      }
    } catch (_e) { /* ignore */ }
  }

  supportsTouch         = 'ontouchstart'      in window.document && supportsTouchForce;
  supportsPointer       = 'onpointermove'     in window.document;
  supportsTouchForceChange = 'ontouchforcechange' in window.document;
}

/**
 * Adapter for touch devices that report force via touch events
 * (iPads with Apple Pencil, older iPhones with 3D Touch hardware).
 */
class Adapter3DTouch extends Adapter {
  bindEvents() {
    if (supportsTouchForceChange) {
      this.add('touchforcechange', this.start.bind(this));
      this.add('touchstart',       this.support.bind(this, 0));
    } else {
      // Devices that report force on touchstart but not via touchforcechange.
      this.add('touchstart', this.support.bind(this, 0));
    }
    this.add('touchend', this._endPress.bind(this));
    return this;
  }

  start(event) {
    if (event.touches.length > 0) {
      this._startPress(event);
      const touch = this.selectTouch(event);
      if (touch) {
        this._changePress(touch.force, event);
      }
    }
  }

  // Poll up to 6 times to confirm the device actually reports pressure.
  support(iter, event, runKey = this.runKey) {
    if (!this.isPressed()) {
      if (iter <= 6) {
        setTimeout(() => this.support(iter + 1, event, runKey), 10);
      } else {
        this.fail(event, runKey);
      }
    }
  }

  // Link the touch point to the correct element to support multi-touch.
  selectTouch(event) {
    if (event.touches.length === 1) {
      return this.returnTouch(event.touches[0], event);
    }
    for (const touch of Array.from(event.touches)) {
      if (touch.target === this.el || this.el.contains(touch.target)) {
        return this.returnTouch(touch, event);
      }
    }
    return null;
  }

  returnTouch(touch, event) {
    this.deepPress(touch.force, event);
    return touch;
  }
}

class PressureElement {
  constructor(el, block, options) {
    this.routeEvents(el, block, options);
    this.preventSelect(el, options);
  }

  routeEvents(el, block, options) {
    const type = Config.get('only', options);

    if (supportsPointer && (type === 'pointer' || type === null)) {
      new AdapterPointer(el, block, options).bindEvents();
    } else if (supportsTouch && (type === 'touch' || type === null)) {
      new Adapter3DTouch(el, block, options).bindEvents();
    } else {
      new Adapter(el, block, options).bindUnsupportedEvent();
    }
  }

  // Prevent text selection, iOS callout menu, and system force-touch actions.
  preventSelect(el, options) {
    if (Config.get('preventSelect', options)) {
      el.style.webkitTouchCallout = 'none';
      el.style.userSelect = 'none';
    }
  }
}

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

export { Pressure, Pressure as default };
