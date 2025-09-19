import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Network, 
  ShoppingCart, 
  CheckCircle, 
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const AppCard = ({ app, onUpdate, onReset, isUpdating }) => {
  const [localLevels, setLocalLevels] = useState(app.levels);

  // Update local state when props change
  React.useEffect(() => {
    setLocalLevels(app.levels);
  }, [app.levels]);

  const handleSliderChange = (resource, value) => {
    const newLevels = { ...localLevels, [resource]: parseInt(value) };
    setLocalLevels(newLevels);
    // Immediately call onUpdate for real-time updates
    onUpdate(app.name, newLevels);
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

  const getIntensityLabel = (value) => {
    if (value === 0) return 'Off';
    if (value <= 20) return 'Low';
    if (value <= 40) return 'Light';
    if (value <= 60) return 'Medium';
    if (value <= 80) return 'High';
    return 'Maximum';
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
          {isUpdating && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <span className={`px-3 py-1 rounded-full text-sm font-medium cursor-help ${
              app.status === 'healthy' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : app.status === 'unhealthy'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}>
              {app.status}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {app.status === 'healthy' 
                ? 'Service is running normally and responding to requests'
                : app.status === 'unhealthy'
                ? 'Service is not responding or has errors'
                : 'Service status is unknown or starting up'
              }
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Controls */}
      <div className="space-y-4">
        {resourceConfigs.map(({ key, label, icon: Icon, color, bgColor, description }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative group">
                  <div className={`p-2 rounded-lg ${bgColor} cursor-help`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  {/* Resource Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
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
                {getIntensityLabel(localLevels[key] || 0)}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={localLevels[key] || 0}
                onChange={(e) => handleSliderChange(key, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none dark:bg-gray-700 slider cursor-pointer"
              />
              {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AppCard;
