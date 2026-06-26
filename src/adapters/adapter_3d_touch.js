import { Adapter } from './adapter.js';
import { supportsTouchForceChange } from '../detect.js';

/**
 * Adapter for touch devices that report force via touch events
 * (iPads with Apple Pencil, older iPhones with 3D Touch hardware).
 */
export class Adapter3DTouch extends Adapter {
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
