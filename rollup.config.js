import terser from '@rollup/plugin-terser';

const banner = '// Pressure v2.2.0 | Stuart Yamartino | MIT License | 2015 - 2026';

export default [
  // Main library (ESM + CJS for Node/bundlers)
  {
    input: 'src/pressure.js',
    output: [
      {
        file: 'dist/pressure.js',
        format: 'esm',
        banner,
      },
      {
        file: 'dist/pressure.cjs',
        format: 'cjs',
        exports: 'named',
        banner,
      },
    ],
  },
  // Browser IIFE build — exposes window.Pressure = { set, config, map }
  {
    input: 'src/pressure.browser.js',
    output: {
      file: 'dist/pressure.umd.min.js',
      format: 'iife',
      name: 'Pressure',
      exports: 'default',
      banner,
      plugins: [terser()],
    },
  },
  // jQuery plugin (separate optional entry point)
  {
    input: 'src/jquery_pressure.js',
    external: (id) => id === 'jquery' || id.startsWith('./pressure'),
    output: {
      file: 'dist/jquery.pressure.js',
      format: 'esm',
      banner,
    },
  },
];
