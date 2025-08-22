import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import { execSync } from "child_process"
import packageJson from "./package.json"

const gitCommit = execSync("git rev-parse --short HEAD").toString().trim()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000
  },
  define: {
    gitCommit: JSON.stringify(gitCommit),
    version: JSON.stringify(packageJson.version)
  },
  base: "./",
  build: {
    outDir: "out",
    sourcemap: true
  }
})
