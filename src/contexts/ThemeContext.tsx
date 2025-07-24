import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'ocean' | 'forest' | 'sunset' | 'galaxy' | 'rose' | 'dark' | 'cyberpunk' | 'cyberpunk2';
export type FontFamily = 'default' | 'serif' | 'mono' | 'rounded';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  setCustomColors: (colors: { primary: string; secondary: string; accent: string }) => void;
  themes: Record<Theme, {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    fontFamily: string;
  }>;
}

const themes = {
  ocean: {
    name: 'Ocean Blue',
    primary: 'bg-blue-600',
    secondary: 'bg-blue-100',
    accent: 'bg-cyan-500',
    background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    surface: 'bg-white/80 backdrop-blur-sm',
    text: 'text-gray-800',
    fontFamily: 'font-sans'
  },
  forest: {
    name: 'Forest Green',
    primary: 'bg-green-600',
    secondary: 'bg-green-100',
    accent: 'bg-emerald-500',
    background: 'bg-gradient-to-br from-green-50 to-emerald-100',
    surface: 'bg-white/80 backdrop-blur-sm',
    text: 'text-gray-800',
    fontFamily: 'font-sans'
  },
  sunset: {
    name: 'Sunset Orange',
    primary: 'bg-orange-600',
    secondary: 'bg-orange-100',
    accent: 'bg-amber-500',
    background: 'bg-gradient-to-br from-orange-50 to-red-100',
    surface: 'bg-white/80 backdrop-blur-sm',
    text: 'text-gray-800',
    fontFamily: 'font-sans'
  },
  galaxy: {
    name: 'Purple Galaxy',
    primary: 'bg-purple-600',
    secondary: 'bg-purple-100',
    accent: 'bg-pink-500',
    background: 'bg-gradient-to-br from-purple-50 to-pink-100',
    surface: 'bg-white/80 backdrop-blur-sm',
    text: 'text-gray-800',
    fontFamily: 'font-sans'
  },
  rose: {
    name: 'Rose Gold',
    primary: 'bg-pink-600',
    secondary: 'bg-pink-100',
    accent: 'bg-rose-500',
    background: 'bg-gradient-to-br from-pink-50 to-rose-100',
    surface: 'bg-white/80 backdrop-blur-sm',
    text: 'text-gray-800',
    fontFamily: 'font-sans'
  },
  dark: {
    name: 'Dark Mode',
    primary: 'bg-indigo-600',
    secondary: 'bg-gray-700',
    accent: 'bg-blue-500',
    background: 'bg-gradient-to-br from-gray-900 to-gray-800',
    surface: 'bg-gray-800/80 backdrop-blur-sm',
    text: 'text-gray-100',
    fontFamily: 'font-sans'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    primary: 'bg-cyan-500',
    secondary: 'bg-gray-800',
    accent: 'bg-pink-500',
    background: 'bg-gradient-to-br from-gray-900 via-purple-900 to-black',
    surface: 'bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30',
    text: 'text-cyan-100',
    fontFamily: 'font-mono'
  },
  cyberpunk2: {
    name: 'Cyberpunk Matrix',
    primary: 'bg-green-500',
    secondary: 'bg-gray-900',
    accent: 'bg-green-400',
    background: 'bg-black',
    surface: 'bg-black border border-green-500/30',
    text: 'text-green-400',
    fontFamily: 'font-mono'
  }
};

const fontFamilies = {
  default: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  rounded: 'font-sans'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('ocean');
  const [fontFamily, setFontFamily] = useState<FontFamily>('default');
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    secondary: '#e5e7eb',
    accent: '#06b6d4'
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('productivity-theme') as Theme;
    const savedFont = localStorage.getItem('productivity-font') as FontFamily;
    const savedColors = localStorage.getItem('productivity-colors');
    
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
    if (savedFont && fontFamilies[savedFont]) {
      setFontFamily(savedFont);
    }
    if (savedColors) {
      try {
        setCustomColors(JSON.parse(savedColors));
      } catch (error) {
        console.error('Error loading custom colors:', error);
      }
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('productivity-theme', newTheme);
  };

  const handleSetFontFamily = (newFont: FontFamily) => {
    setFontFamily(newFont);
    localStorage.setItem('productivity-font', newFont);
  };

  const handleSetCustomColors = (colors: { primary: string; secondary: string; accent: string }) => {
    setCustomColors(colors);
    localStorage.setItem('productivity-colors', JSON.stringify(colors));
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: handleSetTheme, 
      fontFamily,
      setFontFamily: handleSetFontFamily,
      customColors,
      setCustomColors: handleSetCustomColors,
      themes 
    }}>
      <div className={`${theme === 'dark' || theme === 'cyberpunk2' ? 'dark' : ''} ${fontFamilies[fontFamily]}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};