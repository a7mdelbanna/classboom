import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { THEME_PALETTES } from '../../../data/themePalettes';
import { useAuth } from '../../auth/context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { supabase } from '../../../lib/supabase';
import { 
  HiOutlineMoon, 
  HiOutlineSun,
  HiCheck 
} from 'react-icons/hi';

export function ThemeSettings() {
  const { isDarkMode, toggleDarkMode, currentTheme, setTheme, setCustomColors } = useTheme();
  const { schoolInfo } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [customPrimary, setCustomPrimary] = useState(currentTheme.primary);
  const [customSecondary, setCustomSecondary] = useState(currentTheme.secondary);

  const handleThemeChange = async (themeName: string) => {
    setTheme(themeName);
    await saveThemePreference(themeName);
  };

  const handleCustomTheme = async () => {
    setCustomColors({ primary: customPrimary, secondary: customSecondary });
    await saveThemePreference('custom', { primary: customPrimary, secondary: customSecondary });
  };

  const saveThemePreference = async (themeName: string, customColors?: { primary: string; secondary: string }) => {
    if (!schoolInfo?.id) return;

    setSaving(true);
    try {
      const selectedTheme = THEME_PALETTES.find(p => p.id === themeName);
      const { error } = await supabase
        .from('schools')
        .update({
          settings: {
            ...schoolInfo.settings,
            theme: customColors || (selectedTheme ? {
              primary: selectedTheme.primary,
              secondary: selectedTheme.secondary,
              accent: selectedTheme.accent
            } : undefined),
            themeName: themeName
          }
        })
        .eq('id', schoolInfo.id);

      if (error) throw error;
      
      showToast('Theme preferences saved!', 'success');
    } catch (error) {
      console.error('Error saving theme:', error);
      showToast('Failed to save theme preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Theme Settings</h2>

        {/* Dark Mode Toggle */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <HiOutlineMoon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <HiOutlineSun className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDarkMode ? 'Easier on the eyes in low light' : 'Better visibility in bright light'}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                await toggleDarkMode();
                // Also save to database
                if (schoolInfo?.id) {
                  try {
                    const { error } = await supabase
                      .from('schools')
                      .update({
                        settings: {
                          ...schoolInfo.settings,
                          darkMode: !isDarkMode
                        }
                      })
                      .eq('id', schoolInfo.id);
                    
                    if (!error) {
                      showToast('Dark mode preference saved!', 'success');
                    }
                  } catch (err) {
                    console.error('Failed to save dark mode preference:', err);
                  }
                }
              }}
              className={`
                relative w-14 h-7 rounded-full transition-colors duration-200
                ${isDarkMode ? 'bg-classboom-primary' : 'bg-gray-300'}
              `}
            >
              <motion.div
                initial={false}
                animate={{ x: isDarkMode ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </div>

        {/* Predefined Themes */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Color Themes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Choose a color theme that matches your institution's personality and brand.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {THEME_PALETTES.map((palette) => (
              <motion.button
                key={palette.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleThemeChange(palette.id)}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200 text-left
                  ${currentTheme.name === palette.name 
                    ? 'border-classboom-primary shadow-lg bg-classboom-primary/5' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${palette.preview.gradient} 
                    flex items-center justify-center text-2xl shadow-lg`}>
                    {palette.preview.icon}
                  </div>
                  {currentTheme.name === palette.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-classboom-primary rounded-full
                        flex items-center justify-center"
                    >
                      <HiCheck className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
                
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {palette.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {palette.description}
                </p>
                
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div 
                    className="w-8 h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: palette.secondary }}
                  />
                  {palette.accent && (
                    <div 
                      className="w-8 h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: palette.accent }}
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Theme */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Theme</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="h-10 w-20 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                      rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-classboom-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="h-10 w-20 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                      rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-classboom-secondary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleCustomTheme}
                disabled={saving}
                className="px-6 py-2 bg-classboom-primary text-white rounded-lg
                  hover:bg-classboom-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Apply Custom Theme'}
              </button>
              
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-lg shadow-sm"
                  style={{ backgroundColor: customPrimary }}
                />
                <div 
                  className="w-8 h-8 rounded-lg shadow-sm"
                  style={{ backgroundColor: customSecondary }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-classboom-primary text-white rounded-lg">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-classboom-secondary text-white rounded-lg">
                Secondary Button
              </button>
              <div className="px-4 py-2 border-2 border-classboom-primary text-classboom-primary rounded-lg">
                Outlined Button
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-classboom-primary to-classboom-secondary" />
              <div className="flex-1 h-2 bg-gradient-to-r from-classboom-primary to-classboom-secondary rounded-full" />
            </div>
            
            <p className="text-classboom-primary font-medium">Primary Text Color</p>
            <p className="text-classboom-secondary font-medium">Secondary Text Color</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}