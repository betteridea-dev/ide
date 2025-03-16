import { execSync } from "child_process";
import packageJson from "./package.json" assert { type: "json" };
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"

// fetch local gitHash
const gitHash = execSync("git rev-parse --short HEAD").toString().trim();


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  basePath: "",
  env: {
    version: packageJson.version,
    gitHash: gitHash,
  },
  webpack: (config, { isServer }) => {
    // Only apply this plugin on the client-side bundle
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin());
    }
    return config;
  }
};

export default nextConfig;
