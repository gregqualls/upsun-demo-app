import React, { useState, useEffect } from 'react';
import { Zap, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import AppCard from './components/AppCard';
import ActivityFeed from './components/ActivityFeed';
import SystemArchitecture from './components/SystemArchitecture';
import MetricsSourceIndicator from './components/MetricsSourceIndicator';
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
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [addActivity, setAddActivity] = useState(null);
  const [upsunActivities, setUpsunActivities] = useState([]);
  const [metricsSource, setMetricsSource] = useState('simulation');
  const [runtimeTimeout, setRuntimeTimeout] = useState(10); // Minutes before auto-shutdown
  const [timeRemaining, setTimeRemaining] = useState(null); // Seconds remaining
  const [systemStartTime, setSystemStartTime] = useState(null); // When system was turned on
  const [isCountdownActive, setIsCountdownActive] = useState(false); // Track if countdown is running

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
          levels: data[key].levels,
          has_controls: data[key].has_controls
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
    // Log API call to activity feed
    if (addActivity) {
      addActivity({
        type: 'api',
        icon: <Zap className="w-3 h-3" />,
        color: 'text-blue-400',
        message: `API: POST /resources → ${appName}`
      });
    }

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
      
      // Log successful API response
      if (addActivity) {
        addActivity({
          type: 'api',
          icon: <Zap className="w-3 h-3" />,
          color: 'text-green-400',
          message: `API: 200 OK ← ${appName}`
        });
      }
      
      setApiError(null);
    } catch (error) {
      console.error('Error updating app resources:', error);
      setApiError(`API Error: ${error.message}`);
      
      // Log API error
      if (addActivity) {
        addActivity({
          type: 'api',
          icon: <Zap className="w-3 h-3" />,
          color: 'text-red-400',
          message: `API: ERROR ← ${appName} (${error.message})`
        });
      }
      
      // Revert on error - refresh from server
      await fetchAppsStatus();
    }
  };

  // Reset app resources - just set sliders to 50 and let normal flow handle API
  const resetAppResources = (appName) => {
    const newLevels = {
      processing: 50,
      storage: 50,
      traffic: 50,
      orders: 50,
      completions: 50
    };
    
    // Update local state to set all levels to 50 (medium)
    setApps(prev => ({
      ...prev,
      [appName]: {
        ...prev[appName],
        levels: newLevels
      }
    }));
    
    // Send API call in background
    updateAppResources(appName, newLevels);
  };

  // Toggle system on/off
  const toggleSystem = async () => {
    if (isUpdating) return;
    
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

    // Update UI immediately (optimistic update)
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
    setIsUpdating(false); // UI is updated, no need to show loading
    
    // Log system toggle
    if (addActivity) {
      addActivity({
        type: 'system',
        icon: <Activity className="w-3 h-3" />,
        color: 'text-yellow-400',
        message: `System: ${isCurrentlyRunning ? 'STOPPING' : 'STARTING'} all apps`
      });
    }
    
    // Send API call in background (don't wait for it)
    try {
      // Log API call
      if (addActivity) {
        addActivity({
          type: 'api',
          icon: <Zap className="w-3 h-3" />,
          color: 'text-blue-400',
          message: `API: POST /resources/all → ${isCurrentlyRunning ? 'STOP' : 'START'} all apps`
        });
      }

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
        console.warn(`API call failed: ${response.status}`);
        // Log API error
        if (addActivity) {
          addActivity({
            type: 'api',
            icon: <Zap className="w-3 h-3" />,
            color: 'text-red-400',
            message: `API: ERROR ← /resources/all (${response.status})`
          });
        }
        // Don't revert UI on API failure - let user see the change
      } else {
        // Log successful API response
        if (addActivity) {
          addActivity({
            type: 'api',
            icon: <Zap className="w-3 h-3" />,
            color: 'text-green-400',
            message: `API: 200 OK ← /resources/all`
          });
        }
      }
      
      // Refresh apps status and metrics after API call
      fetchAppsStatus();
      fetchMetrics();
      
      setApiError(null);
    } catch (error) {
      console.error('Background API call failed:', error);
      // Log API error
      if (addActivity) {
        addActivity({
          type: 'api',
          icon: <Zap className="w-3 h-3" />,
          color: 'text-red-400',
          message: `API: ERROR ← /resources/all (${error.message})`
        });
      }
      // Don't revert UI on API failure - let user see the change
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

  // Fetch Upsun activities
  const fetchUpsunActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/upsun-activities`);
      const data = await response.json();
      setUpsunActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching Upsun activities:', error);
    }
  };

  // Stop all activities when browser window closes
  const stopAllActivities = async () => {
    try {
      // Set all apps to minimum levels (0) to stop all activities
      const allAppsLevels = {};
      Object.keys(apps).forEach(appName => {
        allAppsLevels[appName] = {
          processing: 0,
          storage: 0,
          traffic: 0,
          orders: 0,
          completions: 0
        };
      });

      // Send API call to stop all activities
      await fetch(`${API_BASE_URL}/resources/all`, {
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

      console.log('All activities stopped due to window close');
    } catch (error) {
      console.error('Error stopping activities on window close:', error);
    }
  };





  // Reset all resources to medium
  const resetAllResources = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Reset all apps to medium levels (50)
      const allAppsLevels = {};
      Object.keys(apps).forEach(appName => {
        allAppsLevels[appName] = {
          processing: 50,
          storage: 50,
          traffic: 50,
          orders: 50,
          completions: 50
        };
      });

      // Update UI immediately
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

      // Log API call
      if (addActivity) {
        addActivity({
          type: 'api',
          icon: <Zap className="w-3 h-3" />,
          color: 'text-blue-400',
          message: `API: POST /resources/all → RESET all apps to medium`
        });
      }

      // Send API call in background
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
        console.warn(`API call failed: ${response.status}`);
        // Log API error
        if (addActivity) {
          addActivity({
            type: 'api',
            icon: <Zap className="w-3 h-3" />,
            color: 'text-red-400',
            message: `API: ERROR ← /resources/all (${response.status})`
          });
        }
      } else {
        // Log successful API response
        if (addActivity) {
          addActivity({
            type: 'api',
            icon: <Zap className="w-3 h-3" />,
            color: 'text-green-400',
            message: `API: 200 OK ← /resources/all`
          });
        }
      }
      
      // Refresh data
      fetchAppsStatus();
      fetchMetrics();
      
      setApiError(null);
    } catch (error) {
      console.error('Error resetting all resources:', error);
      setApiError(`API Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Set all resources to maximum
  const setAllToMax = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Set all apps to maximum levels (100)
      const allAppsLevels = {};
      Object.keys(apps).forEach(appName => {
        allAppsLevels[appName] = {
          processing: 100,
          storage: 100,
          traffic: 100,
          orders: 100,
          completions: 100
        };
      });

      // Update UI immediately
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

      // Log API call
      if (addActivity) {
        addActivity({
          type: 'api',
          icon: <Zap className="w-3 h-3" />,
          color: 'text-blue-400',
          message: `API: POST /resources/all → SET all apps to maximum`
        });
      }

      // Send API call in background
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
        console.warn(`API call failed: ${response.status}`);
        // Log API error
        if (addActivity) {
          addActivity({
            type: 'api',
            icon: <Zap className="w-3 h-3" />,
            color: 'text-red-400',
            message: `API: ERROR ← /resources/all (${response.status})`
          });
        }
      } else {
        // Log successful API response
        if (addActivity) {
          addActivity({
            type: 'api',
            icon: <Zap className="w-3 h-3" />,
            color: 'text-green-400',
            message: `API: 200 OK ← /resources/all`
          });
        }
      }
      
      // Refresh data
      fetchAppsStatus();
      fetchMetrics();
      
      setApiError(null);
    } catch (error) {
      console.error('Error setting all resources to max:', error);
      setApiError(`API Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Set all resources to minimum
  const setAllToMin = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Set all apps to minimum levels (0)
      const allAppsLevels = {};
      Object.keys(apps).forEach(appName => {
        allAppsLevels[appName] = {
          processing: 0,
          storage: 0,
          traffic: 0,
          orders: 0,
          completions: 0
        };
      });

      // Update UI immediately
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

      // Log API call
      if (addActivity) {
        addActivity({
          type: 'api',
          icon: <Zap className="w-3 h-3" />,
          color: 'text-blue-400',
          message: `API: POST /resources/all → SET all apps to minimum`
        });
      }

      // Send API call in background
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
        console.warn(`API call failed: ${response.status}`);
        // Log API error
        if (addActivity) {
          addActivity({
            type: 'api',
            icon: <Zap className="w-3 h-3" />,
            color: 'text-red-400',
            message: `API: ERROR ← /resources/all (${response.status})`
          });
        }
      } else {
        // Log successful API response
        if (addActivity) {
          addActivity({
            type: 'api',
            icon: <Zap className="w-3 h-3" />,
            color: 'text-green-400',
            message: `API: 200 OK ← /resources/all`
          });
        }
      }
      
      // Refresh data
      fetchAppsStatus();
      fetchMetrics();
      
      setApiError(null);
    } catch (error) {
      console.error('Error setting all resources to min:', error);
      setApiError(`API Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Collapse all cards
  const toggleAllCards = () => {
    if (allExpanded) {
      // Collapse all
      setExpandedCards(new Set());
      setAllExpanded(false);
    } else {
      // Expand all
      const allAppNames = new Set(Object.keys(apps));
      setExpandedCards(allAppNames);
      setAllExpanded(true);
    }
  };

  // Toggle individual card expansion
  const toggleCardExpansion = (appName) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appName)) {
        newSet.delete(appName);
      } else {
        newSet.add(appName);
      }
      
      // Update allExpanded state based on current expansion
      const allAppNames = new Set(Object.keys(apps));
      setAllExpanded(newSet.size === allAppNames.size && allAppNames.size > 0);
      
      return newSet;
    });
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

  // Monitor for scaling events
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUpsunActivities();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Detect autoscaling events
  useEffect(() => {
    const scalingEvents = upsunActivities.filter(activity => 
      activity.type && activity.type.includes('scale')
    );
    
    if (scalingEvents.length > 0) {
      // Refresh metrics when scaling events occur
      fetchMetrics();
    }
  }, [upsunActivities]);

  // Update metrics source indicator
  useEffect(() => {
    if (Object.keys(metrics).length > 0) {
      const firstApp = Object.values(metrics)[0];
      if (firstApp.source) {
        setMetricsSource(firstApp.source);
      }
    }
  }, [metrics]);

  // Real-time instance count updates (more frequent for autoscaling detection)
  useEffect(() => {
    const instanceInterval = setInterval(() => {
      // Force refresh metrics to get updated instance counts
      fetchMetrics();
    }, 5000); // Update every 5 seconds for instance counts

    return () => clearInterval(instanceInterval);
  }, []);

  // Runtime timeout system - stop system after X minutes of being ON
  useEffect(() => {
    let runtimeTimer = null;
    let countdownTimer = null;

    const startRuntimeTimer = () => {
      setSystemStartTime(Date.now());
      setTimeRemaining(null);
      
      // Clear existing timers
      if (runtimeTimer) clearTimeout(runtimeTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      
      // Set new runtime timer
      runtimeTimer = setTimeout(() => {
        // Start countdown when runtime timeout is reached
        setIsCountdownActive(true);
        setTimeRemaining(60); // 1 minute countdown
        countdownTimer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Time's up - turn off system switch
              setIsCountdownActive(false);
              toggleSystem();
              setTimeRemaining(null);
              setSystemStartTime(null);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }, runtimeTimeout * 60 * 1000); // Convert minutes to milliseconds
    };

    const stopRuntimeTimer = () => {
      setSystemStartTime(null);
      setTimeRemaining(null);
      setIsCountdownActive(false);
      if (runtimeTimer) clearTimeout(runtimeTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };

    // Start timer when system turns on, but don't reset if countdown is active
    if (systemState === 'running' && !isCountdownActive) {
      console.log('Starting runtime timer...');
      startRuntimeTimer();
    } else if (systemState === 'stopped' && !isCountdownActive) {
      console.log('Stopping runtime timer...');
      stopRuntimeTimer();
    } else if (isCountdownActive) {
      console.log('Countdown is active, not resetting timer');
    }

    // Cleanup
    return () => {
      if (runtimeTimer) clearTimeout(runtimeTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [systemState, runtimeTimeout, toggleSystem, isCountdownActive]); // Re-run when system state or timeout setting changes

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
          runtimeTimeout={runtimeTimeout}
          setRuntimeTimeout={setRuntimeTimeout}
          timeRemaining={timeRemaining}
          systemStartTime={systemStartTime}
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
          
          {/* System Architecture Visualization */}
          <SystemArchitecture 
            apps={apps} 
            metrics={metrics} 
            systemState={systemState}
          />
          
          {/* Metrics Source Indicator */}
          <div className="mb-4 flex justify-center">
            <MetricsSourceIndicator source={metricsSource} />
          </div>
          
          {/* Applications Header with Controls */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Applications
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={resetAllResources}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset All to Medium
              </button>
              <button
                onClick={setAllToMax}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set All to Max
              </button>
              <button
                onClick={setAllToMin}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set All to Min
              </button>
              <button
                onClick={toggleAllCards}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200 flex items-center"
              >
                {allExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Expand All
                  </>
                )}
              </button>
            </div>
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
                  metrics={metrics}
                  systemState={systemState}
                  isExpanded={expandedCards.has(app.name)}
                  onToggleExpansion={() => toggleCardExpansion(app.name)}
                />
              ))}
            </div>
          
          {/* Live Activity Feed - Moved to bottom */}
          <div className="mt-12">
            <ActivityFeed 
              apps={apps} 
              metrics={metrics} 
              systemState={systemState}
              onAddActivity={setAddActivity}
            />
          </div>
          
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
// Force rebuild Tue Sep  9 14:58:54 BST 2025
