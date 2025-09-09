import React from 'react';
import { Activity, Cpu, Database, Network, TrendingUp, AlertTriangle } from 'lucide-react';

const MetricsDisplay = ({ metrics }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value) => {
    return typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A';
  };

  const getMetricCard = (title, icon, data, color = 'blue') => {
    const colorClasses = {
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
    };

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              {icon}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {data}
        </div>
      </div>
    );
  };

  const getCpuMetrics = () => {
    const cpuData = metrics.cpu_worker || {};
    const upsunCpuLimit = cpuData.upsun_cpu_limit || 0.5;
    const upsunMemoryLimit = cpuData.upsun_memory_limit_mb || 256;
    const memoryUsed = cpuData.memory_used_mb || 0;
    const memoryPercent = cpuData.memory_percent || 0;
    
    return (
      <>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPercentage(cpuData.cpu_percent)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">CPU Limit</span>
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
            {upsunCpuLimit} cores
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPercentage(memoryPercent)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Memory Used</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatBytes(memoryUsed * 1024 * 1024)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Memory Limit</span>
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
            {upsunMemoryLimit} MB
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current Level</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {cpuData.current_level || 0}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Instances</span>
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
            {cpuData.instance_count || 1}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
          <span className={`font-semibold ${cpuData.is_running ? 'text-success-600' : 'text-gray-500'}`}>
            {cpuData.is_running ? 'Running' : 'Idle'}
          </span>
        </div>
      </>
    );
  };

  const getMemoryMetrics = () => {
    const memoryData = metrics.memory_worker || {};
    return (
      <>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPercentage(memoryData.memory_percent)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Process Memory</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatBytes(memoryData.process_memory_mb * 1024 * 1024)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Data Structures</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {memoryData.data_structures_count?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current Level</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {memoryData.current_level || 0}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
          <span className={`font-semibold ${memoryData.is_running ? 'text-success-600' : 'text-gray-500'}`}>
            {memoryData.is_running ? 'Running' : 'Idle'}
          </span>
        </div>
      </>
    );
  };

  const getNetworkMetrics = () => {
    const networkData = metrics.network_simulator || {};
    return (
      <>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {networkData.request_count?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Errors</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {networkData.error_count?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPercentage(networkData.success_rate)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Requests/sec</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {networkData.target_requests_per_second?.toFixed(1) || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
          <span className={`font-semibold ${networkData.is_running ? 'text-success-600' : 'text-gray-500'}`}>
            {networkData.is_running ? 'Running' : 'Idle'}
          </span>
        </div>
      </>
    );
  };

  const getSystemMetrics = () => {
    // Aggregate system metrics
    const cpuData = metrics.cpu_worker || {};
    const memoryData = metrics.memory_worker || {};
    const networkData = metrics.network_simulator || {};

    const totalRequests = networkData.request_count || 0;
    const totalErrors = networkData.error_count || 0;
    const avgCpuUsage = cpuData.cpu_percent || 0;
    const avgMemoryUsage = memoryData.memory_percent || 0;

    return (
      <>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Avg CPU Usage</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPercentage(avgCpuUsage)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Avg Memory Usage</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPercentage(avgMemoryUsage)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalRequests.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalRequests > 0 ? formatPercentage((totalErrors / totalRequests) * 100) : '0%'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active Services</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {[cpuData.is_running, memoryData.is_running, networkData.is_running].filter(Boolean).length}/3
          </span>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Real-time Metrics
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getMetricCard('CPU Worker', <Cpu className="w-5 h-5" />, getCpuMetrics(), 'blue')}
        {getMetricCard('Memory Worker', <Database className="w-5 h-5" />, getMemoryMetrics(), 'green')}
        {getMetricCard('Network Simulator', <Network className="w-5 h-5" />, getNetworkMetrics(), 'purple')}
        {getMetricCard('System Overview', <TrendingUp className="w-5 h-5" />, getSystemMetrics(), 'orange')}
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-900 dark:text-primary-100">
              Upsun Auto-Scaling Active
            </h3>
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Services automatically scale based on resource usage. Monitor the Upsun dashboard to see scaling events in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
