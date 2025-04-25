/**
 * Pure JavaScript Tailwind config for maximum compatibility with Next.js and Tailwind CLI.
 * All custom colors are in theme.extend.colors. No default colors are overridden.
 */

const { zinc } = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Next.js pages (if present)
    './lib/**/*.{js,ts,jsx,tsx,mdx}', // Shared libraries/utilities
    './utils/**/*.{js,ts,jsx,tsx,mdx}', // Utility folders (if present)
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // NOTE: Do NOT override the default Tailwind color palette destructively.
      // Always use theme.extend.colors to add or customize colors.
      // The zinc palette is included by default and is safe to use (e.g., border-zinc-200).
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          success: {
            DEFAULT: 'hsl(142, 76%, 36%)',
            foreground: 'hsl(0, 0%, 98%)',
            muted: 'hsl(142, 76%, 95%)',
          },
          info: {
            DEFAULT: 'hsl(217, 91%, 60%)',
            foreground: 'hsl(0, 0%, 98%)',
            muted: 'hsl(217, 91%, 95%)',
          },
          warning: {
            DEFAULT: 'hsl(38, 92%, 50%)',
            foreground: 'hsl(0, 0%, 10%)',
            muted: 'hsl(38, 92%, 95%)',
          },
          energy: {
            DEFAULT: 'hsl(326, 100%, 60%)',
            foreground: 'hsl(0, 0%, 98%)',
            muted: 'hsl(326, 100%, 95%)',
          },
          calm: {
            DEFAULT: 'hsl(199, 89%, 48%)',
            foreground: 'hsl(0, 0%, 98%)',
            muted: 'hsl(199, 89%, 95%)',
          },
          'lime-green-emerald': {
            500: '#84CC16',
            600: '#34D399',
          },
          'rose-red-orange': {
            500: '#F43F5E',
            600: '#F97316',
          },
          'red-green-blue': {
            500: '#EF4444',
            600: '#22C55E',
            700: '#3B82F6',
          },
          'violet-purple-fuchsia': {
            500: '#8B5CF6',
            600: '#A855F7',
            700: '#D946EF',
          },
          'sky-blue-indigo': {
            500: '#0EA5E9',
            600: '#3B82F6',
            700: '#6366F1',
          },
        },
        zinc,
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          background: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        supercivilization: {
          DEFAULT: '#71717a',
          light: '#a1a1aa',
          dark: '#3f3f46',
          token: '#27272a',
        },
        superachiever: {
          DEFAULT: '#78716c',
          light: '#a8a29e',
          dark: '#57534e',
          token: '#44403c',
        },
        personalSuccess: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          token: '#eab308',
        },
        businessSuccess: {
          DEFAULT: '#14b8a6',
          light: '#2dd4bf',
          dark: '#0d9488',
          token: '#06b6d4',
        },
        supermind: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
          secondary: '#d946ef',
          accent: '#ec4899',
          token: '#d946ef',
        },
        superachievers: {
          DEFAULT: '#64748b',
          light: '#94a3b8',
          dark: '#475569',
          token: '#334155',
        },
        superpuzzle: {
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
          token: '#6366f1',
        },
        superhuman: {
          DEFAULT: '#f43f5e',
          light: '#fb7185',
          dark: '#e11d48',
          secondary: '#ef4444',
          accent: '#f97316',
          token: '#f43f5e',
        },
        supersociety: {
          DEFAULT: '#84cc16',
          light: '#a3e635',
          dark: '#65a30d',
          secondary: '#22c55e',
          accent: '#10b981',
          token: '#22c55e',
        },
        supergenius: {
          DEFAULT: '#0ea5e9',
          light: '#38bdf8',
          dark: '#0284c7',
          secondary: '#3b82f6',
          accent: '#6366f1',
          token: '#3b82f6',
        },
      },
      borderColor: {
        ...zinc,
      },
      backgroundColor: {
        ...zinc,
      },
      textColor: {
        ...zinc,
      },
      fontFamily: {
        sans: ['Inter'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'supercivilization-gradient': 'linear-gradient(to right, #a1a1aa, #71717a, #3f3f46)',
        'superachiever-gradient': 'linear-gradient(to right, #a8a29e, #78716c, #57534e)',
        'personal-success-gradient': 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)',
        'business-success-gradient': 'linear-gradient(to right, #2dd4bf, #14b8a6, #0d9488)',
        'supermind-gradient':
          'linear-gradient(to right, #a78bfa, #8b5cf6, #7c3aed, #d946ef, #ec4899)',
        'superachievers-gradient': 'linear-gradient(to right, #94a3b8, #64748b, #475569)',
        'superpuzzle-gradient': 'linear-gradient(to right, #ef4444, #22c55e, #3b82f6)',
        'superhuman-gradient':
          'linear-gradient(to right, #fb7185, #f43f5e, #e11d48, #ef4444, #f97316)',
        'supersociety-gradient':
          'linear-gradient(to right, #a3e635, #84cc16, #65a30d, #22c55e, #10b981)',
        'supergenius-gradient':
          'linear-gradient(to right, #38bdf8, #0ea5e9, #0284c7, #3b82f6, #6366f1)',
        'lime-green-emerald': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'rose-red-orange': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'amber-yellow': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'red-green-blue': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'violet-purple-fuchsia': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'sky-blue-indigo': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'teal-cyan': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontSize: {
        'display-large': [
          '3.5rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        display: ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'title-large': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        title: ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
        subtitle: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
        'body-emphasis': [
          '1rem',
          { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '500' },
        ],
        'caption-large': [
          '0.875rem',
          { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' },
        ],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '400' }],
        micro: ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.03em', fontWeight: '400' }],
      },
      fontVariationSettings: {
        emphasis: '"wght" 600',
        relaxed: '"wght" 300',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
