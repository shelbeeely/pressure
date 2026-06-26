import { Config } from './config.js';
import { Adapter } from './adapters/adapter.js';
import { AdapterPointer } from './adapters/adapter_pointer.js';
import { Adapter3DTouch } from './adapters/adapter_3d_touch.js';
import { supportsPointer, supportsTouch } from './detect.js';

export class PressureElement {
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
