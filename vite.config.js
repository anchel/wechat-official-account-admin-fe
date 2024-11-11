import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

import path from 'path'

import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcssSimpleVars from 'postcss-simple-vars'
import tailwindcssNesting from 'tailwindcss/nesting'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        template: fileURLToPath(new URL('template.html', import.meta.url)),
      },
      output: {
        chunkFileNames: 'assets/chunks/c-[name]-[hash].js',
        manualChunks: {
          'element-plus': ['element-plus'],
        },
      },
    },
    chunkSizeWarningLimit: 4096,
    manifest: true,
  },
  plugins: [
    vue(),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9305',
        changeOrigin: true,
      },
    },
  },
  css: {
    postcss: {
      plugins: [postcssImport, postcssNested, postcssSimpleVars, tailwindcssNesting, tailwindcss, autoprefixer],
    },
  },
})
