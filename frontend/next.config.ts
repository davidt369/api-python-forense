import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(process.cwd(), ".."),
  },
  serverExternalPackages: ["better-sqlite3", "@prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000"
      },
    ],
  },
};

export default nextConfig;
