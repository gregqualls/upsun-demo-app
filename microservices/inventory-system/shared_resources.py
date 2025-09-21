"""
Centralized resource management library for microservices.
This library provides CPU, memory, and network resource simulation
that can be used by any microservice in the ecosystem.
"""

import asyncio
import time
import multiprocessing
import os
import json
import math
import threading
import random
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional
try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

class UpsunMetricsManager:
    """Hybrid metrics manager - real-time simulation + Upsun metrics"""
    
    def __init__(self, app_name: str):
        self.app_name = app_name
        self.is_running = False
        self.resource_levels = {
            'processing': 0,  # CPU load
            'storage': 0      # Memory usage
        }
        self._last_upsun_metrics = {}
        self._last_upsun_check = 0
        self._instance_count = "unknown"
        self._last_instance_check = 0
        self._cpu_thread = None
        self._cpu_thread_lock = threading.Lock()
        self._lock = threading.Lock()
        self.request_count = 0
        self.error_count = 0
        self.memory_data = []
        
    def update_resources(self, levels: Dict[str, int]):
        """Update resource levels and determine if app should be running"""
        with self._lock:
            self.resource_levels = levels
            total_intensity = sum(levels.values())
            self.is_running = total_intensity > 0
            
        # Start/stop CPU thread based on both processing level AND is_running state
        with self._cpu_thread_lock:
            if (self.resource_levels.get('processing', 0) > 0 and 
                self.is_running and 
                not self._cpu_thread):
                self._start_cpu_thread()
            elif ((self.resource_levels.get('processing', 0) == 0 or 
                   not self.is_running) and 
                  self._cpu_thread):
                self._stop_cpu_thread()
    
    def set_running(self, running: bool):
        """Explicitly set the running state (for system toggle)"""
        with self._lock:
            self.is_running = running
            
        # Start/stop CPU thread based on both processing level AND is_running state
        with self._cpu_thread_lock:
            if (self.resource_levels.get('processing', 0) > 0 and 
                self.is_running and 
                not self._cpu_thread):
                self._start_cpu_thread()
            elif ((self.resource_levels.get('processing', 0) == 0 or 
                   not self.is_running) and 
                  self._cpu_thread):
                self._stop_cpu_thread()
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get hybrid metrics - real-time simulation + Upsun background"""
        current_time = time.time()
        
        # Refresh Upsun metrics every 120 seconds (less frequent)
        if current_time - self._last_upsun_check > 120:
            self._refresh_upsun_metrics()
            self._last_upsun_check = current_time
            
        # Refresh instance count every 60 seconds (less frequent)
        if current_time - self._last_instance_check > 60:
            self._refresh_instance_count()
            self._last_instance_check = current_time
            
        # Get real-time simulation metrics
        sim_metrics = self._get_simulation_metrics()
        
        # Blend with Upsun metrics if available
        if self._last_upsun_metrics:
            return self._blend_metrics(sim_metrics, self._last_upsun_metrics)
        
        return sim_metrics
    
    def _get_simulation_metrics(self) -> Dict[str, Any]:
        """Get real-time simulation metrics based on current levels"""
        if not self.is_running:
            return {
                'cpu_percent': 0,
                'memory_percent': 0,
                'memory_used_mb': 0,
                'instance_count': self._instance_count,
                'is_running': False,
                'source': 'simulation'
            }
        
        # Check if we're on Upsun - if so, try to get real container metrics
        if os.getenv("PLATFORM_APPLICATION_NAME") and PSUTIL_AVAILABLE:
            try:
                # Get real container metrics
                cpu_percent = psutil.cpu_percent(interval=0.1)
                memory = psutil.virtual_memory()
                memory_percent = memory.percent
                memory_used_mb = memory.used // (1024 * 1024)
                
                return {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory_percent,
                    'memory_used_mb': memory_used_mb,
                    'instance_count': self._instance_count,
                    'is_running': True,
                    'source': 'container_metrics'
                }
            except Exception as e:
                print(f"[{self.app_name}] Error getting container metrics: {e}")
                # Fall back to simulation if container metrics fail
                pass
            
        # Fallback to simulation for local dev or if container metrics fail
        processing_level = self.resource_levels.get('processing', 0)
        storage_level = self.resource_levels.get('storage', 0)
        
        # Add some dynamism to make it look alive (reduced intensity for demo)
        cpu_variation = random.uniform(0.95, 1.05)  # Less variation
        memory_variation = random.uniform(0.98, 1.02)  # Even less variation
        
        return {
            'cpu_percent': min(processing_level * 1.3 * cpu_variation, 100),  # 50 = 65% CPU, 75 = 97% CPU, 100 = 100% CPU
            'memory_percent': min(storage_level * 1.0 * memory_variation, 100),  # 50 = 50% RAM, 75 = 75% RAM, 100 = 100% RAM
            'memory_used_mb': int(storage_level * 3.52 * memory_variation),  # 50 = 176MB, 75 = 264MB, 100 = 352MB
            'instance_count': self._instance_count,
            'is_running': True,
            'source': 'simulation'
        }
    
    def _blend_metrics(self, sim_metrics: Dict, upsun_metrics: Dict) -> Dict[str, Any]:
        """Blend simulation metrics with Upsun metrics"""
        # Use Upsun for instance count and base values
        # Use simulation for real-time responsiveness
        return {
            'cpu_percent': sim_metrics['cpu_percent'],
            'memory_percent': sim_metrics['memory_percent'],
            'memory_used_mb': sim_metrics['memory_used_mb'],
            'instance_count': upsun_metrics.get('instance_count', sim_metrics['instance_count']),
            'is_running': sim_metrics['is_running'],
            'source': 'hybrid',
            'upsun_cpu': upsun_metrics.get('cpu_percent', 0),
            'upsun_memory': upsun_metrics.get('memory_percent', 0),
            'last_upsun_update': upsun_metrics.get('timestamp', 'unknown')
        }
    
    def _refresh_upsun_metrics(self):
        """Get real metrics from Upsun platform"""
        if not os.getenv("PLATFORM_APPLICATION_NAME"):
            return
            
        try:
            # Get API Gateway URL from PLATFORM_RELATIONSHIPS
            import base64
            import json
            relationships_data = os.getenv("PLATFORM_RELATIONSHIPS")
            if relationships_data:
                relationships = json.loads(base64.b64decode(relationships_data).decode('utf-8'))
                # Find the API Gateway service URL
                api_gateway_url = None
                for service_name, service_data in relationships.items():
                    if 'api-gateway' in service_name or service_name == 'api_gateway':
                        if isinstance(service_data, list) and len(service_data) > 0:
                            api_gateway_url = f"http://{service_data[0]['host']}"
                            break
                
                if api_gateway_url:
                    response = requests.get(f"{api_gateway_url}/upsun-metrics/{self.app_name}", timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        self._last_upsun_metrics = {
                            'cpu_percent': data.get('cpu_percent', 0),
                            'memory_percent': data.get('memory_percent', 0),
                            'memory_used_mb': data.get('memory_used_mb', 0),
                            'instance_count': data.get('instance_count', 'unknown'),
                            'timestamp': time.time()
                        }
                        print(f"[{self.app_name}] Updated Upsun metrics: {self._last_upsun_metrics}")
        except Exception as e:
            print(f"[{self.app_name}] Error getting Upsun metrics: {e}")
    
    def _refresh_instance_count(self):
        """Get instance count from Upsun resources API"""
        if not os.getenv("PLATFORM_APPLICATION_NAME"):
            self._instance_count = 1
            return
            
        try:
            # Get API Gateway URL from PLATFORM_RELATIONSHIPS
            import base64
            import json
            relationships_data = os.getenv("PLATFORM_RELATIONSHIPS")
            if relationships_data:
                relationships = json.loads(base64.b64decode(relationships_data).decode('utf-8'))
                # Find the API Gateway service URL
                api_gateway_url = None
                for service_name, service_data in relationships.items():
                    if 'api-gateway' in service_name or service_name == 'api_gateway':
                        if isinstance(service_data, list) and len(service_data) > 0:
                            api_gateway_url = f"http://{service_data[0]['host']}"
                            break
                
                if api_gateway_url and REQUESTS_AVAILABLE:
                    response = requests.get(f"{api_gateway_url}/upsun-instances/{self.app_name}", timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        self._instance_count = data.get('instances', 'unknown')
                        print(f"[{self.app_name}] Updated instance count: {self._instance_count}")
        except Exception as e:
            print(f"[{self.app_name}] Error getting instance count: {e}")
    
    def _start_cpu_thread(self):
        """Start CPU-intensive thread for realistic simulation"""
        def cpu_worker():
            while self._cpu_thread and self.resource_levels.get('processing', 0) > 0:
                # Realistic CPU work for demo - medium load
                sum(range(50000))  # Moderate work for demo purposes
                time.sleep(0.01)  # Short sleep for continuous load
        
        self._cpu_thread = threading.Thread(target=cpu_worker, daemon=True)
        self._cpu_thread.start()
        print(f"[{self.app_name}] Started CPU thread")
    
    def _stop_cpu_thread(self):
        """Stop CPU thread"""
        if self._cpu_thread:
            self._cpu_thread = None
            print(f"[{self.app_name}] Stopped CPU thread")
    
    def get_health(self):
        """Get service health status"""
        try:
            metrics = self.get_metrics()
            return {
                "status": "healthy",
                "app_name": self.app_name,
                "uptime": time.time(),
                "metrics": metrics
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "app_name": self.app_name,
                "error": str(e)
            }

# Backward compatibility
ResourceManager = UpsunMetricsManager