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
    // Dispositivos comunes para optimización
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Headers de seguridad para HSTS preload y mejor SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS con preload para mejorar seguridad
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Prevenir clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevenir MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Política dereferrer estricta
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Optimización de compilación para navegadores modernos
  compiler: {
    // Remover console en producción
    removeConsole: isDev ? false : true,
  },
  // Optimizar bundles
  webpack: (config, { dev, isServer }) => {
    // Solo en producción y del lado del cliente
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Separar Firebase en su propio chunk
          firebase: {
            name: 'firebase',
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            priority: 20,
          },
          // Separar Recaptcha
          recaptcha: {
            name: 'recaptcha',
            test: /[\\/]node_modules[\\/]react-google-recaptcha/,
            priority: 15,
          },
          // Separar PayPal
          paypal: {
            name: 'paypal',
            test: /[\\/]node_modules[\\/]@paypal/,
            priority: 15,
          },
          // Librerías UI comunes
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
          // Vendor principal
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 5,
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }
    return config;
  },
};

export default nextConfig;
