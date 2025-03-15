/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // Allow only HTTPS
        hostname: "res.cloudinary.com", // Allow images from Cloudinary
      },
      {
        protocol: "https", // Allow only HTTPS
        hostname: "images.pexels.com", // Allow images from Pexels
      },
    ],
  },
};

module.exports = nextConfig; 