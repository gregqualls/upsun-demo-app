import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Globe, 
  Users, 
  CreditCard, 
  Package, 
  Bell,
  Activity,
  Zap
} from 'lucide-react';

const SystemArchitecture = ({ apps, metrics, systemState }) => {
  const [dataFlows, setDataFlows] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);

  // Define service positions and connections
  const serviceConfig = {
    'api_gateway': {
      name: 'API Gateway',
      icon: Globe,
      position: { x: 50, y: 20 },
      color: 'purple',
      connections: ['user_management', 'payment_processing', 'inventory_system', 'notification_center']
    },
    'user_management': {
      name: 'User Management',
      icon: Users,
      position: { x: 20, y: 60 },
      color: 'blue',
      connections: ['api_gateway']
    },
    'payment_processing': {
      name: 'Payment Processing',
      icon: CreditCard,
      position: { x: 50, y: 60 },
      color: 'green',
      connections: ['api_gateway']
    },
    'inventory_system': {
      name: 'Inventory System',
      icon: Package,
      position: { x: 80, y: 60 },
      color: 'orange',
      connections: ['api_gateway']
    },
    'notification_center': {
      name: 'Notification Center',
      icon: Bell,
      position: { x: 50, y: 80 },
      color: 'pink',
      connections: ['api_gateway']
    },
    'dashboard': {
      name: 'Dashboard',
      icon: Activity,
      position: { x: 50, y: 5 },
      color: 'indigo',
      connections: ['api_gateway']
    }
  };

  // Generate animated data flows
  useEffect(() => {
    if (systemState !== 'running') {
      setDataFlows([]);
      return;
    }

    const generateFlows = () => {
      const flows = [];
      const now = Date.now();
      
      // Generate flows based on active apps
      Object.keys(apps).forEach(appName => {
        const app = apps[appName];
        const appMetrics = metrics[appName];
        
        if (appMetrics && appMetrics.is_running && appName !== 'dashboard') {
          const config = serviceConfig[appName];
          if (config) {
            // Create flows to API Gateway
            config.connections.forEach(targetName => {
              if (targetName === 'api_gateway') {
                flows.push({
                  id: `${appName}-${targetName}-${now}-${Math.random()}`,
                  from: config.position,
                  to: serviceConfig[targetName].position,
                  intensity: Math.min(appMetrics.cpu_percent / 20, 1), // Scale intensity
                  color: config.color,
                  timestamp: now
                });
              }
            });
          }
        }
      });
      
      setDataFlows(flows);
    };

    generateFlows();
    const interval = setInterval(generateFlows, 2000); // Generate new flows every 2 seconds
    
    return () => clearInterval(interval);
  }, [apps, metrics, systemState]);

  // Clean up old flows
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setDataFlows(prev => prev.filter(flow => now - flow.timestamp < 5000)); // Keep flows for 5 seconds
    }, 1000);
    
    return () => clearInterval(cleanup);
  }, []);

  const getStatusColor = (appName) => {
    const app = apps[appName];
    const appMetrics = metrics[appName];
    
    if (systemState === 'stopped') return 'bg-gray-400';
    if (!appMetrics || !appMetrics.is_running) return 'bg-gray-400';
    if (app?.status === 'healthy') return 'bg-green-500';
    if (app?.status === 'unhealthy') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getPulseClass = (appName) => {
    const appMetrics = metrics[appName];
    if (systemState === 'stopped' || !appMetrics || !appMetrics.is_running) return '';
    return 'animate-pulse';
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white font-mono text-sm rounded-lg shadow-lg overflow-hidden mb-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800/50 px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-gray-200">System Architecture</span>
          <div className={`w-2 h-2 rounded-full ${systemState === 'running' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
        <div className="text-xs text-gray-400">
          {systemState === 'running' ? 'Live Data Flow' : 'System Stopped'}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="relative h-32 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Data Flow Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {dataFlows.map((flow) => {
            const opacity = Math.max(0.3, flow.intensity);
            const strokeWidth = Math.max(1, flow.intensity * 3);
            
            return (
              <line
                key={flow.id}
                x1={`${flow.from.x}%`}
                y1={`${flow.from.y}%`}
                x2={`${flow.to.x}%`}
                y2={`${flow.to.y}%`}
                stroke={`var(--${flow.color}-400)`}
                strokeWidth={strokeWidth}
                opacity={opacity}
                className="animate-pulse"
                style={{
                  strokeDasharray: '5,5',
                  animation: `dash ${2 + Math.random() * 2}s linear infinite`
                }}
              />
            );
          })}
        </svg>

        {/* Service Nodes */}
        {Object.entries(serviceConfig).map(([appName, config]) => {
          const Icon = config.icon;
          const appMetrics = metrics[appName];
          const isActive = systemState === 'running' && appMetrics?.is_running;
          
          return (
            <div
              key={appName}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${config.position.x}%`,
                top: `${config.position.y}%`
              }}
            >
              {/* Service Node */}
              <div className={`
                relative flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-300
                ${isActive 
                  ? `bg-${config.color}-500/20 border-${config.color}-400 shadow-lg shadow-${config.color}-500/25` 
                  : 'bg-gray-700/50 border-gray-600'
                }
                ${getPulseClass(appName)}
              `}>
                {/* Status Indicator */}
                <div className={`
                  absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900
                  ${getStatusColor(appName)}
                `}></div>
                
                {/* Service Icon */}
                <Icon className={`w-6 h-6 mb-1 ${isActive ? `text-${config.color}-300` : 'text-gray-500'}`} />
                
                {/* Service Name */}
                <div className="text-xs text-center leading-tight">
                  <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {config.name}
                  </div>
                  {appMetrics && (
                    <div className="text-xs text-gray-400 mt-1">
                      {appMetrics.instance_count} instance{appMetrics.instance_count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-800/30 text-xs text-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Unknown</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Unhealthy</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Inactive</span>
            </div>
          </div>
          <div className="text-gray-400">
            {dataFlows.length} active flows
          </div>
        </div>
      </div>

      {/* CSS for dash animation */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemArchitecture;
