/**
 * Design System Tokens
 * Centralized design values for consistent theming across the application
 */

export const colors = {
  background: {
    primary: '#000000',       // Pure black
    secondary: '#1F2937',     // Gray-800
    card: '#111827',          // Gray-900
    elevated: '#1F2937',      // Gray-800 for hover/elevated states
  },
  accent: {
    primary: '#FBBF24',       // Yellow-400
    secondary: '#F59E0B',     // Yellow-500
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    gradientHover: 'linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)',
  },
  text: {
    primary: '#FFFFFF',       // White
    secondary: '#9CA3AF',     // Gray-400
    tertiary: '#6B7280',      // Gray-500
    accent: '#FCD34D',        // Yellow-300
    muted: '#4B5563',         // Gray-600
  },
  border: {
    default: '#374151',       // Gray-700
    accent: '#FBBF24',        // Yellow-400
    accentDim: 'rgba(251, 191, 36, 0.3)', // Yellow-400 with 30% opacity
  },
  status: {
    success: '#10B981',       // Green-500
    warning: '#F59E0B',       // Yellow-500
    error: '#EF4444',         // Red-500
    info: '#3B82F6',          // Blue-500
    live: '#EF4444',          // Red-500 (for live indicators)
  },
};

export const spacing = {
  // Padding
  card: 'p-6',
  cardSm: 'p-4',
  cardLg: 'p-8',
  section: 'py-8',
  
  // Gaps
  gap: 'gap-6',
  gapSm: 'gap-4',
  gapLg: 'gap-8',
  
  // Margins
  mb: 'mb-8',
  mbSm: 'mb-4',
  mbLg: 'mb-12',
};

export const typography = {
  // Headers
  h1: 'text-3xl font-black text-yellow-400',
  h2: 'text-2xl font-black text-yellow-400',
  h3: 'text-xl font-black text-yellow-400',
  h4: 'text-lg font-bold text-yellow-400',
  
  // Body
  body: 'text-white',
  bodySecondary: 'text-gray-400',
  bodySmall: 'text-sm text-gray-400',
  
  // Special
  label: 'text-sm font-bold text-yellow-400',
  stat: 'text-2xl font-black text-yellow-400',
  statLarge: 'text-4xl font-black text-yellow-400',
};

export const components = {
  // Cards
  card: {
    base: 'bg-gray-900 rounded-2xl p-6 border-2 border-yellow-400 border-opacity-30',
    simple: 'bg-gray-900 rounded-xl p-4 border border-gray-700',
    elevated: 'bg-gray-900 rounded-2xl p-6 border-2 border-yellow-400 border-opacity-30 hover:border-opacity-50 transition-all',
  },
  
  // Buttons
  button: {
    primary: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all',
    secondary: 'bg-gray-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-700 transition-all',
    ghost: 'text-yellow-400 hover:bg-gray-800 px-4 py-2 rounded-lg transition-all',
  },
  
  // Badges
  badge: {
    success: 'bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold',
    warning: 'bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold',
    error: 'bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold',
    info: 'bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold',
    live: 'bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse',
  },
  
  // Icons
  icon: {
    container: 'w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center',
    large: 'w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center',
    small: 'w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center',
  },
  
  // Tabs
  tab: {
    list: 'bg-gray-900 border-2 border-gray-800',
    trigger: 'data-[state=active]:bg-yellow-400 data-[state=active]:text-black',
  },
  
  // Progress bars
  progress: {
    container: 'w-full bg-gray-800 rounded-full h-3',
    barYellow: 'bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all',
    barBlue: 'bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all',
  },
};

export const animations = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  fadeIn: 'animate-fade-in',
};

export const layout = {
  container: {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    full: 'w-full',
  },
  grid: {
    cols2: 'grid md:grid-cols-2 gap-6',
    cols3: 'grid md:grid-cols-3 gap-6',
    cols4: 'grid lg:grid-cols-4 gap-4',
  },
  page: 'min-h-screen bg-gray-950 p-4 lg:p-8',
};

// Utility function to combine class names
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Export commonly used combinations
export const cardClasses = components.card.base;
export const headerClasses = typography.h3;
export const ctaClasses = components.button.primary;
export const pageClasses = layout.page;
