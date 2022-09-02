import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  entries: ['./src/index'],
  externals: [
    'vite',
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },
})

