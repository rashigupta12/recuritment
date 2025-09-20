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

export const getBrandConfig = (): BrandConfig => {
  const primary = process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#10b981';
  const secondary = process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#059669';
  
  return {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || 'EITS',
    logo: process.env.NEXT_PUBLIC_BRAND_LOGO || '/brands/default/logo.svg',
    favicon: process.env.NEXT_PUBLIC_BRAND_FAVICON || '/brands/default/favicon.ico',
    colors: {
      primary,
      secondary,
      accent: process.env.NEXT_PUBLIC_ACCENT_COLOR || '#34d399',
      background: process.env.NEXT_PUBLIC_BACKGROUND_COLOR || '#ffffff',
      foreground: process.env.NEXT_PUBLIC_FOREGROUND_COLOR || '#000000',
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
  return `
    :root {
      --brand-primary: ${config.colors.primary};
      --brand-secondary: ${config.colors.secondary};
      --brand-accent: ${config.colors.accent};
      --brand-background: ${config.colors.background};
      --brand-foreground: ${config.colors.foreground};
      --brand-muted: ${config.colors.muted};
      --brand-muted-foreground: ${config.colors.mutedForeground};
      --brand-destructive: ${config.colors.destructive};
      --brand-destructive-foreground: ${config.colors.destructiveForeground};
      
      --font-primary: ${config.fonts.primary}, ui-sans-serif, system-ui;
      --font-heading: ${config.fonts.heading}, ui-sans-serif, system-ui;
    }
  `;
};