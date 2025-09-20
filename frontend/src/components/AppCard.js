import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Network, 
  ShoppingCart, 
  CheckCircle, 
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';

const AppCard = ({ app, onUpdate, onReset, isUpdating, metrics, systemState }) => {
  const [localLevels, setLocalLevels] = useState(app.levels);
  const [isExpanded, setIsExpanded] = useState(false);

  // Only sync with server state on initial load or major changes (like system reset)
  React.useEffect(() => {
    // Only update if this is a fresh app object (different reference)
    setLocalLevels(app.levels);
  }, [app.name]); // Only when the app changes, not when levels change

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
    // Only grey out if system is off (based on systemState from parent)
    const isSystemOff = systemState === 'stopped';
    
    if (isSystemOff) {
      return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
    
    // Normal colors when system is on
    return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
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

  const isAppRunning = metrics && metrics[app.name.toLowerCase().replace(/\s+/g, '_')]?.is_running;
  
  return (
    <div className={`rounded-xl border-2 p-6 transition-all duration-200 ${getStatusColor()} ${
      !isAppRunning ? 'opacity-60' : ''
    }`}>
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
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Health</span>
            <div className={`w-4 h-4 rounded-full border-2 ${
              systemState === 'stopped' 
                ? 'bg-gray-300 border-gray-400' // Grey when system off
                : app.status === 'healthy'
                ? 'bg-green-500 border-green-600' // Green when healthy
                : app.status === 'unhealthy'
                ? 'bg-red-500 border-red-600' // Red when unhealthy
                : 'bg-yellow-500 border-yellow-600' // Yellow for unknown/starting
            }`}></div>
          </div>
        </div>
      </div>

      {/* Resource Controls Toggle */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors duration-200"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Resource Controls
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        {/* Collapsible Resource Controls */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
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
        )}
      </div>

      {/* Minimal Metrics */}
      {metrics && metrics[app.name.toLowerCase().replace(/\s+/g, '_')] && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Live metrics from API (host system locally, containers in production)
              <br />
              <span className="text-yellow-600 dark:text-yellow-400">
                Note: Upsun apps use BALANCED profile for resource allocation
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              {/* CPU Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">CPU</span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(metrics[app.name.toLowerCase().replace(/\s+/g, '_')].cpu_percent, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Memory Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Memory</span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(metrics[app.name.toLowerCase().replace(/\s+/g, '_')].memory_percent, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Instances as Container Icons */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Instances</span>
                <div className="flex space-x-1">
                  {Array.from({ length: metrics[app.name.toLowerCase().replace(/\s+/g, '_')].instance_count || 1 }).map((_, index) => (
                    <div key={index} className="w-3 h-3 bg-blue-500 rounded-sm border border-blue-600"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppCard;
