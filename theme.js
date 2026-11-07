import { useColorScheme } from 'react-native';

export const LIGHT_COLORS = {
  // MAIN BACKGROUNDS
  background: '#F4F7FC',

  // card / surface color (kept name "white" for compatibility)
  white: '#FFFFFF',

  inputBg: '#F8FAFC',

  border: '#E2E8F0',

  // PRIMARY BLUE
  primary: '#6ea8ff',

  primaryDark: '#5a95ee',

  primaryLight: '#EAF1FF',

  // TEXT
  text: '#1E293B',

  subText: '#64748B',

  // STATUS
  success: '#22C55E',

  danger: '#ff6b6b',

  // EXTRA
  cardDark: '#FFFFFF',

  icon: '#64748B',

  // TEXT / ICONS ON COLORED BUTTONS
  onPrimary: '#FFFFFF',

  onPrimarySoft: '#eef7ff',

  // ACCENTS
  info: '#2d8cff',

  accent: '#5B8DEF',

  dangerStrong: '#ff3b3b',

  successSoft: '#cbf5dd',
};

export const DARK_COLORS = {
  background: '#0F172A',

  white: '#1E293B',

  inputBg: '#172033',

  border: '#334155',

  primary: '#6ea8ff',

  primaryDark: '#8fbaff',

  primaryLight: '#1E3A5F',

  text: '#F1F5F9',

  subText: '#A3B1C6',

  success: '#4ADE80',

  danger: '#ff8a8a',

  cardDark: '#1E293B',

  icon: '#A3B1C6',

  // dark text on the light blue buttons keeps contrast above 4.5:1
  onPrimary: '#0B1220',

  onPrimarySoft: '#0B1220',

  info: '#6db3ff',

  accent: '#8fb0ff',

  dangerStrong: '#ff8a8a',

  successSoft: '#17402E',
};

// Default (light) palette, kept for non-component code.
export const COLORS = LIGHT_COLORS;

// Returns the palette for the system color scheme.
export function useTheme() {
  return useColorScheme() === 'dark'
    ? DARK_COLORS
    : LIGHT_COLORS;
}

export const SPACING = {
  xs: 6,

  sm: 10,

  md: 16,

  lg: 24,

  xl: 32,
};

export const RADIUS = {
  sm: 12,

  md: 18,

  lg: 26,
};

export const SHADOW = {
  shadowColor: '#000',

  shadowOffset: {
    width: 0,
    height: 4,
  },

  shadowOpacity: 0.08,

  shadowRadius: 12,

  elevation: 5,
};