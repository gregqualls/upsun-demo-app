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
  const [resourceLevels, setResourceLevels] = useState({
    cpu: 0,
    memory: 0,
    network: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8004';

  // Fetch services status
  const fetchServicesStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/status`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services status:', error);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Fetch resource levels
  const fetchResourceLevels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resources`);
      const data = await response.json();
      setResourceLevels(data);
    } catch (error) {
      console.error('Error fetching resource levels:', error);
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
      });
      
      if (response.ok) {
        const data = await response.json();
        setResourceLevels(data.levels);
      }
    } catch (error) {
      console.error('Error updating resource levels:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchServicesStatus(),
        fetchResourceLevels(),
        fetchMetrics()
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
