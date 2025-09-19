import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import AppCard from './components/AppCard';
import MetricsDisplay from './components/MetricsDisplay';
import './index.css';

function App() {
  const [apps, setApps] = useState({});
  const [metrics, setMetrics] = useState({});
  const [systemInfo, setSystemInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingApps, setUpdatingApps] = useState(new Set());
  const [systemState, setSystemState] = useState('stopped'); // 'stopped', 'running', 'updating'

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
    return 'http://localhost:8000';
  };
  
  const API_BASE_URL = getApiBaseUrl();

  // Fetch apps status
  const fetchAppsStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/apps`, {
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Transform data for display
      const transformedApps = {};
      Object.keys(data).forEach(key => {
        transformedApps[key] = {
          name: key,
          displayName: data[key].name,
          status: data[key].status,
          levels: data[key].levels
        };
      });
      
      setApps(transformedApps);
      setApiError(null);
    } catch (error) {
      console.error('Error fetching apps status:', error);
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

  // Update app resource levels - optimistic updates
  const updateAppResources = async (appName, levels) => {
    // Immediately update local state (optimistic update)
    setApps(prev => ({
      ...prev,
      [appName]: {
        ...prev[appName],
        levels: levels
      }
    }));
    
    // Send API call in background
    try {
      const response = await fetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_name: appName,
          levels: levels
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      setApiError(null);
    } catch (error) {
      console.error('Error updating app resources:', error);
      setApiError(`API Error: ${error.message}`);
      
      // Revert on error - refresh from server
      await fetchAppsStatus();
    }
  };

  // Reset app resources
  const resetAppResources = async (appName) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${appName}/reset`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Refresh apps data
      await fetchAppsStatus();
      setApiError(null);
    } catch (error) {
      console.error('Error resetting app resources:', error);
      setApiError(`API Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle system on/off
  const toggleSystem = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setSystemState('updating');
    
    try {
      const isCurrentlyRunning = systemState === 'running';
      const allAppsLevels = {};
      
      // Use current slider values or defaults
      Object.keys(apps).forEach(appName => {
        const currentLevels = apps[appName].levels;
        allAppsLevels[appName] = isCurrentlyRunning ? {
          processing: 0,
          storage: 0,
          traffic: 0,
          orders: 0,
          completions: 0
        } : {
          processing: currentLevels.processing || 50,
          storage: currentLevels.storage || 50,
          traffic: currentLevels.traffic || 50,
          orders: currentLevels.orders || 50,
          completions: currentLevels.completions || 50
        };
      });

      const response = await fetch(`${API_BASE_URL}/resources/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levels: allAppsLevels
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Update local state immediately
      setApps(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(appName => {
          updated[appName] = {
            ...updated[appName],
            levels: allAppsLevels[appName]
          };
        });
        return updated;
      });
      
      setSystemState(isCurrentlyRunning ? 'stopped' : 'running');
      setApiError(null);
    } catch (error) {
      console.error('Error toggling system:', error);
      setSystemState(systemState); // Keep current state on error
      setApiError(`API Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
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





  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchAppsStatus(),
        fetchMetrics(),
        fetchSystemInfo()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppsStatus();
      fetchMetrics();
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
        <Header 
          systemState={systemState}
          isUpdating={isUpdating}
          onToggle={toggleSystem}
        />
        
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
          
          {/* Business Applications Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Business Applications
            </h2>
          </div>
          
          {/* App Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(apps).map((app) => (
                <AppCard
                  key={app.name}
                  app={app}
                  onUpdate={updateAppResources}
                  onReset={resetAppResources}
                  isUpdating={updatingApps.has(app.name)}
                />
              ))}
            </div>
          
          {/* Metrics Display */}
          <div className="mt-8">
            <MetricsDisplay metrics={metrics} />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
// Force rebuild Tue Sep  9 14:58:54 BST 2025
