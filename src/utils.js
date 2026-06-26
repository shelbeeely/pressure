/**
 * Map a value from one numeric range to another.
 * Mirrors the Processing / Arduino map() function.
 * @see https://processing.org/reference/map_.html
 */
export function map(x, inMin, inMax, outMin, outMax) {
  return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/** Returns true if the value is a DOM Element. */
export function isElement(o) {
  return typeof HTMLElement === 'object'
    ? o instanceof HTMLElement
    : o != null && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
}
