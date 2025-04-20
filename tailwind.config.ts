import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          success: {
            DEFAULT: "hsl(142, 76%, 36%)", // Emerald green
            foreground: "hsl(0, 0%, 98%)",
            muted: "hsl(142, 76%, 95%)",
          },
          info: {
            DEFAULT: "hsl(217, 91%, 60%)", // Vibrant blue
            foreground: "hsl(0, 0%, 98%)",
            muted: "hsl(217, 91%, 95%)",
          },
          warning: {
            DEFAULT: "hsl(38, 92%, 50%)", // Amber
            foreground: "hsl(0, 0%, 10%)",
            muted: "hsl(38, 92%, 95%)",
          },
          energy: {
            DEFAULT: "hsl(326, 100%, 60%)", // Energetic pink
            foreground: "hsl(0, 0%, 98%)",
            muted: "hsl(326, 100%, 95%)",
          },
          calm: {
            DEFAULT: "hsl(199, 89%, 48%)", // Serene blue
            foreground: "hsl(0, 0%, 98%)",
            muted: "hsl(199, 89%, 95%)",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          background: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Avolve Conceptual Framework Colors
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        supercivilization: {
          // Zinc gradient
          DEFAULT: "#71717a", // zinc-500
          light: "#a1a1aa", // zinc-400
          dark: "#3f3f46", // zinc-700
          token: "#27272a", // GEN token color (zinc-800)
        },
        superachiever: {
          // Stone gradient
          DEFAULT: "#78716c", // stone-500
          light: "#a8a29e", // stone-400
          dark: "#57534e", // stone-600
          token: "#44403c", // SAP token color (stone-700)
        },
        personalSuccess: {
          // Amber-Yellow gradient
          DEFAULT: "#f59e0b", // amber-500
          light: "#fbbf24", // amber-400
          dark: "#d97706", // amber-600
          token: "#eab308", // PSP token color (yellow-500)
        },
        businessSuccess: {
          // Teal-Cyan gradient
          DEFAULT: "#14b8a6", // teal-500
          light: "#2dd4bf", // teal-400
          dark: "#0d9488", // teal-600
          token: "#06b6d4", // BSP token color (cyan-500)
        },
        supermind: {
          // Violet-Purple-Fuchsia-Pink gradient
          DEFAULT: "#8b5cf6", // violet-500
          light: "#a78bfa", // violet-400
          dark: "#7c3aed", // violet-600
          secondary: "#d946ef", // fuchsia-500
          accent: "#ec4899", // pink-500
          token: "#d946ef", // SMS token color (fuchsia-500)
        },
        superachievers: {
          // Slate gradient
          DEFAULT: "#64748b", // slate-500
          light: "#94a3b8", // slate-400
          dark: "#475569", // slate-600
          token: "#334155", // SCQ token color (slate-700)
        },
        superpuzzle: {
          // Red-Green-Blue gradient
          red: "#ef4444", // red-500
          green: "#22c55e", // green-500
          blue: "#3b82f6", // blue-500
          token: "#6366f1", // SPD token color (indigo-500)
        },
        superhuman: {
          // Rose-Red-Orange gradient
          DEFAULT: "#f43f5e", // rose-500
          light: "#fb7185", // rose-400
          dark: "#e11d48", // rose-600
          secondary: "#ef4444", // red-500
          accent: "#f97316", // orange-500
          token: "#f43f5e", // SHE token color (rose-500)
        },
        supersociety: {
          // Lime-Green-Emerald gradient
          DEFAULT: "#84cc16", // lime-500
          light: "#a3e635", // lime-400
          dark: "#65a30d", // lime-600
          secondary: "#22c55e", // green-500
          accent: "#10b981", // emerald-500
          token: "#22c55e", // SSA token color (green-500)
        },
        supergenius: {
          // Sky-Blue-Indigo gradient
          DEFAULT: "#0ea5e9", // sky-500
          light: "#38bdf8", // sky-400
          dark: "#0284c7", // sky-600
          secondary: "#3b82f6", // blue-500
          accent: "#6366f1", // indigo-500
          token: "#3b82f6", // SBG token color (blue-500)
        },
      },
      fontFamily: {
        // Use Inter as the only font for sans
        sans: ["Inter"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        // Avolve gradient backgrounds
        'supercivilization-gradient': 'linear-gradient(to right, #a1a1aa, #71717a, #3f3f46)', // Zinc gradient
        'superachiever-gradient': 'linear-gradient(to right, #a8a29e, #78716c, #57534e)', // Stone gradient
        'personal-success-gradient': 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)', // Amber-Yellow gradient
        'business-success-gradient': 'linear-gradient(to right, #2dd4bf, #14b8a6, #0d9488)', // Teal-Cyan gradient
        'supermind-gradient': 'linear-gradient(to right, #a78bfa, #8b5cf6, #7c3aed, #d946ef, #ec4899)', // Violet-Purple-Fuchsia-Pink gradient
        'superachievers-gradient': 'linear-gradient(to right, #94a3b8, #64748b, #475569)', // Slate gradient
        'superpuzzle-gradient': 'linear-gradient(to right, #ef4444, #22c55e, #3b82f6)', // Red-Green-Blue gradient
        'superhuman-gradient': 'linear-gradient(to right, #fb7185, #f43f5e, #e11d48, #ef4444, #f97316)', // Rose-Red-Orange gradient
        'supersociety-gradient': 'linear-gradient(to right, #a3e635, #84cc16, #65a30d, #22c55e, #10b981)', // Lime-Green-Emerald gradient
        'supergenius-gradient': 'linear-gradient(to right, #38bdf8, #0ea5e9, #0284c7, #3b82f6, #6366f1)', // Sky-Blue-Indigo gradient
        'lime-green-emerald': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'rose-red-orange': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'amber-yellow': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'red-green-blue': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'violet-purple-fuchsia': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'sky-blue-indigo': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'teal-cyan': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontSize: {
        "display-large": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        display: ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        "title-large": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        title: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "600" }],
        subtitle: ["1.25rem", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "500" }],
        "body-emphasis": ["1rem", { lineHeight: "1.5", letterSpacing: "0.01em", fontWeight: "500" }],
        "caption-large": ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "500" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "400" }],
        micro: ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.03em", fontWeight: "400" }],
      },
      fontVariationSettings: {
        emphasis: '"wght" 600',
        relaxed: '"wght" 300',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
