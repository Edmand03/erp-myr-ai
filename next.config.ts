/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.hit-pay.com",
      },
      {
        protocol: "https",
        hostname: "api.sandbox.hit-pay.com",
      },
      {
        protocol: "https",
        hostname: "*.hit-pay.com",
      },
    ],
  },
  webpackDevMiddleware: (config) => {
    config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    return config;
  },
};

module.exports = nextConfig;
