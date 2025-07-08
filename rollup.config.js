import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/glowdown.ts',
    output: {
      file: 'dist/glowdown.mjs',
      format: 'esm'
    },
    plugins: [typescript()]
  },
  {
    input: 'src/glowdown.ts',
    output: {
      file: 'dist/glowdown.cjs',
      format: 'cjs'
    },
    plugins: [typescript()]
  }
];
