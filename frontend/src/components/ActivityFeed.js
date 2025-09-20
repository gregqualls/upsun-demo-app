import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Zap, Database, Cpu, Memory } from 'lucide-react';

const ActivityFeed = ({ apps, metrics, systemState, onAddActivity }) => {
  const [activities, setActivities] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const feedRef = useRef(null);
  const activityIdRef = useRef(0);
  const prevAppsRef = useRef({});

  // Track real changes in apps data
  useEffect(() => {
    if (isPaused || systemState === 'stopped') return;

    const prevApps = prevAppsRef.current;
    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    // Check for resource level changes
    Object.keys(apps).forEach(appName => {
      const currentApp = apps[appName];
      const prevApp = prevApps[appName];

      if (prevApp && currentApp.levels) {
        Object.keys(currentApp.levels).forEach(resource => {
          const currentLevel = currentApp.levels[resource];
          const prevLevel = prevApp.levels?.[resource];

          if (prevLevel !== undefined && currentLevel !== prevLevel) {
            const levelNames = { 0: 'Off', 25: 'Low', 50: 'Medium', 75: 'High', 100: 'Maximum' };
            const currentLevelName = levelNames[currentLevel] || `${currentLevel}%`;
            const prevLevelName = levelNames[prevLevel] || `${prevLevel}%`;

            const newActivity = {
              id: activityIdRef.current++,
              timestamp,
              type: 'resource',
              icon: <Cpu className="w-3 h-3" />,
              color: 'text-green-400',
              message: `${appName}: ${resource} ${prevLevelName} → ${currentLevelName}`,
              time: now.getTime()
            };

            setActivities(prev => [...prev.slice(-49), newActivity]);
          }
        });
      }
    });

    prevAppsRef.current = JSON.parse(JSON.stringify(apps));
  }, [apps, systemState, isPaused]);

  // Track real metrics changes
  useEffect(() => {
    if (isPaused || systemState === 'stopped') return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    Object.keys(metrics).forEach(appName => {
      const appMetrics = metrics[appName];
      if (appMetrics) {
        const newActivity = {
          id: activityIdRef.current++,
          timestamp,
          type: 'metrics',
          icon: <Database className="w-3 h-3" />,
          color: 'text-purple-400',
          message: `${appName}: CPU ${Math.round(appMetrics.cpu_percent)}%, Memory ${Math.round(appMetrics.memory_percent)}%`,
          time: now.getTime()
        };

        setActivities(prev => [...prev.slice(-49), newActivity]);
      }
    });
  }, [metrics, systemState, isPaused]);

  // Expose addActivity function to parent
  useEffect(() => {
    if (onAddActivity) {
      onAddActivity((activity) => {
        const now = new Date();
        const newActivity = {
          id: activityIdRef.current++,
          timestamp: now.toLocaleTimeString(),
          ...activity,
          time: now.getTime()
        };
        setActivities(prev => [...prev.slice(-49), newActivity]);
      });
    }
  }, [onAddActivity]);

  // Auto-scroll to bottom when new activities are added
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [activities]);

  const getStatusColor = () => {
    switch (systemState) {
      case 'running': return 'text-green-400';
      case 'updating': return 'text-yellow-400';
      case 'stopped': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (systemState) {
      case 'running': return 'ACTIVE';
      case 'updating': return 'UPDATING';
      case 'stopped': return 'STOPPED';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="w-full bg-black rounded-lg border border-gray-700 mb-8 overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-mono text-gray-300">Live Activity Feed</span>
          <div className={`px-2 py-1 rounded text-xs font-mono ${getStatusColor()} bg-gray-800`}>
            {getStatusText()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-mono">
            {activities.length} events
          </span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
              isPaused 
                ? 'text-green-400 bg-green-900/30 hover:bg-green-900/50' 
                : 'text-red-400 bg-red-900/30 hover:bg-red-900/50'
            }`}
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div 
        ref={feedRef}
        className="h-32 overflow-y-auto font-mono text-xs p-4 space-y-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {activities.length === 0 ? (
          <div className="text-gray-500 italic">
            {systemState === 'stopped' ? 'System stopped - no activity' : 'Waiting for activity...'}
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 text-gray-300">
              <span className="text-gray-500 text-xs w-16">{activity.timestamp}</span>
              <span className={`${activity.color} flex items-center space-x-1`}>
                {activity.icon}
                <span className="text-xs font-bold uppercase">{activity.type}</span>
              </span>
              <span className="text-gray-200">{activity.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
