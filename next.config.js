const remotePatterns = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "**",
  },
];

if (process.env.AWS_BUCKET_NAME) {
  remotePatterns.push({
    protocol: "https",
    hostname: `${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com`,
    pathname: "**",
  });
}

if (process.env.AWS_SNEAK_ATTACS_BUCKET) {
  remotePatterns.push({
    protocol: "https",
    hostname: `${process.env.AWS_SNEAK_ATTACS_BUCKET}.s3.amazonaws.com`,
    pathname: "**",
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns,
  },
  // iOS and Safari probe these legacy paths regardless of the <link> tags.
  async rewrites() {
    return [
      { source: "/apple-touch-icon.png", destination: "/apple-icon.png" },
      { source: "/apple-touch-icon-precomposed.png", destination: "/apple-icon.png" },
    ];
  },
};

module.exports = nextConfig;
