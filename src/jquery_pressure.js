import Pressure from './pressure.js';
import { Config } from './config.js';
import { map } from './utils.js';

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
export function installPressureJQuery($) {
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

export default installPressureJQuery;
