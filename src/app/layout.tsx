import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { getBrandConfig } from '@/lib/brand/config';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const brandConfig = getBrandConfig();
  
  return {
    title: brandConfig.name,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Management System',
    icons: {
      icon: brandConfig.favicon,
      apple: brandConfig.favicon,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
           <Toaster
            position="top-right"
            containerStyle={{
              top: 20,
              right: 20,
              zIndex: 9999,
            }}
            toastOptions={{
              className: "",
              style: {
                border: "1px solid #713200",
                padding: "16px",
                color: "#713200",
                fontSize: "14px",
                maxWidth: "350px",
                wordBreak: "break-word",
                zIndex: 9999,
              },
              success: {
                className: "border border-green-500 text-green-700",
                style: {
                  border: "1px solid #22c55e",
                  color: "#15803d",
                },
              },
              error: {
                className: "border border-red-500 text-red-700",
                style: {
                  border: "1px solid #ef4444",
                  color: "#dc2626",
                },
              },
              duration: 3000,
            }}
            gutter={8}
          />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}