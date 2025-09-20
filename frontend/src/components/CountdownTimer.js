import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const CountdownTimer = ({ 
  timeRemaining, 
  type = 'shutdown', // 'shutdown' or 'deployment'
  onCancel,
  title = 'Auto-shutdown in:',
  warningThreshold = 10
}) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isWarning = timeRemaining <= warningThreshold;
  
  const getColors = () => {
    if (type === 'deployment') {
      return {
        bg: isWarning 
          ? 'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40'
          : 'from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40',
        border: 'border-blue-300 dark:border-blue-700',
        text: 'text-blue-700 dark:text-blue-300',
        accent: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 dark:bg-blue-500'
      };
    } else {
      return {
        bg: isWarning 
          ? 'from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40'
          : 'from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40',
        border: 'border-red-300 dark:border-red-700',
        text: 'text-red-700 dark:text-red-300',
        accent: 'text-red-600 dark:text-red-400',
        button: 'bg-red-600 dark:bg-red-500'
      };
    }
  };

  const colors = getColors();

  return (
    <div className={`flex items-center space-x-3 px-4 py-3 bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-lg shadow-lg transition-all duration-300 ${isWarning ? 'animate-pulse' : ''}`}>
      <div className="flex items-center space-x-2">
        {isWarning ? (
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-pulse" />
        ) : (
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
        <span className={`text-sm font-semibold ${colors.text}`}>
          {title}
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <div className={`${colors.button} text-white px-3 py-2 rounded font-mono text-xl font-bold min-w-[2.5rem] text-center shadow-inner`}>
          {minutes.toString().padStart(2, '0')}
        </div>
        <span className={`${colors.accent} font-bold text-lg`}>:</span>
        <div className={`${colors.button} text-white px-3 py-2 rounded font-mono text-xl font-bold min-w-[2.5rem] text-center shadow-inner`}>
          {seconds.toString().padStart(2, '0')}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={`text-xs ${colors.text} font-medium`}>
          {isWarning ? 'FINAL WARNING!' : 'Click anywhere to cancel'}
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className={`px-3 py-1 text-xs font-medium text-white ${colors.button} rounded hover:opacity-80 transition-opacity`}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
