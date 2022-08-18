import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginI18n from 'vite-plugin-i18n-auto'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      vitePluginI18n({
        enable: true,
        autoASTRepalce: true,
        include: ['/src/**/*.{vue,tsx,ts}'],
        exclude: [],
        langList: ['zh_cn', 'en', 'jp'],
        ignoreMark: '!i18n:',
      }),
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

