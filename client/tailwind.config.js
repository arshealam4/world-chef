export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { fredoka: ['Fredoka', 'sans-serif'] },
      colors: {
        primary:   { DEFAULT: '#FF6B35', light: '#FF8C42', dark: '#E55A2B' },
        secondary: { DEFAULT: '#FFB347', light: '#FFC66D', dark: '#E09A30' },
        coins:     { DEFAULT: '#F39C12', light: '#F7B731', dark: '#D4860A' },
        gems:      { DEFAULT: '#9B59B6', light: '#B07CC6', dark: '#7D3C98' },
        success:   { DEFAULT: '#4CAF50', light: '#66BB6A', dark: '#388E3C' },
        cream:     { DEFAULT: '#FFF8F0', dark: '#FFF0E0' },
        wood:      { DEFAULT: '#3D2B1F', light: '#5D4037', muted: '#9E8070' },
        border:    { DEFAULT: '#F0D9C8', dark: '#E0C4A8' },
      },
      boxShadow: {
        'btn':       '0 4px 0 0 #C2410C',
        'btn-press': '0 2px 0 0 #C2410C',
        'btn-green':  '0 4px 0 0 #2E7D32',
        'btn-green-press': '0 2px 0 0 #2E7D32',
        'btn-purple': '0 4px 0 0 #6A1B9A',
        'btn-purple-press': '0 2px 0 0 #6A1B9A',
        'btn-gold':   '0 4px 0 0 #B8860B',
        'btn-gold-press': '0 2px 0 0 #B8860B',
        'card':      '0 2px 8px rgba(61,43,31,0.08)',
        'card-lg':   '0 4px 16px rgba(61,43,31,0.12)',
        'glow-orange': '0 0 12px rgba(255,107,53,0.3)',
        'inner-light': 'inset 0 1px 2px rgba(255,255,255,0.25)',
      },
      keyframes: {
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.75' },
        },
        'bounce-in': {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'shimmer':    'shimmer 2s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bounce-in':  'bounce-in 0.4s ease-out',
      },
    }
  },
  plugins: []
}
