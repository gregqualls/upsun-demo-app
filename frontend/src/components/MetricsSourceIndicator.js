import React from 'react';
import { Zap, Database, Activity } from 'lucide-react';

const MetricsSourceIndicator = ({ source }) => {
  const getSourceInfo = (source) => {
    switch (source) {
      case 'hybrid':
        return {
          icon: <Zap className="w-4 h-4" />,
          text: 'Live + Upsun',
          color: 'text-green-400',
          description: 'Real-time simulation with Upsun validation'
        };
             case 'simulation':
               return {
                 icon: <Activity className="w-4 h-4" />,
                 text: 'Live Simulation',
                 color: 'text-blue-400',
                 description: 'Real-time simulation (local dev)'
               };
             case 'upsun_simulation':
               return {
                 icon: <Activity className="w-4 h-4" />,
                 text: 'Upsun Simulation',
                 color: 'text-purple-400',
                 description: 'Real-time simulation on Upsun platform'
               };
      case 'upsun_cli':
        return {
          icon: <Database className="w-4 h-4" />,
          text: 'Upsun Native',
          color: 'text-purple-400',
          description: 'Direct Upsun platform metrics'
        };
      case 'cli_not_available':
        return {
          icon: <Activity className="w-4 h-4" />,
          text: 'Simulation Only',
          color: 'text-yellow-400',
          description: 'Upsun CLI not available in container'
        };
      default:
        return {
          icon: <Activity className="w-4 h-4" />,
          text: 'Unknown',
          color: 'text-gray-400',
          description: 'Metrics source unknown'
        };
    }
  };

  const sourceInfo = getSourceInfo(source);

  return (
    <div className="flex items-center space-x-2 text-sm">
      {sourceInfo.icon}
      <span className={sourceInfo.color}>
        {sourceInfo.text}
      </span>
      <span className="text-gray-400 text-xs" title={sourceInfo.description}>
        {sourceInfo.description}
      </span>
    </div>
  );
};

export default MetricsSourceIndicator;
