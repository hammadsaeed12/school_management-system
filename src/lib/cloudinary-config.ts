/**
 * Cloudinary Configuration
 * 
 * This file centralizes Cloudinary configuration to ensure consistent
 * environment variable usage throughout the application.
 */

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
};

// Validate configuration
if (!cloudinaryConfig.cloudName) {
  console.error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable');
}

if (!cloudinaryConfig.apiKey) {
  console.error('Missing NEXT_PUBLIC_CLOUDINARY_API_KEY environment variable');
}

export default cloudinaryConfig; 