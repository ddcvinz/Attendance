export type ThemeId = 'red_yellow' | 'scarlet_gold' | 'academic_blue' | 'chalkboard' | 'emerald_school' | 'campus_purple' | 'slate_dark';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  dotColor: string;
  accentDot: string;
  // Classes
  appBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headerBg: string;
  headerBorder: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  primaryBtn: string;
  primaryBtnHover: string;
  primaryText: string;
  primaryLightBg: string;
  primaryLightBorder: string;
  accentBadgeBg: string;
  accentBadgeText: string;
  accentBadgeBorder: string;
  navActiveBg: string;
  navActiveText: string;
  navInactiveText: string;
  statsCardBg: string;
  brandIconBg: string;
  brandIconText: string;
  presidentBadgeBg: string;
  presidentBadgeText: string;
  presidentBadgeBorder: string;
  ringColor: string;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  red_yellow: {
    id: 'red_yellow',
    name: 'Red & Yellowish',
    tagline: 'Collegiate Crimson Red with Warm Yellowish Gold',
    dotColor: '#b91c1c', // Crimson Red 700
    accentDot: '#f59e0b', // Warm Golden Yellow
    appBg: 'bg-[#fffdf8]',
    textPrimary: 'text-stone-900',
    textSecondary: 'text-stone-700',
    textMuted: 'text-stone-500',
    headerBg: 'bg-[#991b1b] text-white', // Rich Crimson Red 800
    headerBorder: 'border-[#7f1d1d]',
    cardBg: 'bg-white',
    cardBorder: 'border-amber-200/80',
    cardShadow: 'shadow-xs',
    primaryBtn: 'bg-red-700 hover:bg-red-800 text-amber-200 font-bold shadow-xs',
    primaryBtnHover: 'hover:bg-red-800',
    primaryText: 'text-red-700',
    primaryLightBg: 'bg-red-50',
    primaryLightBorder: 'border-red-200',
    accentBadgeBg: 'bg-yellow-100',
    accentBadgeText: 'text-yellow-900',
    accentBadgeBorder: 'border-yellow-300',
    navActiveBg: 'bg-red-950 text-yellow-300 shadow-xs ring-1 ring-yellow-400/50',
    navActiveText: 'text-yellow-300',
    navInactiveText: 'text-red-100/90 hover:text-white hover:bg-red-900/60',
    statsCardBg: 'bg-white',
    brandIconBg: 'bg-yellow-400',
    brandIconText: 'text-red-950',
    presidentBadgeBg: 'bg-yellow-400/20',
    presidentBadgeText: 'text-yellow-300',
    presidentBadgeBorder: 'border-yellow-400/50',
    ringColor: 'focus:ring-red-600',
  },
  scarlet_gold: {
    id: 'scarlet_gold',
    name: 'Scarlet & Warm Sun',
    tagline: 'Vibrant Scarlet Red with Bright Yellowish Accents',
    dotColor: '#dc2626', // Red 600
    accentDot: '#facc15', // Yellow 400
    appBg: 'bg-[#fefcf6]',
    textPrimary: 'text-zinc-900',
    textSecondary: 'text-zinc-700',
    textMuted: 'text-zinc-500',
    headerBg: 'bg-[#b91c1c] text-white',
    headerBorder: 'border-[#991b1b]',
    cardBg: 'bg-white',
    cardBorder: 'border-yellow-200/90',
    cardShadow: 'shadow-xs',
    primaryBtn: 'bg-red-600 hover:bg-red-700 text-yellow-100 font-bold shadow-xs',
    primaryBtnHover: 'hover:bg-red-700',
    primaryText: 'text-red-600',
    primaryLightBg: 'bg-amber-50',
    primaryLightBorder: 'border-amber-200',
    accentBadgeBg: 'bg-amber-100',
    accentBadgeText: 'text-amber-900',
    accentBadgeBorder: 'border-amber-300',
    navActiveBg: 'bg-[#7f1d1d] text-yellow-300 shadow-xs ring-1 ring-yellow-400/50',
    navActiveText: 'text-yellow-300',
    navInactiveText: 'text-red-100/90 hover:text-white hover:bg-red-900/50',
    statsCardBg: 'bg-white',
    brandIconBg: 'bg-yellow-400',
    brandIconText: 'text-red-950',
    presidentBadgeBg: 'bg-yellow-400/25',
    presidentBadgeText: 'text-yellow-300',
    presidentBadgeBorder: 'border-yellow-400/50',
    ringColor: 'focus:ring-red-500',
  },
  academic_blue: {
    id: 'academic_blue',
    name: 'Academic Navy & Gold',
    tagline: 'Official DepEd & University Portal Style',
    dotColor: '#1e3a8a', // Blue 900
    accentDot: '#f59e0b', // Amber 500
    appBg: 'bg-slate-100/80',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    headerBg: 'bg-blue-950 text-white',
    headerBorder: 'border-blue-900',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200/90',
    cardShadow: 'shadow-xs',
    primaryBtn: 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs',
    primaryBtnHover: 'hover:bg-blue-800',
    primaryText: 'text-blue-700',
    primaryLightBg: 'bg-blue-50',
    primaryLightBorder: 'border-blue-200',
    accentBadgeBg: 'bg-amber-100',
    accentBadgeText: 'text-amber-900',
    accentBadgeBorder: 'border-amber-300',
    navActiveBg: 'bg-blue-800 text-amber-300 shadow-xs ring-1 ring-amber-400/40',
    navActiveText: 'text-amber-300',
    navInactiveText: 'text-blue-200 hover:text-white hover:bg-blue-900/60',
    statsCardBg: 'bg-white',
    brandIconBg: 'bg-amber-500',
    brandIconText: 'text-blue-950',
    presidentBadgeBg: 'bg-amber-400/20',
    presidentBadgeText: 'text-amber-300',
    presidentBadgeBorder: 'border-amber-400/40',
    ringColor: 'focus:ring-blue-500',
  },
  chalkboard: {
    id: 'chalkboard',
    name: 'Classroom Chalkboard',
    tagline: 'Classic School Blackboard & Yellow Chalk',
    dotColor: '#14382c', // Deep forest chalkboard green
    accentDot: '#eab308', // Chalk yellow
    appBg: 'bg-[#f4f7f4]',
    textPrimary: 'text-zinc-900',
    textSecondary: 'text-zinc-700',
    textMuted: 'text-zinc-500',
    headerBg: 'bg-[#153427] text-white',
    headerBorder: 'border-[#0f271d]',
    cardBg: 'bg-white',
    cardBorder: 'border-emerald-950/10',
    cardShadow: 'shadow-xs',
    primaryBtn: 'bg-[#1b4332] hover:bg-[#153427] text-amber-300 shadow-xs',
    primaryBtnHover: 'hover:bg-[#153427]',
    primaryText: 'text-[#1b4332]',
    primaryLightBg: 'bg-emerald-50',
    primaryLightBorder: 'border-emerald-200',
    accentBadgeBg: 'bg-amber-100',
    accentBadgeText: 'text-amber-900',
    accentBadgeBorder: 'border-amber-300',
    navActiveBg: 'bg-[#0f271d] text-amber-300 shadow-xs ring-1 ring-amber-400/30',
    navActiveText: 'text-amber-300',
    navInactiveText: 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/40',
    statsCardBg: 'bg-white',
    brandIconBg: 'bg-amber-400',
    brandIconText: 'text-[#153427]',
    presidentBadgeBg: 'bg-amber-400/20',
    presidentBadgeText: 'text-amber-300',
    presidentBadgeBorder: 'border-amber-400/40',
    ringColor: 'focus:ring-emerald-600',
  },
  emerald_school: {
    id: 'emerald_school',
    name: 'Emerald School',
    tagline: 'Vibrant Mint & Fresh Green Classroom',
    dotColor: '#059669', // Emerald 600
    accentDot: '#10b981', // Emerald 500
    appBg: 'bg-slate-50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    headerBg: 'bg-white text-slate-900',
    headerBorder: 'border-slate-200',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
    cardShadow: 'shadow-xs',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
    primaryBtnHover: 'hover:bg-emerald-700',
    primaryText: 'text-emerald-700',
    primaryLightBg: 'bg-emerald-50',
    primaryLightBorder: 'border-emerald-200',
    accentBadgeBg: 'bg-emerald-100',
    accentBadgeText: 'text-emerald-900',
    accentBadgeBorder: 'border-emerald-300',
    navActiveBg: 'bg-white text-emerald-700 shadow-xs border border-slate-200',
    navActiveText: 'text-emerald-700',
    navInactiveText: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    statsCardBg: 'bg-white',
    brandIconBg: 'bg-emerald-600',
    brandIconText: 'text-white',
    presidentBadgeBg: 'bg-emerald-50',
    presidentBadgeText: 'text-emerald-800',
    presidentBadgeBorder: 'border-emerald-200',
    ringColor: 'focus:ring-emerald-500',
  },
  campus_purple: {
    id: 'campus_purple',
    name: 'Campus Indigo',
    tagline: 'Modern Tech University & High School',
    dotColor: '#4338ca', // Indigo 700
    accentDot: '#06b6d4', // Cyan 500
    appBg: 'bg-slate-100/70',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    headerBg: 'bg-indigo-950 text-white',
    headerBorder: 'border-indigo-900',
    cardBg: 'bg-white',
    cardBorder: 'border-indigo-100',
    cardShadow: 'shadow-xs',
    primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
    primaryBtnHover: 'hover:bg-indigo-700',
    primaryText: 'text-indigo-700',
    primaryLightBg: 'bg-indigo-50',
    primaryLightBorder: 'border-indigo-200',
    accentBadgeBg: 'bg-cyan-100',
    accentBadgeText: 'text-cyan-900',
    accentBadgeBorder: 'border-cyan-300',
    navActiveBg: 'bg-indigo-800 text-cyan-300 shadow-xs ring-1 ring-cyan-400/40',
    navActiveText: 'text-cyan-300',
    navInactiveText: 'text-indigo-200 hover:text-white hover:bg-indigo-900/60',
    statsCardBg: 'bg-white',
    brandIconBg: 'bg-cyan-400',
    brandIconText: 'text-indigo-950',
    presidentBadgeBg: 'bg-indigo-800/80',
    presidentBadgeText: 'text-cyan-200',
    presidentBadgeBorder: 'border-indigo-700',
    ringColor: 'focus:ring-indigo-500',
  },
  slate_dark: {
    id: 'slate_dark',
    name: 'Midnight Academic',
    tagline: 'High-Contrast Dark Mode for Evening Sessions',
    dotColor: '#0f172a', // Slate 900
    accentDot: '#38bdf8', // Sky 400
    appBg: 'bg-slate-950',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    headerBg: 'bg-slate-900 text-white',
    headerBorder: 'border-slate-800',
    cardBg: 'bg-slate-900',
    cardBorder: 'border-slate-800',
    cardShadow: 'shadow-md',
    primaryBtn: 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs',
    primaryBtnHover: 'hover:bg-sky-500',
    primaryText: 'text-sky-400',
    primaryLightBg: 'bg-slate-800',
    primaryLightBorder: 'border-slate-700',
    accentBadgeBg: 'bg-sky-950',
    accentBadgeText: 'text-sky-300',
    accentBadgeBorder: 'border-sky-800',
    navActiveBg: 'bg-slate-800 text-sky-400 shadow-xs ring-1 ring-sky-500/50',
    navActiveText: 'text-sky-400',
    navInactiveText: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
    statsCardBg: 'bg-slate-900',
    brandIconBg: 'bg-sky-500',
    brandIconText: 'text-slate-950',
    presidentBadgeBg: 'bg-slate-800',
    presidentBadgeText: 'text-sky-300',
    presidentBadgeBorder: 'border-slate-700',
    ringColor: 'focus:ring-sky-500',
  },
};

const THEME_STORAGE_KEY = 'class_attendance_selected_theme_v3';

export function getSavedTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && saved in THEMES) {
      return saved as ThemeId;
    }
  } catch {
    // fallback
  }
  return 'red_yellow'; // Default to Red & Yellowish theme
}

export function saveSelectedTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // ignore
  }
}
