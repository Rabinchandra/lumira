export const ACCENT = {
  solid: '#6C4CF1',
  grad: ['#7C5CFC', '#C13FE8'] as [string, string],
  soft: '#EFEBFF',
  ink: '#5B3DE0',
};

export const COLORS = {
  bg: '#F6F5FB',
  surface: '#FFFFFF',
  border: '#F0EEF7',
  borderStrong: '#E6E3F0',
  textPrimary: '#1A1430',
  textSecondary: '#6B6486',
  textMuted: '#9C95B4',
  textLight: '#B3ABC8',
  darkBg: '#16103A',
  darkBg2: '#1B0F3B',
  red: '#FF6B5E',
  green: '#12C9A6',
  amber: '#F59E0B',
  blue: '#2E8BFF',
};

export const EVENT_TYPES: Record<string, { label: string; color: string; soft: string; grad: [string, string] }> = {
  Wedding: {
    label: 'Wedding',
    color: '#FF4D8D',
    soft: '#FFEAF1',
    grad: ['#FF6FA3', '#FF2D7E'],
  },
  PreWedding: {
    label: 'Pre-Wedding',
    color: '#7C5CFC',
    soft: '#EFEBFF',
    grad: ['#9B7CFF', '#6A3DF5'],
  },
  Corporate: {
    label: 'Corporate',
    color: '#2E8BFF',
    soft: '#E6F1FF',
    grad: ['#5BA8FF', '#1E6FE0'],
  },
  Portrait: {
    label: 'Portrait',
    color: '#F59E0B',
    soft: '#FFF3DE',
    grad: ['#FFC44D', '#F38B00'],
  },
  Event: {
    label: 'Event',
    color: '#12C9A6',
    soft: '#E2FAF3',
    grad: ['#3DDCBC', '#06B894'],
  },
};
