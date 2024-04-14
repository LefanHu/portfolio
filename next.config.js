/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   esmExternals: "loose",
  //   serverComponentsExternalPackages: ["mongoose"]
  // },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: `${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com`,
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: `${process.env.AWS_SNEAK_ATTACS_BUCKET}.s3.amazonaws.com`,
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
