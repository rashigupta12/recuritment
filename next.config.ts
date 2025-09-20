/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  images: {
    domains: ['localhost', 'your-frappe-server.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'your-frappe-server.com',
        pathname: '/**',
      },
    ],
  },
  // Rewrites for both development and production
  async rewrites() {
    const frappeBaseUrl = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;
    
    // Handle undefined environment variable
    if (!frappeBaseUrl) {
      console.error('NEXT_PUBLIC_FRAPPE_BASE_URL is not defined in environment variables');
      return [];
    }

    return [
      {
        source: '/api/frappe/:path*',
        destination: `${frappeBaseUrl}/api/:path*`,
      },
    ];
  },
  // Headers for CORS in development
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          ],
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;