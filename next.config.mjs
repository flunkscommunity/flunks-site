// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 * 
 * For mobile builds, set MOBILE_BUILD=true to enable static export
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

// Check if this is a mobile build (Capacitor iOS/Android)
const isMobileBuild = process.env.MOBILE_BUILD === 'true';

/** @type {import("next").NextConfig} */
const config = {
  // Enable static export for mobile builds, disabled for Vercel (needs API routes)
  ...(isMobileBuild && { output: 'export' }),
  images: { unoptimized: true },
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    // Add a url-loader to webpack config
    config.module.rules.push({
      test: /\.(png|gif|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader',
      options: {
        limit: 100000,
      },
    });

    return config;
  }
};
export default config;
