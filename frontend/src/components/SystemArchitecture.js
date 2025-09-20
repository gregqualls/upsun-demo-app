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
  const [dataPackets, setDataPackets] = useState([]);
  const [connections, setConnections] = useState([]);

  // Define service positions and connections - more spread out
  const serviceConfig = {
    'api_gateway': {
      name: 'API Gateway',
      icon: Globe,
      position: { x: 50, y: 50 },
      color: 'cyan',
      connections: ['user_management', 'payment_processing', 'inventory_system', 'notification_center']
    },
    'user_management': {
      name: 'User Mgmt',
      icon: Users,
      position: { x: 20, y: 20 },
      color: 'blue',
      connections: ['api_gateway']
    },
    'payment_processing': {
      name: 'Payment',
      icon: CreditCard,
      position: { x: 80, y: 20 },
      color: 'green',
      connections: ['api_gateway']
    },
    'inventory_system': {
      name: 'Inventory',
      icon: Package,
      position: { x: 20, y: 80 },
      color: 'orange',
      connections: ['api_gateway']
    },
    'notification_center': {
      name: 'Notifications',
      icon: Bell,
      position: { x: 80, y: 80 },
      color: 'pink',
      connections: ['api_gateway']
    },
    'dashboard': {
      name: 'Dashboard',
      icon: Activity,
      position: { x: 50, y: 10 },
      color: 'purple',
      connections: ['api_gateway']
    }
  };

  // Generate static connections
  useEffect(() => {
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
    setConnections(conns);
  }, []);

  // Generate animated data packets
  useEffect(() => {
    if (systemState !== 'running') {
      setDataPackets([]);
      return;
    }

    const generatePackets = () => {
      const packets = [];
      const now = Date.now();
      
      // Generate packets based on active apps
      Object.keys(apps).forEach(appName => {
        const appMetrics = metrics[appName];
        
        if (appMetrics && appMetrics.is_running && appName !== 'dashboard') {
          const config = serviceConfig[appName];
          if (config) {
            // Create packets to API Gateway
            config.connections.forEach(targetName => {
              if (targetName === 'api_gateway') {
                const intensity = Math.min(appMetrics.cpu_percent / 50, 1);
                const packetCount = Math.floor(intensity * 3) + 1; // 1-4 packets based on intensity
                
                for (let i = 0; i < packetCount; i++) {
                  packets.push({
                    id: `${appName}-${targetName}-${now}-${i}`,
                    from: config.position,
                    to: serviceConfig[targetName].position,
                    color: config.color,
                    timestamp: now,
                    delay: i * 500, // Stagger packets
                    speed: 2000 + Math.random() * 1000 // 2-3 seconds
                  });
                }
              }
            });
          }
        }
      });
      
      setDataPackets(prev => [...prev, ...packets]);
    };

    generatePackets();
    const interval = setInterval(generatePackets, 1500); // Generate new packets every 1.5 seconds
    
    return () => clearInterval(interval);
  }, [apps, metrics, systemState]);

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
      'cyan': 'shadow-cyan-500/50',
      'blue': 'shadow-blue-500/50',
      'green': 'shadow-green-500/50',
      'orange': 'shadow-orange-500/50',
      'pink': 'shadow-pink-500/50',
      'purple': 'shadow-purple-500/50'
    };
    return colorMap[color] || 'shadow-gray-500/50';
  };

  return (
    <div className="w-full bg-black text-cyan-400 font-mono text-sm rounded-lg shadow-lg overflow-hidden mb-8 relative border border-cyan-500/20">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900/50 px-4 py-3 border-b border-cyan-500/30">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-cyan-300">System Architecture</span>
          <div className={`w-2 h-2 rounded-full ${systemState === 'running' ? 'bg-cyan-500' : 'bg-gray-500'}`}></div>
        </div>
        <div className="text-xs text-cyan-400/70">
          {systemState === 'running' ? 'Live Data Flow' : 'System Stopped'}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Static Connection Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {connections.map((conn) => (
            <line
              key={conn.id}
              x1={`${conn.from.x}%`}
              y1={`${conn.from.y}%`}
              x2={`${conn.to.x}%`}
              y2={`${conn.to.y}%`}
              stroke="currentColor"
              strokeWidth="1"
              className="text-cyan-500/30"
            />
          ))}
        </svg>

        {/* Animated Data Packets */}
        <svg className="absolute inset-0 w-full h-full">
          {dataPackets.map((packet) => {
            const progress = Math.min((Date.now() - packet.timestamp - packet.delay) / packet.speed, 1);
            const x = packet.from.x + (packet.to.x - packet.from.x) * progress;
            const y = packet.from.y + (packet.to.y - packet.from.y) * progress;
            
            if (progress >= 1) return null;
            
            return (
              <circle
                key={packet.id}
                cx={`${x}%`}
                cy={`${y}%`}
                r="2"
                fill="currentColor"
                className={`text-${packet.color}-400 drop-shadow-lg`}
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
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
                <Icon className={`w-5 h-5 mb-1 ${isActive ? `text-${config.color}-400` : 'text-gray-500'}`} />
                
                {/* Service Name */}
                <div className="text-xs text-center leading-tight">
                  <div className={`font-medium ${isActive ? 'text-cyan-300' : 'text-gray-400'}`}>
                    {config.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-900/30 text-xs text-cyan-400/70">
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
          <div className="text-cyan-400/70">
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
