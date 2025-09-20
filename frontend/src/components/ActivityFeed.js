import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Zap, Database, Cpu, Memory } from 'lucide-react';

const ActivityFeed = ({ apps, metrics, systemState }) => {
  const [activities, setActivities] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const feedRef = useRef(null);
  const activityIdRef = useRef(0);

  // Generate activity entries based on current state
  useEffect(() => {
    if (isPaused || systemState === 'stopped') return;

    const interval = setInterval(() => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      
      // Generate different types of activities
      const activityTypes = [
        {
          type: 'api',
          icon: <Zap className="w-3 h-3" />,
          color: 'text-blue-400',
          getMessage: () => {
            const appNames = Object.keys(apps);
            const randomApp = appNames[Math.floor(Math.random() * appNames.length)];
            const actions = ['Resource update', 'Health check', 'Metrics fetch', 'Status sync'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            return `${action} → ${randomApp}`;
          }
        },
        {
          type: 'resource',
          icon: <Cpu className="w-3 h-3" />,
          color: 'text-green-400',
          getMessage: () => {
            const appNames = Object.keys(apps);
            const randomApp = appNames[Math.floor(Math.random() * appNames.length)];
            const resources = ['CPU', 'Memory', 'Network', 'Storage'];
            const resource = resources[Math.floor(Math.random() * resources.length)];
            const levels = ['Low', 'Medium', 'High', 'Maximum'];
            const level = levels[Math.floor(Math.random() * levels.length)];
            return `${randomApp}: ${resource} → ${level}`;
          }
        },
        {
          type: 'system',
          icon: <Activity className="w-3 h-3" />,
          color: 'text-yellow-400',
          getMessage: () => {
            const events = ['Instance scaling', 'Load balancing', 'Health monitoring', 'Auto-scaling check'];
            const event = events[Math.floor(Math.random() * events.length)];
            return `System: ${event}`;
          }
        },
        {
          type: 'metrics',
          icon: <Database className="w-3 h-3" />,
          color: 'text-purple-400',
          getMessage: () => {
            const appNames = Object.keys(apps);
            const randomApp = appNames[Math.floor(Math.random() * appNames.length)];
            const cpu = Math.floor(Math.random() * 100);
            const memory = Math.floor(Math.random() * 100);
            return `${randomApp}: CPU ${cpu}%, Memory ${memory}%`;
          }
        }
      ];

      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const newActivity = {
        id: activityIdRef.current++,
        timestamp,
        type: activityType.type,
        icon: activityType.icon,
        color: activityType.color,
        message: activityType.getMessage(),
        time: now.getTime()
      };

      setActivities(prev => {
        const updated = [...prev, newActivity];
        // Keep only last 50 activities to prevent memory issues
        return updated.slice(-50);
      });
    }, 800 + Math.random() * 1200); // Random interval between 800-2000ms

    return () => clearInterval(interval);
  }, [apps, systemState, isPaused]);

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
