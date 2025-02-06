import { fileURLToPath } from "url";
import bundleAnalyzer from "@next/bundle-analyzer";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@acme/api",
    "@acme/auth",
    "@acme/db",
    "@acme/ui",
    "@acme/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // rewrites: async () => {
  //   return [
  //     {
  //       source: "/api/cambridge/search/amp",
  //       destination:
  //         "https://viblo.asia/p/alpinejs-neu-react-la-qua-thua-yMnKMjaQZ7P",
  //     },
  //   ];
  // },
  experimental: {
    // TODO: add necessary packages
    optimizePackageImports: ["@acme/ui"],
    turbo: {
      // treeShaking: true,
    },
  },
  images: {
    // domains: ["public.blob.vercel-storage.com", "fsiigeunka7hxdh7.public.blob.vercel-storage.com"],
    remotePatterns: [
      {
        // protocol: 'https',
        hostname: "*.public.blob.vercel-storage.com",
        // port: '',
        // pathname: '/account123/**',
      },
    ],
  },
  // images: {
  //   domains: ['platform-lookaside.fbsbx.com', 'firebasestorage.googleapis.com'],
  // },
  // webpack(config) {
  //   config.module.rules.push({
  //     test: /\.svg$/,
  //     use: ['@svgr/webpack'],
  //   })
  //   return config
  // },
  // webpack: (config) => {
  //   config.module.rules.push({
  //     test: /index\.(js|mjs|jsx|ts|tsx)$/,
  //     include: (mPath) => mPath.includes("@acme/react/components"),
  //     sideEffects: false,
  //   });
  //   return config;
  // },
};
export default withBundleAnalyzer(config);
