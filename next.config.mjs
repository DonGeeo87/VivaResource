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
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  // Redirects 301: slugs de blog renombrados al alinear el posicionamiento.
  // Sin esto, los enlaces y el SEO acumulado de las URLs viejas se pierden.
  async redirects() {
    // Slugs que antes eran compartidos EN/ES (y por eso daban 404). Ahora cada
    // idioma tiene su URL propia: la vieja redirige al post en ingles.
    const sharedSlug = [
      'community-resource-fair-2026',
      'how-to-volunteer-guide',
      'welcome-to-viva-resource',
      'programs-transforming-lives',
      'food-security-rural-communities',
    ];
    const langAgnostic = [
      ['resources-for-immigrant-community', 'resources-available-for-the-community'],
      ['immigrant-resources-colorado', 'legal-aid-referrals-colorado'],
    ];
    return [
      ...sharedSlug.map((slug) => ({
        source: `/blog/${slug}`,
        destination: `/blog/${slug}-en`,
        permanent: true,
      })),
      ...langAgnostic.flatMap(([from, to]) => [
        { source: `/blog/${from}-en`, destination: `/blog/${to}-en`, permanent: true },
        { source: `/blog/${from}-es`, destination: `/blog/${to}-es`, permanent: true },
      ]),
    ];
  },
  compiler: {
    removeConsole: isDev ? false : true,
  },
};

export default nextConfig;