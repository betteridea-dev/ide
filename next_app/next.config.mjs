import { execSync } from "child_process";
import packageJson from "./package.json" assert { type: "json" };

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
};

export default nextConfig;
