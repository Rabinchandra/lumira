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
  Luhongba: {
    label: 'Luhongba',
    color: '#E04040',
    soft: '#FDEAEA',
    grad: ['#F06060', '#C82020'],
  },
  Heijingpot: {
    label: 'Heijingpot',
    color: '#D97706',
    soft: '#FEF3E2',
    grad: ['#F59E0B', '#B45309'],
  },
  Chakouba: {
    label: 'Chakouba',
    color: '#7C3AED',
    soft: '#EDE9FE',
    grad: ['#A78BFA', '#6D28D9'],
  },
  PostWedding: {
    label: 'Post Wedding',
    color: '#DB2777',
    soft: '#FCE7F3',
    grad: ['#F472B6', '#BE185D'],
  },
  PreWedding: {
    label: 'Pre Wedding',
    color: '#7C5CFC',
    soft: '#EFEBFF',
    grad: ['#9B7CFF', '#6A3DF5'],
  },
  Wedding: {
    label: 'Wedding',
    color: '#FF4D8D',
    soft: '#FFEAF1',
    grad: ['#FF6FA3', '#FF2D7E'],
  },
  Paternity: {
    label: 'Paternity',
    color: '#0891B2',
    soft: '#E0F7FA',
    grad: ['#22D3EE', '#0E7490'],
  },
  Chagumba: {
    label: 'Chagumba',
    color: '#059669',
    soft: '#D1FAE5',
    grad: ['#34D399', '#047857'],
  },
  Portrait: {
    label: 'Portrait',
    color: '#F59E0B',
    soft: '#FFF3DE',
    grad: ['#FFC44D', '#F38B00'],
  },
  Family: {
    label: 'Family',
    color: '#2563EB',
    soft: '#DBEAFE',
    grad: ['#60A5FA', '#1D4ED8'],
  },
  Event: {
    label: 'Event',
    color: '#12C9A6',
    soft: '#E2FAF3',
    grad: ['#3DDCBC', '#06B894'],
  },
};
