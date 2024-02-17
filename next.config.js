/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose", // <-- add this
    serverComponentsExternalPackages: ["mongoose"] // <-- and this
  },
  output: "standalone",
  images: {
    domains: ["images.unsplash.com"],
  },
};

module.exports = nextConfig;
