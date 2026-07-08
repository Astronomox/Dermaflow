import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        body: ['Montserrat', 'sans-serif'],
        headline: ['Montserrat', 'sans-serif'],
        code: ['Montserrat', 'monospace'],
      },
      colors: {
        // ── monochrome remap: all named hues resolve to neutral grays ──
        red: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        orange: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        amber: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        yellow: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        lime: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        green: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        emerald: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        teal: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        cyan: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        sky: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        blue: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        indigo: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        violet: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        purple: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        fuchsia: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        pink: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        rose: {
          50:'#FAFAFA',100:'#F4F4F4',200:'#E4E4E4',300:'#D4D4D4',400:'#A3A3A3',
          500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0A0A0A',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
