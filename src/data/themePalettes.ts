export interface ThemePalette {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent?: string;
  preview: {
    gradient: string;
    icon: string;
  };
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'modern-minimal',
    name: 'Modern & Minimal',
    description: 'Clean, contemporary design with subtle accents',
    primary: '#1a1a1a',
    secondary: '#666666',
    accent: '#0066cc',
    preview: {
      gradient: 'from-gray-900 to-gray-700',
      icon: '🎯'
    }
  },
  {
    id: 'warm-inviting',
    name: 'Warm & Inviting',
    description: 'Comfortable and friendly atmosphere',
    primary: '#ff6b35',
    secondary: '#f7931e',
    accent: '#fcb045',
    preview: {
      gradient: 'from-orange-500 to-amber-500',
      icon: '🌟'
    }
  },
  {
    id: 'cool-professional',
    name: 'Cool & Professional',
    description: 'Business-focused with a modern edge',
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    preview: {
      gradient: 'from-blue-600 to-blue-400',
      icon: '💼'
    }
  },
  {
    id: 'bold-energetic',
    name: 'Bold & Energetic',
    description: 'Dynamic and attention-grabbing',
    primary: '#dc2626',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    preview: {
      gradient: 'from-red-600 to-amber-500',
      icon: '⚡'
    }
  },
  {
    id: 'soft-calming',
    name: 'Soft & Calming',
    description: 'Peaceful and stress-free environment',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#c4b5fd',
    preview: {
      gradient: 'from-purple-600 to-purple-400',
      icon: '🌸'
    }
  },
  {
    id: 'dark-sophisticated',
    name: 'Dark & Sophisticated',
    description: 'Elegant and premium feel',
    primary: '#18181b',
    secondary: '#27272a',
    accent: '#a855f7',
    preview: {
      gradient: 'from-gray-900 to-purple-900',
      icon: '🌙'
    }
  },
  {
    id: 'earthy-natural',
    name: 'Earthy & Natural',
    description: 'Organic and environmentally conscious',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    preview: {
      gradient: 'from-emerald-600 to-green-500',
      icon: '🌿'
    }
  },
  {
    id: 'vibrant-playful',
    name: 'Vibrant & Playful',
    description: 'Fun and creative atmosphere',
    primary: '#ec4899',
    secondary: '#f472b6',
    accent: '#f9a8d4',
    preview: {
      gradient: 'from-pink-500 to-purple-500',
      icon: '🎨'
    }
  },
  {
    id: 'classic-timeless',
    name: 'Classic & Timeless',
    description: 'Traditional and trustworthy',
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#3b82f6',
    preview: {
      gradient: 'from-slate-900 to-slate-700',
      icon: '📚'
    }
  },
  {
    id: 'tech-futuristic',
    name: 'Tech & Futuristic',
    description: 'Innovative and forward-thinking',
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#a5b4fc',
    preview: {
      gradient: 'from-indigo-600 to-cyan-500',
      icon: '🚀'
    }
  }
];

// Helper function to get RGB values from hex
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r} ${g} ${b}`;
  }
  return '0 0 0';
}