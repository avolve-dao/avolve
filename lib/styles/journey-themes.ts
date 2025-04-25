export type JourneyTheme =
  | 'superachiever'
  | 'superachievers'
  | 'supercivilization'
  | 'gen'
  | 'sap'
  | 'scq';

export interface JourneyThemeConfig {
  name: string;
  description: string;
  gradient: string;
  token: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    background: string;
  };
  darkMode: {
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    background: string;
  };
}

export const journeyThemes: Record<JourneyTheme, JourneyThemeConfig> = {
  superachiever: {
    name: 'Superachiever',
    description: 'Personal transformation journey',
    gradient: 'from-violet-500 to-purple-600',
    token: 'SAP',
    colors: {
      primary: 'rgb(139, 92, 246)',
      secondary: 'rgb(124, 58, 237)',
      accent: 'rgb(167, 139, 250)',
      muted: 'rgb(237, 233, 254)',
      background: 'rgb(245, 243, 255)',
    },
    darkMode: {
      primary: 'rgb(167, 139, 250)',
      secondary: 'rgb(139, 92, 246)',
      accent: 'rgb(124, 58, 237)',
      muted: 'rgb(91, 33, 182)',
      background: 'rgb(76, 29, 149)',
    },
  },
  superachievers: {
    name: 'Superachievers',
    description: 'Collective transformation journey',
    gradient: 'from-teal-400 to-emerald-500',
    token: 'SCQ',
    colors: {
      primary: 'rgb(45, 212, 191)',
      secondary: 'rgb(16, 185, 129)',
      accent: 'rgb(94, 234, 212)',
      muted: 'rgb(209, 250, 229)',
      background: 'rgb(236, 253, 245)',
    },
    darkMode: {
      primary: 'rgb(94, 234, 212)',
      secondary: 'rgb(45, 212, 191)',
      accent: 'rgb(20, 184, 166)',
      muted: 'rgb(17, 94, 89)',
      background: 'rgb(15, 118, 110)',
    },
  },
  supercivilization: {
    name: 'Supercivilization',
    description: 'Global transformation journey',
    gradient: 'from-blue-500 to-indigo-600',
    token: 'GEN',
    colors: {
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(79, 70, 229)',
      accent: 'rgb(147, 197, 253)',
      muted: 'rgb(219, 234, 254)',
      background: 'rgb(239, 246, 255)',
    },
    darkMode: {
      primary: 'rgb(147, 197, 253)',
      secondary: 'rgb(59, 130, 246)',
      accent: 'rgb(37, 99, 235)',
      muted: 'rgb(30, 58, 138)',
      background: 'rgb(29, 78, 216)',
    },
  },
  gen: {
    name: 'Genesis',
    description: 'Foundation token',
    gradient: 'from-amber-400 to-orange-500',
    token: 'GEN',
    colors: {
      primary: 'rgb(251, 191, 36)',
      secondary: 'rgb(249, 115, 22)',
      accent: 'rgb(253, 230, 138)',
      muted: 'rgb(254, 243, 199)',
      background: 'rgb(255, 251, 235)',
    },
    darkMode: {
      primary: 'rgb(253, 230, 138)',
      secondary: 'rgb(251, 191, 36)',
      accent: 'rgb(245, 158, 11)',
      muted: 'rgb(146, 64, 14)',
      background: 'rgb(180, 83, 9)',
    },
  },
  sap: {
    name: 'Superachiever Points',
    description: 'Personal achievement token',
    gradient: 'from-rose-400 to-pink-500',
    token: 'SAP',
    colors: {
      primary: 'rgb(251, 113, 133)',
      secondary: 'rgb(236, 72, 153)',
      accent: 'rgb(253, 164, 175)',
      muted: 'rgb(254, 226, 226)',
      background: 'rgb(255, 241, 242)',
    },
    darkMode: {
      primary: 'rgb(253, 164, 175)',
      secondary: 'rgb(251, 113, 133)',
      accent: 'rgb(244, 63, 94)',
      muted: 'rgb(159, 18, 57)',
      background: 'rgb(136, 19, 55)',
    },
  },
  scq: {
    name: 'Social Coordination Quotient',
    description: 'Community coordination token',
    gradient: 'from-cyan-400 to-sky-500',
    token: 'SCQ',
    colors: {
      primary: 'rgb(34, 211, 238)',
      secondary: 'rgb(14, 165, 233)',
      accent: 'rgb(125, 211, 252)',
      muted: 'rgb(224, 242, 254)',
      background: 'rgb(240, 249, 255)',
    },
    darkMode: {
      primary: 'rgb(125, 211, 252)',
      secondary: 'rgb(34, 211, 238)',
      accent: 'rgb(2, 132, 199)',
      muted: 'rgb(12, 74, 110)',
      background: 'rgb(3, 105, 161)',
    },
  },
};

export function getThemeGradient(theme: JourneyTheme, opacity?: number) {
  const base = journeyThemes[theme].gradient;
  return opacity ? base.replace(/\d{3}/g, opacity.toString()) : base;
}

export function getThemeAccent(theme: JourneyTheme) {
  return journeyThemes[theme].colors.accent;
}

export function getThemeToken(theme: JourneyTheme) {
  return journeyThemes[theme].token;
}

export function getThemeDescription(theme: JourneyTheme) {
  return journeyThemes[theme].description;
}
