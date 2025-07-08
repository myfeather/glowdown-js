import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/glowdown.ts',
  output: {
    file: 'dist/glowdown.js',
    format: 'umd',
    name: 'Glowdown',
    globals: {
      'fetch': 'fetch'
    }
  },
  plugins: [
    typescript()
  ]
};
