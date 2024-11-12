import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcssSimpleVars from 'postcss-simple-vars'
import tailwindcssNesting from 'tailwindcss/nesting'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log('command:', command, 'mode:', mode)
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
          target: env.PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
    css: {
      postcss: {
        plugins: [postcssImport, postcssNested, postcssSimpleVars, tailwindcssNesting, tailwindcss, autoprefixer],
      },
    },
  }
})
