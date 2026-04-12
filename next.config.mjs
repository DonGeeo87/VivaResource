/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'lh3.googleusercontent.com',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'firebasestorage.googleapis.com',
  },
  {
    protocol: 'https',
    hostname: 'res.cloudinary.com',
  },
];

// Only allow placeholder images in development
if (isDev) {
  remotePatterns.push({
    protocol: 'https',
    hostname: 'via.placeholder.com',
  });
}

const nextConfig = {
  images: {
    remotePatterns,
    // Formatos permitidos
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
