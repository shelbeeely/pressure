// Browser capability detection for pressure-sensitive input APIs.

export let supportsTouch = false;
export let supportsPointer = false;
export let supportsTouchForceChange = false;

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
