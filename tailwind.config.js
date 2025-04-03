/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
}

