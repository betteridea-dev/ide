import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import dts from 'vite-plugin-dts'
import typescript from "@rollup/plugin-typescript";
import { typescriptPaths } from "rollup-plugin-typescript-paths";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: true,
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@betteridea/codecell',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      plugins: [
        typescriptPaths({
          preserveExtensions: true,
        }),
        typescript({
          sourceMap: true,
          declaration: true,
          outDir: "dist",
        })
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [react(), dts()],
})
