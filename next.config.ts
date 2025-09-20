/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  images: {
    domains: ['localhost', 'recruiter.gennextit.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'recruiter.gennextit.com',
        pathname: '/**',
      },
    ],
  },
  // Only add rewrites in development if not using API routes
  async rewrites() {
    // Only use rewrites if you're NOT using the API route proxy
    if (process.env.NODE_ENV === 'development' && process.env.USE_REWRITES === 'true') {
      const frappeBaseUrl = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL;
      
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
    }
    return [];
  },
  // Headers for CORS handling
  async headers() {
    return [
      {
        source: '/api/frappe/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie' 
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;