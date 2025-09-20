import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Power, Clock, Settings } from 'lucide-react';

const Header = ({ 
  systemState, 
  isUpdating, 
  onToggle,
  idleTimeout,
  setIdleTimeout,
  timeRemaining
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Simple Countdown Timer */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Idle:</span>
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                {timeRemaining ? 
                  `${Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:${(timeRemaining % 60).toString().padStart(2, '0')}` : 
                  `${idleTimeout}:00`
                }
              </span>
            </div>

            {/* Settings Button */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Idle timeout settings"
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              
              {/* Settings Dropdown */}
              {showSettings && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Idle Timeout</span>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        ×
                      </button>
                    </div>
                    <select
                      value={idleTimeout}
                      onChange={(e) => setIdleTimeout(parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Auto-shutdown prevents resource waste
                    </p>
                  </div>
                </div>
              )}
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
      </div>
    </header>
  );
};

export default Header;
