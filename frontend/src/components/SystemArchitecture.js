import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, 
  Users, 
  CreditCard, 
  Package, 
  Bell,
  Activity,
  Zap
} from 'lucide-react';

const SystemArchitecture = ({ apps, metrics, systemState }) => {
  const [dataPackets, setDataPackets] = useState([]);
  const [connections, setConnections] = useState([]);

  // Define service positions and connections - Dashboard top middle, 2 top, 3 bottom
  const serviceConfig = {
    'api_gateway': {
      name: 'API Gateway',
      icon: Globe,
      position: { x: 50, y: 80 },
      color: 'purple',
      connections: ['user_management', 'payment_processing', 'inventory_system', 'notification_center', 'dashboard']
    },
    'dashboard': {
      name: 'Dashboard',
      icon: Activity,
      position: { x: 50, y: 20 },
      color: 'indigo',
      connections: ['api_gateway']
    },
    'user_management': {
      name: 'User Management',
      icon: Users,
      position: { x: 20, y: 20 },
      color: 'blue',
      connections: ['api_gateway']
    },
    'payment_processing': {
      name: 'Payment Processing',
      icon: CreditCard,
      position: { x: 80, y: 20 },
      color: 'green',
      connections: ['api_gateway']
    },
    'inventory_system': {
      name: 'Inventory System',
      icon: Package,
      position: { x: 20, y: 80 },
      color: 'orange',
      connections: ['api_gateway']
    },
    'notification_center': {
      name: 'Notification Center',
      icon: Bell,
      position: { x: 80, y: 80 },
      color: 'pink',
      connections: ['api_gateway']
    }
  };

  // Generate static connections
  const generateConnections = useCallback(() => {
    const conns = [];
    Object.entries(serviceConfig).forEach(([appName, config]) => {
      config.connections.forEach(targetName => {
        const target = serviceConfig[targetName];
        if (target) {
          conns.push({
            id: `${appName}-${targetName}`,
            from: config.position,
            to: target.position,
            color: config.color
          });
        }
      });
    });
    return conns;
  }, []);

  useEffect(() => {
    setConnections(generateConnections());
  }, [generateConnections]);

  // Generate animated data packets
  const generatePackets = useCallback(() => {
    const packets = [];
    const now = Date.now();
    
    // Generate packets based on active apps
    Object.keys(apps).forEach(appName => {
      const appMetrics = metrics[appName];
      
      if (appMetrics && appMetrics.is_running) {
        const config = serviceConfig[appName];
        if (config) {
          // Create packets to API Gateway
          config.connections.forEach(targetName => {
            if (targetName === 'api_gateway') {
              // For Dashboard, use a lower intensity since it's a frontend
              const intensity = appName === 'dashboard' 
                ? Math.min(appMetrics.cpu_percent / 100, 0.5) // Lower intensity for dashboard
                : Math.min(appMetrics.cpu_percent / 50, 1);
              
              const packetCount = Math.floor(intensity * 2) + 1; // 1-3 packets based on intensity
              
              for (let i = 0; i < packetCount; i++) {
                // Outgoing packets (to API Gateway)
                packets.push({
                  id: `${appName}-${targetName}-out-${now}-${i}`,
                  from: config.position,
                  to: serviceConfig[targetName].position,
                  color: config.color,
                  timestamp: now,
                  delay: i * 300, // Stagger packets
                  speed: 2000 + Math.random() * 1000 // 2-3 seconds
                });
                
                // Incoming packets (from API Gateway) - with slight delay
                packets.push({
                  id: `${appName}-${targetName}-in-${now}-${i}`,
                  from: serviceConfig[targetName].position,
                  to: config.position,
                  color: config.color, // Use the same color as the service for return packets
                  timestamp: now,
                  delay: (i * 300) + 1000, // Stagger and delay return packets
                  speed: 2000 + Math.random() * 1000 // 2-3 seconds
                });
              }
            }
          });
        }
      }
    });
    
    setDataPackets(prev => [...prev, ...packets]);
  }, [apps, metrics]);

  useEffect(() => {
    if (systemState !== 'running') {
      setDataPackets([]);
      return;
    }

    generatePackets();
    const interval = setInterval(generatePackets, 1500); // Generate new packets every 1.5 seconds
    
    return () => clearInterval(interval);
  }, [systemState, generatePackets]);

  // Clean up old packets
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setDataPackets(prev => prev.filter(packet => now - packet.timestamp < 8000)); // Keep packets for 8 seconds
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

  const getGlowColor = (color) => {
    const colorMap = {
      'purple': 'shadow-purple-500/50',
      'blue': 'shadow-blue-500/50',
      'green': 'shadow-green-500/50',
      'orange': 'shadow-orange-500/50',
      'pink': 'shadow-pink-500/50',
      'indigo': 'shadow-indigo-500/50'
    };
    return colorMap[color] || 'shadow-gray-500/50';
  };

  const getNodeColor = (color) => {
    const colorMap = {
      'purple': 'text-purple-400',
      'blue': 'text-blue-400',
      'green': 'text-green-400',
      'orange': 'text-orange-400',
      'pink': 'text-pink-400',
      'indigo': 'text-indigo-400'
    };
    return colorMap[color] || 'text-gray-400';
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-purple-400 font-mono text-sm rounded-lg shadow-lg overflow-hidden mb-8 relative border border-purple-500/20">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800/50 px-4 py-3 border-b border-purple-500/30">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-purple-300">System Architecture</span>
          <div className={`w-2 h-2 rounded-full ${systemState === 'running' ? 'bg-purple-500' : 'bg-gray-500'}`}></div>
        </div>
        <div className="text-xs text-purple-400/70">
          {systemState === 'running' ? 'Live Data Flow' : 'System Stopped'}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        {/* 3D Tron Grid - First Layer */}
        <div className="absolute inset-0 z-0">
          <svg width="100%" height="100%" className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gridFade" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.05"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* 3D Grid with perspective - bottom closest, top vanishing point */}
            <g>
              {/* Horizontal grid lines (getting closer together as they go up) */}
              {Array.from({length: 20}, (_, i) => {
                const y = 100 - (i * 4); // Start from bottom, go up
                const width = 100; // Full width
                const x1 = 0;
                const x2 = 100;
                const opacity = 0.4 - (i * 0.02); // Fade as they go up
                
                return (
                  <line
                    key={`h-${i}`}
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="url(#gridFade)"
                    strokeWidth="0.1"
                    opacity={opacity}
                    filter="url(#glow)"
                    style={{
                      animation: `pulse ${3 + Math.random() * 2}s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                );
              })}
              
              {/* Vertical grid lines (converging to vanishing point at top) */}
              {Array.from({length: 20}, (_, i) => {
                const x = 0 + (i * 5); // Evenly spaced across full width
                const topY = 20; // Vanishing point at top
                const bottomY = 100; // Bottom edge
                const opacity = 0.3 - (Math.abs(i - 10) * 0.015); // Fade towards edges
                
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1={bottomY}
                    x2={50 + (x - 50) * 0.2} // Converge towards center at top
                    y2={topY}
                    stroke="url(#gridFade)"
                    strokeWidth="0.1"
                    opacity={opacity}
                    filter="url(#glow)"
                    style={{
                      animation: `pulse ${3 + Math.random() * 2}s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                );
              })}
              
              {/* Additional depth lines for more 3D effect */}
              {Array.from({length: 10}, (_, i) => {
                const y = 100 - (i * 6);
                const width = 100; // Full width
                const x1 = 0;
                const x2 = 100;
                const opacity = 0.2 - (i * 0.02);
                
                return (
                  <line
                    key={`depth-${i}`}
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="url(#gridFade)"
                    strokeWidth="0.05"
                    opacity={opacity}
                    filter="url(#glow)"
                    style={{
                      animation: `pulse ${4 + Math.random() * 2}s ease-in-out infinite`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        {/* Static Connection Lines */}
        <svg className="absolute inset-0 w-full h-full z-10">
          {connections.map((conn) => (
            <line
              key={conn.id}
              x1={`${conn.from.x}%`}
              y1={`${conn.from.y}%`}
              x2={`${conn.to.x}%`}
              y2={`${conn.to.y}%`}
              stroke="currentColor"
              strokeWidth="1"
              className="text-purple-500/30"
            />
          ))}
        </svg>

        {/* Animated Data Packets */}
        <svg className="absolute inset-0 w-full h-full z-20">
          {dataPackets.map((packet) => {
            const progress = Math.min((Date.now() - packet.timestamp - packet.delay) / packet.speed, 1);
            
            // Ensure progress is between 0 and 1
            if (progress < 0 || progress >= 1) return null;
            
            // Calculate position along the line
            const x = packet.from.x + (packet.to.x - packet.from.x) * progress;
            const y = packet.from.y + (packet.to.y - packet.from.y) * progress;
            
            // Ensure packets stay within bounds
            if (x < 0 || x > 100 || y < 0 || y > 100) return null;
            
            return (
              <circle
                key={packet.id}
                cx={`${x}%`}
                cy={`${y}%`}
                r="2"
                fill="currentColor"
                className={`${getNodeColor(packet.color)} drop-shadow-lg`}
                style={{
                  filter: `drop-shadow(0 0 6px currentColor)`,
                  animation: 'pulse 1s ease-in-out infinite'
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
              style={{
                left: `${config.position.x}%`,
                top: `${config.position.y}%`
              }}
            >
              {/* Service Node */}
              <div className={`
                relative flex flex-col items-center p-2 rounded-lg border transition-all duration-300
                ${isActive 
                  ? `bg-${config.color}-500/10 border-${config.color}-400 shadow-lg ${getGlowColor(config.color)}` 
                  : 'bg-gray-800/50 border-gray-600'
                }
                ${isActive ? 'animate-pulse' : ''}
              `}>
                {/* Status Indicator */}
                <div className={`
                  absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black
                  ${getStatusColor(appName)}
                `}></div>
                
                {/* Service Icon */}
                <Icon className={`w-6 h-6 ${isActive ? getNodeColor(config.color) : 'text-gray-500'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-800/30 text-xs text-purple-400/70">
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
          <div className="text-purple-400/70">
            {dataPackets.length} active packets
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SystemArchitecture;
