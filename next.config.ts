import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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


export default nextConfig;
