'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { getBrandConfig, generateCSSVariables, BrandConfig } from '@/lib/brand/config';

interface ThemeContextType {
  brandConfig: BrandConfig;
  applyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const brandConfig = getBrandConfig();

  const applyTheme = () => {
    // Inject CSS variables into the document
    const cssVariables = generateCSSVariables(brandConfig);
    
    // Remove existing style element if it exists
    const existingStyle = document.getElementById('dynamic-theme');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = 'dynamic-theme';
    style.textContent = cssVariables;
    document.head.appendChild(style);

    // Update document title and favicon
    document.title = brandConfig.name;
    
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = brandConfig.favicon;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = brandConfig.favicon;
      document.head.appendChild(newFavicon);
    }
  };

  useEffect(() => {
    applyTheme();
  }, [brandConfig]);

  return (
    <ThemeContext.Provider value={{ brandConfig, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}