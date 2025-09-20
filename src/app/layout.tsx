import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { getBrandConfig } from '@/lib/brand/config';
import './globals.css';

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
              toastOptions={{
                style: {
                  background: 'var(--brand-background)',
                  color: 'var(--brand-foreground)',
                  border: '1px solid var(--brand-primary)',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}