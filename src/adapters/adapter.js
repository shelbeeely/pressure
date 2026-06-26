import { Config } from '../config.js';
import { map } from '../utils.js';

/**
 * Base adapter – all device-specific adapters extend this class.
 * It owns the polyfill loop and the shared press-state machine.
 */
export class Adapter {
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
