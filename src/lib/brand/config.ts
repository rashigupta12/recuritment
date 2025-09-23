export interface BrandConfig {
  name: string;
  logo: string;
  favicon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    destructiveForeground: string;
  };
  fonts: {
    primary: string;
    heading: string;
  };
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export const getBrandConfig = (): BrandConfig => {
  const primary = process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#2563eb';
  const secondary = process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#1d4ed8';
  
  return {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || 'EITS',
    logo: process.env.NEXT_PUBLIC_BRAND_LOGO || '/brands/default/logo.svg',
    favicon: process.env.NEXT_PUBLIC_BRAND_FAVICON || '/brands/default/favicon.ico',
    colors: {
      primary,
      secondary,
      accent: process.env.NEXT_PUBLIC_ACCENT_COLOR || '#3b82f6',
      background: process.env.NEXT_PUBLIC_BACKGROUND_COLOR || '#ffffff',
      foreground: process.env.NEXT_PUBLIC_FOREGROUND_COLOR || '#1f2937',
      muted: '#f8f9fa',
      mutedForeground: '#6b7280',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
    },
    fonts: {
      primary: process.env.NEXT_PUBLIC_FONT_FAMILY || 'Inter',
      heading: process.env.NEXT_PUBLIC_HEADING_FONT || 'Inter',
    },
  };
};

export const generateCSSVariables = (config: BrandConfig): string => {
  const primaryHsl = hexToHsl(config.colors.primary);
  const secondaryHsl = hexToHsl(config.colors.secondary);
  const accentHsl = hexToHsl(config.colors.accent);
  const backgroundHsl = hexToHsl(config.colors.background);
  const foregroundHsl = hexToHsl(config.colors.foreground);
  const destructiveHsl = hexToHsl(config.colors.destructive);
  
  // Determine if we're in dark mode based on background color
  const isDark = config.colors.background.toLowerCase() === '#000000' || 
                 config.colors.background.toLowerCase() === '#0f172a' ||
                 config.colors.background.toLowerCase() === '#111827';

  return `
    :root {
      /* Brand variables */
      --brand-primary: ${config.colors.primary};
      --brand-secondary: ${config.colors.secondary};
      --brand-accent: ${config.colors.accent};
      --brand-background: ${config.colors.background};
      --brand-foreground: ${config.colors.foreground};
      --brand-muted: ${config.colors.muted};
      --brand-muted-foreground: ${config.colors.mutedForeground};
      --brand-destructive: ${config.colors.destructive};
      --brand-destructive-foreground: ${config.colors.destructiveForeground};
      
      /* Font variables */
      --font-primary: ${config.fonts.primary}, ui-sans-serif, system-ui;
      --font-heading: ${config.fonts.heading}, ui-sans-serif, system-ui;
      
      /* Shadcn UI variables in HSL format */
      --background: ${backgroundHsl};
      --foreground: ${foregroundHsl};
      --primary: ${primaryHsl};
      --primary-foreground: 0 0% 100%;
      --secondary: ${secondaryHsl};
      --secondary-foreground: 0 0% 100%;
      --muted: ${isDark ? '217.2 32.6% 17.5%' : '210 40% 98%'};
      --muted-foreground: ${isDark ? '215 20.2% 65.1%' : '215.4 16.3% 46.9%'};
      --accent: ${accentHsl};
      --accent-foreground: 0 0% 100%;
      --destructive: ${destructiveHsl};
      --destructive-foreground: 0 0% 100%;
      --border: ${isDark ? '217.2 32.6% 17.5%' : '214.3 31.8% 91.4%'};
      --input: ${backgroundHsl};
      --ring: ${primaryHsl};
      --radius: 0.5rem;
      --card: ${backgroundHsl};
      --card-foreground: ${foregroundHsl};
      --popover: ${backgroundHsl};
      --popover-foreground: ${foregroundHsl};
    }
  `;
};