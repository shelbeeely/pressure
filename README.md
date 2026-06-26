# Pressure.js

[![npm](https://img.shields.io/npm/v/pressure.svg)](https://www.npmjs.com/package/pressure)
[![CI](https://github.com/shelbeeely/pressure/actions/workflows/ci.yml/badge.svg)](https://github.com/shelbeeely/pressure/actions/workflows/ci.yml)

Pressure is a lightweight JavaScript library for handling pointer pressure, 3D Touch, and Apple Pencil force through a single, unified API.

**Supported input methods**

| Device / API | Notes |
|---|---|
| Pointer Events (`event.pressure`) | Wacom / stylus tablets, Apple Pencil on iPad (iOS 13+), future pointer devices |
| Touch force (`touchforcechange`) | iPad with Apple Pencil (legacy touch path) |
| Polyfill | Any device – counts from 0 → 1 over time when pressure is unavailable |

> **Removed in this version:** The WebKit Force Touch mouse API (`webkitmouseforcechanged`) was removed from Safari 16.1 (2022) and is no longer supported.

## Install

```sh
npm install pressure
```

## Usage

### ES module (recommended)

```js
import Pressure from 'pressure';

Pressure.set('#my-element', {
  start(event) {
    // press begins
  },
  change(force, event) {
    // force is a value from 0 to 1
    this.style.transform = `scale(${Pressure.map(force, 0, 1, 1, 1.5)})`;
  },
  end() {
    // press ends
  },
  startDeepPress(event) {
    // force exceeded 0.5 ("deep press")
  },
  endDeepPress() {
    // deep press released
  },
  unsupported() {
    // only fires when polyfill is disabled and the device has no pressure support
  },
});
```

> **Note:** Inside each callback, `this` is the element that received the press.

### Script tag (UMD)

```html
<script src="https://unpkg.com/pressure/dist/pressure.umd.min.js"></script>
<script>
  Pressure.set('#my-element', {
    change(force) { this.textContent = force.toFixed(2); },
  });
</script>
```

### CommonJS

```js
const { Pressure } = require('pressure');
```

## API

### `Pressure.set(selector, block [, options])`

Attach pressure listeners to one or more elements.

- **selector** – CSS selector string, a DOM `Element`, a `NodeList`, or any array-like of elements.
- **block** – object containing any of: `start`, `end`, `startDeepPress`, `endDeepPress`, `change`, `unsupported`.
- **options** – optional per-element config (see [Options](#options)).

### `Pressure.config(options)`

Set site-wide defaults. Per-element options always override these.

```js
Pressure.config({
  polyfill: true,
  polyfillSpeedUp: 1000,
  polyfillSpeedDown: 0,
  preventDefault: true,
  only: null,
});
```

### `Pressure.map(value, inMin, inMax, outMin, outMax)`

Map a value from one numeric range to another (mirrors the [Processing `map()`](https://processing.org/reference/map_.html) function).

```js
// Map force (0–1) to width (100–200 px)
this.style.width = Pressure.map(force, 0, 1, 100, 200) + 'px';
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `polyfill` | `boolean` | `true` | Time-based 0→1 fallback on unsupported devices. Set `false` to fire `unsupported` instead. |
| `polyfillSpeedUp` | `number` | `1000` | Milliseconds to ramp from 0→1 in polyfill mode. |
| `polyfillSpeedDown` | `number` | `0` | Milliseconds to ramp from 1→0 on release in polyfill mode (`0` = instant). |
| `preventSelect` | `boolean` | `true` | Disables text selection and iOS callout menu on the element. |
| `only` | `'touch'` \| `'pointer'` \| `null` | `null` | Constrain to a specific input type. `null` = auto-detect. |

```js
// Only respond to pointer events (stylus / Apple Pencil)
Pressure.set('#canvas', { change(f) { draw(f); } }, { only: 'pointer' });

// Disable polyfill – fire `unsupported` instead
Pressure.set('#el', {
  change(f) { this.textContent = f; },
  unsupported() { this.textContent = 'Pressure not supported'; },
}, { polyfill: false });
```

## jQuery plugin (legacy)

```js
import $ from 'jquery';
import { installPressureJQuery } from 'pressure/jquery';

installPressureJQuery($);

$('#my-element').pressure({ change(force) { console.log(force); } });
$.pressureConfig({ polyfill: false });
$.pressureMap(0.5, 0, 1, 100, 200);
```

## Development

```sh
npm install        # install dependencies
npm run build      # build dist/
npm test           # run tests
npm run lint       # run ESLint
```

## License

MIT © Stuart Yamartino
