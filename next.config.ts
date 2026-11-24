import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Runtime reads (process.cwd()-relative) must be traced into the serverless bundle.
  outputFileTracingIncludes: {
    "/api/analyze": ["./prompts/**/*", "./knowledge-base/**/*"],
  },
};

export default nextConfig;
