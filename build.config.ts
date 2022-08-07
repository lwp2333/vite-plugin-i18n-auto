import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  entries: ['./src/index'],
  externals: [
    'vite',
    'prettier',
    '@babel/parser',
    '@babel/traverse',
    '@babel/types',
    '@babel/generator',
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },
})

