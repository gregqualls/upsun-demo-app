import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Network, 
  ShoppingCart, 
  CheckCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const AppCard = ({ app, onUpdate, onReset, isUpdating }) => {
  const [localLevels, setLocalLevels] = useState(app.levels);
  const [isRunning, setIsRunning] = useState(false);

  // Update local state when props change
  React.useEffect(() => {
    setLocalLevels(app.levels);
  }, [app.levels]);

  const handleSliderChange = (resource, value) => {
    const newLevels = { ...localLevels, [resource]: parseInt(value) };
    setLocalLevels(newLevels);
  };

  const handleSliderRelease = (resource, value) => {
    const newLevels = { ...localLevels, [resource]: parseInt(value) };
    onUpdate(app.name, newLevels);
  };

  const handleStartAll = () => {
    const newLevels = { 
      processing: 50, 
      storage: 50, 
      traffic: 50, 
      orders: 50, 
      completions: 50 
    };
    setLocalLevels(newLevels);
    onUpdate(app.name, newLevels);
    setIsRunning(true);
  };

  const handleStopAll = () => {
    const newLevels = { 
      processing: 0, 
      storage: 0, 
      traffic: 0, 
      orders: 0, 
      completions: 0 
    };
    setLocalLevels(newLevels);
    onUpdate(app.name, newLevels);
    setIsRunning(false);
  };

  const handleReset = () => {
    const newLevels = { 
      processing: 0, 
      storage: 0, 
      traffic: 0, 
      orders: 0, 
      completions: 0 
    };
    setLocalLevels(newLevels);
    onReset(app.name);
    setIsRunning(false);
  };

  const getStatusIcon = () => {
    switch (app.status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'unhealthy':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (app.status) {
      case 'healthy':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'unhealthy':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
    }
  };

  const resourceConfigs = [
    {
      key: 'processing',
      label: 'Processing',
      icon: Cpu,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      description: 'CPU-intensive tasks'
    },
    {
      key: 'storage',
      label: 'Storage',
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      description: 'Memory-intensive operations'
    },
    {
      key: 'traffic',
      label: 'Traffic',
      icon: Network,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      description: 'Network communication'
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      description: 'Order processing'
    },
    {
      key: 'completions',
      label: 'Completions',
      icon: CheckCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      description: 'Work completion tracking'
    }
  ];

  return (
    <div className={`rounded-xl border-2 p-6 transition-all duration-200 ${getStatusColor()}`}>
      {/* App Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {app.displayName}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            app.status === 'healthy' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : app.status === 'unhealthy'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {app.status}
          </span>
        </div>
      </div>

      {/* Resource Controls */}
      <div className="space-y-4">
        {resourceConfigs.map(({ key, label, icon: Icon, color, bgColor, description }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {localLevels[key] || 0}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={localLevels[key] || 0}
              onChange={(e) => handleSliderChange(key, e.target.value)}
              onMouseUp={(e) => handleSliderRelease(key, e.target.value)}
              onTouchEnd={(e) => handleSliderRelease(key, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
              disabled={isUpdating}
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={handleStartAll}
            disabled={isUpdating}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
          <button
            onClick={handleStopAll}
            disabled={isUpdating}
            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Pause className="w-4 h-4" />
            <span>Stop</span>
          </button>
        </div>
        <button
          onClick={handleReset}
          disabled={isUpdating}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default AppCard;
