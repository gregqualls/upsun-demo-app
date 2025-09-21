import React, { useState } from 'react';
import { Cpu, Database, Network, Play, Pause, RotateCcw, Zap, AlertTriangle } from 'lucide-react';

const ResourceControls = ({ resourceLevels, onUpdate, systemInfo, stressMode, onToggleStress, loadLevel, onSimulateLoad, onStopLoad, isSimulatingLoad }) => {
  const [localLevels, setLocalLevels] = useState(resourceLevels);
  const [isRunning, setIsRunning] = useState(false);

  // Update local state when props change
  React.useEffect(() => {
    setLocalLevels(resourceLevels);
  }, [resourceLevels]);

  const handleSliderChange = (resource, value) => {
    const newLevels = { ...localLevels, [resource]: parseInt(value) };
    setLocalLevels(newLevels);
  };

  const handleSliderRelease = (resource, value) => {
    const newLevels = { ...localLevels, [resource]: parseInt(value) };
    onUpdate(newLevels);
  };

  const handleStartAll = () => {
    const newLevels = { cpu: 50, memory: 50, network: 50 };
    setLocalLevels(newLevels);
    onUpdate(newLevels);
    setIsRunning(true);
  };

  const handleStopAll = () => {
    const newLevels = { cpu: 0, memory: 0, network: 0 };
    setLocalLevels(newLevels);
    onUpdate(newLevels);
    setIsRunning(false);
  };

  const handleReset = () => {
    const newLevels = { cpu: 0, memory: 0, network: 0 };
    setLocalLevels(newLevels);
    onUpdate(newLevels);
    setIsRunning(false);
  };

  const handleStressMode = () => {
    if (onToggleStress) {
      onToggleStress();
    }
  };

  const handleTurnItUpTo11 = () => {
    const newLevels = { cpu: 100, memory: 100, network: 100 };
    setLocalLevels(newLevels);
    onUpdate(newLevels);
    setIsRunning(true);
    if (!stressMode && onToggleStress) {
      onToggleStress();
    }
  };

  const handleSimulateLoad = (level) => {
    if (onSimulateLoad) {
      onSimulateLoad(level);
    }
  };

  const handleStopLoad = () => {
    if (onStopLoad) {
      onStopLoad();
    }
  };

  const getResourceIcon = (resource) => {
    switch (resource) {
      case 'cpu':
        return <Cpu className="w-6 h-6" />;
      case 'memory':
        return <Database className="w-6 h-6" />;
      case 'network':
        return <Network className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getResourceColor = (resource) => {
    switch (resource) {
      case 'cpu':
        return 'text-blue-600 dark:text-blue-400';
      case 'memory':
        return 'text-green-600 dark:text-green-400';
      case 'network':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getResourceDisplayName = (resource) => {
    switch (resource) {
      case 'cpu':
        return 'CPU Usage';
      case 'memory':
        return 'Memory Usage';
      case 'network':
        return 'Network Traffic';
      default:
        return resource;
    }
  };

  const getResourceDescription = (resource) => {
    switch (resource) {
      case 'cpu':
        return 'Intensive calculations and processing';
      case 'memory':
        return 'Data structures and caching';
      case 'network':
        return 'Inter-service API calls';
      default:
        return '';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Resource Controls
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleStartAll}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start All</span>
          </button>
          <button
            onClick={handleStopAll}
            className="btn-secondary flex items-center space-x-2"
          >
            <Pause className="w-4 h-4" />
            <span>Stop All</span>
          </button>
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleStressMode}
            className={`flex items-center space-x-2 ${
              stressMode 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            } px-3 py-2 rounded-lg font-medium transition-colors text-sm`}
          >
            <Zap className="w-4 h-4" />
            <span>{stressMode ? 'Stress ON' : 'Stress OFF'}</span>
          </button>
          <button
            onClick={handleTurnItUpTo11}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Turn it up to 11!</span>
          </button>
        </div>
      </div>

      {/* Load Simulation Controls */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
          <Network className="w-5 h-5 mr-2" />
          Load Simulation (Horizontal Scaling Demo)
        </h4>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleSimulateLoad(25)}
            disabled={isSimulatingLoad}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Light Load (25%)
          </button>
          <button
            onClick={() => handleSimulateLoad(50)}
            disabled={isSimulatingLoad}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Normal Load (50%)
          </button>
          <button
            onClick={() => handleSimulateLoad(75)}
            disabled={isSimulatingLoad}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Heavy Load (75%)
          </button>
          <button
            onClick={() => handleSimulateLoad(100)}
            disabled={isSimulatingLoad}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Max Load (100%)
          </button>
          <button
            onClick={handleStopLoad}
            disabled={isSimulatingLoad}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Stop Load
          </button>
        </div>
        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          <p><strong>Current Load:</strong> {loadLevel}%</p>
          <p><strong>Status:</strong> {isSimulatingLoad ? 'Simulating...' : 'Ready'}</p>
          <p className="mt-2 text-xs">
            💡 <strong>Tip:</strong> This simulates external load that will trigger Upsun's horizontal scaling. 
            Each worker instance will respond to the same load level, demonstrating how scaling works.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(localLevels).map(([resource, level]) => (
          <div key={resource} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={getResourceColor(resource)}>
                  {getResourceIcon(resource)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {getResourceDisplayName(resource)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getResourceDescription(resource)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {level}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {level === 0 ? 'Idle' : level < 30 ? 'Light' : level < 70 ? 'Moderate' : 'Heavy'}
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={level}
                onChange={(e) => handleSliderChange(resource, e.target.value)}
                onMouseUp={(e) => handleSliderRelease(resource, e.target.value)}
                onTouchEnd={(e) => handleSliderRelease(resource, e.target.value)}
                className="slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${level}%, #e5e7eb ${level}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Visual indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    resource === 'cpu' ? 'bg-blue-500' :
                    resource === 'memory' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`}
                  style={{ width: `${level}%` }}
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[3rem] text-right">
                {level}%
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Demo Instructions
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Adjust sliders to control resource usage</li>
          <li>• Watch Upsun's auto-scaling in action</li>
          <li>• Monitor service health and performance</li>
          <li>• Use "Start All" for a quick demo setup</li>
          <li>• <strong>Stress Mode:</strong> Exceeds 100% CPU utilization (up to 200%)</li>
          <li>• <strong>Turn it up to 11:</strong> Maximum stress test with all resources at 100%</li>
        </ul>
      </div>
    </div>
  );
};

export default ResourceControls;
