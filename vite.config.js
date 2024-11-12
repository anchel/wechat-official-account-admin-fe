import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3001,
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
