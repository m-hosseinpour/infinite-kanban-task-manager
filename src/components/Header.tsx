import React, { useState } from 'react';
import { Moon, Sun, Globe, HelpCircle, Download, Upload, LogOut, Save } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  isDark: boolean;
  isRTL: boolean;
  user: User | null;
  saving: boolean;
  currentLanguage: string;
  availableLanguages: string[];
  t: any;
  onToggleTheme: () => void;
  onToggleInstructions: () => void;
  onLanguageChange: (lang: string) => void;
  onExport: () => void;
  onImport: () => void;
  onSignOut: () => void;
  onShowAuthModal: () => void;
  onManualSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  isRTL,
  user,
  saving,
  currentLanguage,
  availableLanguages,
  t,
  onToggleTheme,
  onToggleInstructions,
  onLanguageChange,
  onExport,
  onImport,
  onSignOut,
  onShowAuthModal,
  onManualSave
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleLanguageChange = (lang: string) => {
    onLanguageChange(lang);
    setShowLanguageMenu(false);
  };

  return (
    <>
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-3`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t.header.title}</h1>
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {saving ? t.auth.saving : t.auth.autoSave}
                  </span>
                </div>
                <span className={`hidden md:inline text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} truncate max-w-[200px]`} title={user.email || ''}>
                  {user.email}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Import/Export Group */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              {user && (
                <button
                  onClick={onManualSave}
                  disabled={saving}
                  className={`p-2 rounded-lg transition-colors duration-150 ${
                    saving
                      ? isDark ? 'text-gray-600' : 'text-gray-400'
                      : isDark
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                  title={t.auth.saveData}
                >
                  <Save size={18} />
                </button>
              )}
              <button
                onClick={onExport}
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={t.importExport.export}
              >
                <Download size={18} />
              </button>
              <button
                onClick={onImport}
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={t.importExport.import}
              >
                <Upload size={18} />
              </button>
            </div>

            {/* App Controls Group */}
            <button
              onClick={onToggleInstructions}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title={t.header.howToUse}
            >
              <HelpCircle size={18} />
            </button>
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title={isDark ? t.header.switchToLight : t.header.switchToDark}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={t.languages[currentLanguage as keyof typeof t.languages]}
              >
                <Globe size={20} />
              </button>
              {showLanguageMenu && (
                <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-2 z-50 min-w-32`}>
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full px-4 py-2 text-sm text-${isRTL ? 'right' : 'left'} ${
                        currentLanguage === lang
                          ? isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                          : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      } transition-colors duration-150`}
                    >
                      {t.languages[lang as keyof typeof t.languages]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Button */}
            {user ? (
              <button
                onClick={onSignOut}
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={t.auth.signOut}
              >
                <LogOut size={18} />
              </button>
            ) : (
              <button
                onClick={onShowAuthModal}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 bg-blue-600 hover:bg-blue-700 text-white`}
              >
                {t.auth.signIn}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close language menu */}
      {showLanguageMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageMenu(false)}
        />
      )}
    </>
  );
};
