import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import ServiceStatus from './components/ServiceStatus';
import ResourceControls from './components/ResourceControls';
import MetricsDisplay from './components/MetricsDisplay';
import './index.css';

function App() {
  const [services, setServices] = useState({});
  const [metrics, setMetrics] = useState({});
  const [systemInfo, setSystemInfo] = useState({});
  const [stressMode, setStressMode] = useState(false);
  const [resourceLevels, setResourceLevels] = useState({
    cpu: 0,
    memory: 0,
    network: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Dynamically determine API URL at runtime
  const getApiBaseUrl = () => {
    // If we have an environment variable, use it
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // For production, construct the API URL from the current domain
    if (window.location.hostname.includes('platformsh.site')) {
      const currentHost = window.location.hostname;
      const apiHost = currentHost.replace(/^/, 'api.');
      return `https://${apiHost}`;
    }
    
    // For local development
    return 'http://localhost:8004';
  };
  
  const API_BASE_URL = getApiBaseUrl();

  // Fetch services status
  const fetchServicesStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/status`, {
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setServices(data);
      setApiError(null);
    } catch (error) {
      console.error('Error fetching services status:', error);
      setApiError(`API Error: ${error.message}`);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics`, {
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setMetrics(data);
      setApiError(null);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setApiError(`API Error: ${error.message}`);
    }
  };

  // Fetch resource levels
  const fetchResourceLevels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resources`, {
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResourceLevels(data);
      setApiError(null);
    } catch (error) {
      console.error('Error fetching resource levels:', error);
      setApiError(`API Error: ${error.message}`);
    }
  };

  // Fetch system information
  const fetchSystemInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/system`, {
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSystemInfo(data);
      setApiError(null);
    } catch (error) {
      console.error('Error fetching system info:', error);
      setApiError(`API Error: ${error.message}`);
    }
  };

  // Fetch stress mode status
  const fetchStressMode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stress`, {
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setStressMode(data.stress_mode || false);
      setApiError(null);
    } catch (error) {
      console.error('Error fetching stress mode:', error);
      setApiError(`API Error: ${error.message}`);
    }
  };

  // Toggle stress mode
  const toggleStressMode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stress`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setStressMode(data.stress_mode || false);
      setApiError(null);
    } catch (error) {
      console.error('Error toggling stress mode:', error);
      setApiError(`API Error: ${error.message}`);
    }
  };

  // Update resource levels
  const updateResourceLevels = async (newLevels) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLevels),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const data = await response.json();
        setResourceLevels(data.levels);
        setApiError(null);
        // Refresh metrics after successful update
        fetchMetrics();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating resource levels:', error);
      setApiError(`API Error: ${error.message}`);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchServicesStatus(),
        fetchResourceLevels(),
        fetchMetrics(),
        fetchSystemInfo(),
        fetchStressMode()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchServicesStatus();
      fetchMetrics();
      fetchStressMode();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading Upsun Demo...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* API Error Display */}
          {apiError && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    API Connection Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{apiError}</p>
                    <p className="mt-1">The application cannot connect to the backend API. This may be due to SSL certificate issues or network connectivity problems.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Status */}
            <div className="lg:col-span-1">
              <ServiceStatus services={services} />
            </div>
            
            {/* Resource Controls */}
            <div className="lg:col-span-2">
              <ResourceControls 
                resourceLevels={resourceLevels}
                onUpdate={updateResourceLevels}
                systemInfo={systemInfo}
                stressMode={stressMode}
                onToggleStress={toggleStressMode}
              />
            </div>
            
            {/* Metrics Display */}
            <div className="lg:col-span-3">
              <MetricsDisplay metrics={metrics} />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
// Force rebuild Tue Sep  9 14:58:54 BST 2025
