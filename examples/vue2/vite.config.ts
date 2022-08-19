import { defineConfig, Plugin } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import vitePluginI18n from 'vite-plugin-i18n-auto'

const newPlugin = (): Plugin => {
  return {
    name: 'newPlugin',
    transform(code: string, id: string) {
      if (id.includes('App.vue')) {
        console.log('id:>>>', id)
        console.log('code:>>>', code)
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      createVuePlugin({
        jsx: true,
      }),
      vitePluginI18n({
        enable: true,
        autoASTRepalce: true,
        include: [
          '/src/**/*.{vue,tsx,ts}',
          // 匹配vue temperate
          '/src/**/*.vue?vue&type=template&lang.js',
        ],
        exclude: [],
        langList: ['zh_cn', 'en', 'jp'],
        ignoreMark: '!i18n:',
      }),
      newPlugin(),
    ],
    // 基础配置
    publicDir: 'public',
    resolve: {
      alias: {
        '@': '/src/',
      },
    },
    // 服务配置
    server: {
      port: 9527,
      open: true,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          // 生产环境去除console及debug
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  }
})

