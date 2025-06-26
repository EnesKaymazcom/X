import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'animate-blob',
    'animate-blob-slow',
    'animation-delay-2000',
    'animation-delay-4000',
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'text-primary',
    'text-secondary',
    'text-accent',
    'bg-noise',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6419E6',
        'primary-dark': '#5113B8',
        secondary: '#E11D48',
        'secondary-dark': '#BE123C',
        accent: '#F59E0B',
        'accent-dark': '#D97706',
        background: '#050505', // Daha koyu siyah arkaplan
        foreground: '#E5E7EB',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        nesdesign: {
          "primary": "#6419E6",
          "primary-focus": "#5113B8",
          "primary-content": "#ffffff",
          "secondary": "#E11D48",
          "secondary-focus": "#BE123C",
          "secondary-content": "#ffffff",
          "accent": "#F59E0B",
          "accent-focus": "#D97706",
          "accent-content": "#ffffff",
          "neutral": "#1F2937",
          "neutral-focus": "#111827",
          "neutral-content": "#E5E7EB",
          "base-100": "#050505", // Daha koyu siyah arkaplan
          "base-200": "#0A0A0A", // Biraz daha açık siyah
          "base-300": "#101010", // Daha da açık siyah
          "base-content": "#E5E7EB",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
};

export default config;
