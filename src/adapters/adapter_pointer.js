import { Adapter } from './adapter.js';

/**
 * Adapter for devices that expose pressure via the Pointer Events API.
 * This covers: Wacom/stylus tablets, Apple Pencil on iPad (iOS 13+),
 * and any future pointer-capable pressure device.
 */
export class AdapterPointer extends Adapter {
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
