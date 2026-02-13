import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/main.js',
      output: {
        entryFileNames: 'app.js',
        assetFileNames: (assetInfo) => {
          return assetInfo.name && assetInfo.name.endsWith('.css') ? 'app.css' : 'assets/[name]-[hash][extname]';
        },
      },
    },
    outDir: 'dist',
  },
});
