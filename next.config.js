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
};

module.exports = nextConfig;
