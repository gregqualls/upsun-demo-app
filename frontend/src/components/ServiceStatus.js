import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Cpu, Database, Network, Server } from 'lucide-react';

const ServiceStatus = ({ services }) => {
  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'cpu_worker':
        return <Cpu className="w-5 h-5" />;
      case 'memory_worker':
        return <Database className="w-5 h-5" />;
      case 'network_simulator':
        return <Network className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  const getServiceDisplayName = (serviceName) => {
    switch (serviceName) {
      case 'cpu_worker':
        return 'CPU Worker';
      case 'memory_worker':
        return 'Memory Worker';
      case 'network_simulator':
        return 'Network Simulator';
      default:
        return serviceName;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'unhealthy':
        return 'status-unhealthy';
      default:
        return 'status-warning';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Service Status
        </h2>
        <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {Object.entries(services).map(([serviceName, serviceData]) => (
          <div
            key={serviceName}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center space-x-3">
              <div className="text-gray-600 dark:text-gray-400">
                {getServiceIcon(serviceName)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getServiceDisplayName(serviceName)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {serviceData.url}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(serviceData.status)}
              <span className={`status-indicator ${getStatusClass(serviceData.status)}`}>
                {serviceData.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
        <div className="flex items-center space-x-2 text-primary-700 dark:text-primary-300">
          <Server className="w-4 h-4" />
          <span className="text-sm font-medium">Upsun Auto-Scaling</span>
        </div>
        <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
          Services automatically scale based on resource usage and load
        </p>
      </div>
    </div>
  );
};

export default ServiceStatus;
