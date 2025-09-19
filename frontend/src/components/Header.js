import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Server, Power } from 'lucide-react';

const Header = ({ 
  systemState, 
  isUpdating, 
  onToggle,
  batchMode,
  onToggleBatchMode,
  pendingChangesCount
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upsun Demo
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Multi-Service Resource Simulation
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-6">
            {/* Batch Mode Toggle */}
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium transition-colors ${
                batchMode 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                Configure Mode
              </span>
              
              <button
                onClick={onToggleBatchMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  batchMode
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                } cursor-pointer`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    batchMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              
              {pendingChangesCount > 0 && (
                <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-full">
                  {pendingChangesCount} pending
                </span>
              )}
            </div>

            {/* System Toggle */}
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium transition-colors ${
                systemState === 'running' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {systemState === 'running' ? 'System Running' : 'System Stopped'}
              </span>
              
              <button
                onClick={onToggle}
                disabled={isUpdating}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  systemState === 'running'
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                    systemState === 'running' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Power className={`w-3 h-3 ${
                        systemState === 'running' ? 'text-green-500' : 'text-gray-400'
                      }`} />
                    </div>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
