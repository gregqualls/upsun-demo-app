import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Server, Power } from 'lucide-react';

const Header = ({ 
  systemState, 
  isUpdating, 
  onToggle
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* System Toggle as Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onToggle}
                disabled={isUpdating}
                className={`relative inline-flex h-12 w-20 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  systemState === 'running'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform duration-200 ${
                    systemState === 'running' ? 'translate-x-9' : 'translate-x-1'
                  }`}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Power className={`w-4 h-4 ${
                        systemState === 'running' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                    </div>
                  )}
                </span>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Upsun Demo
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Multi-Service Resource Simulation
                </p>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-purple-600" />
            ) : (
              <Moon className="w-5 h-5 text-purple-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
