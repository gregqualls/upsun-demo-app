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
import psutil
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional
import httpx

class ResourceManager:
    """Centralized resource management for microservices"""
    
    def __init__(self, app_name: str):
        self.app_name = app_name
        self.current_levels = {
            "processing": 0,    # CPU-intensive tasks
            "storage": 0,       # Memory-intensive tasks  
            "traffic": 0,       # Network-intensive tasks
            "orders": 0,        # Business process simulation
            "completions": 0    # Work completion simulation
        }
        self.is_running = False
        self.worker_tasks = []
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
        self.memory_data = []
        self.request_count = 0
        self.error_count = 0
        self._lock = threading.Lock()
        self.instance_count = self._get_instance_count()
        self._last_instance_check = time.time()
        self._last_running_change = time.time()
        self._running_stability_threshold = 5  # seconds
        
    def _get_instance_count(self):
        """Get the actual number of instances for this app"""
        try:
            # In Upsun, check for PLATFORM_APPLICATION_NAME
            app_name = os.getenv("PLATFORM_APPLICATION_NAME")
            if app_name:
                print(f"[{app_name}] Detecting instance count on Upsun...")
                
                # Method 1: Try to get from Upsun environment variables
                # Check various possible environment variable names
                possible_env_vars = [
                    "PLATFORM_INSTANCE_COUNT",
                    "PLATFORM_APP_INSTANCES", 
                    "PLATFORM_CONTAINER_COUNT",
                    "PLATFORM_SCALE_COUNT",
                    "PLATFORM_REPLICAS"
                ]
                
                for env_var in possible_env_vars:
                    instance_count_env = os.getenv(env_var)
                    if instance_count_env:
                        print(f"[{app_name}] Found instance count in {env_var}: {instance_count_env}")
                        return int(instance_count_env)
                
                # Method 2: Try to detect from process count
                try:
                    import subprocess
                    result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
                    if result.returncode == 0:
                        lines = result.stdout.split('\n')
                        # Look for processes with our app name and python
                        app_processes = [line for line in lines if app_name in line and 'python' in line]
                        if len(app_processes) > 0:
                            print(f"[{app_name}] Detected {len(app_processes)} processes")
                            return len(app_processes)
                except Exception as e:
                    print(f"[{app_name}] Process counting failed: {e}")
                
                # Method 3: Query API Gateway for instance count (synchronous)
                try:
                    import requests
                    
                    # Get API Gateway URL from environment or use default
                    api_gateway_url = os.getenv("PLATFORM_RELATIONSHIPS_API_GATEWAY_URL", "http://api-gateway:8000")
                    
                    # Query the API Gateway for instance count synchronously
                    try:
                        response = requests.get(f"{api_gateway_url}/instances/{app_name}", timeout=3.0)
                        if response.status_code == 200:
                            data = response.json()
                            instances = data.get("instances", 1)
                            print(f"[{app_name}] Got instance count from API Gateway: {instances}")
                            return instances
                        else:
                            print(f"[{app_name}] API Gateway returned status {response.status_code}")
                    except requests.exceptions.Timeout:
                        print(f"[{app_name}] API Gateway query timeout")
                    except Exception as e:
                        print(f"[{app_name}] API Gateway query failed: {e}")
                    
                except Exception as e:
                    print(f"[{app_name}] API Gateway query error: {e}")
                
                # Method 4: Use known configuration as fallback
                instance_counts = {
                    "user-management": 1,
                    "payment-processing": 3,  # From your Upsun config
                    "inventory-system": 1,
                    "notification-center": 3,  # From your Upsun config
                    "api-gateway": 1
                }
                
                fallback_count = instance_counts.get(app_name, 1)
                print(f"[{app_name}] Using fallback instance count: {fallback_count}")
                return fallback_count
            else:
                # Running locally - always 1 instance
                print(f"[{self.app_name}] Running locally - 1 instance")
                return 1
        except Exception as e:
            print(f"Error getting instance count: {e}")
            return 1
    
    def _refresh_instance_count(self):
        """Refresh instance count if enough time has passed"""
        current_time = time.time()
        # Check every 60 seconds for instance count changes (less frequent to reduce instability)
        if current_time - self._last_instance_check > 60:
            try:
                new_count = self._get_instance_count()
                if new_count != self.instance_count:
                    print(f"[{self.app_name}] Instance count changed from {self.instance_count} to {new_count}")
                    self.instance_count = new_count
                self._last_instance_check = current_time
            except Exception as e:
                print(f"[{self.app_name}] Error refreshing instance count: {e}")
                # Don't update _last_instance_check on error to retry sooner
        
    def get_system_info(self):
        """Get system resource information"""
        cpu_count = psutil.cpu_count()
        memory_info = psutil.virtual_memory()
        
        return {
            "cpu_count": cpu_count,
            "memory_total": memory_info.total,
            "memory_available": memory_info.available,
            "memory_percent": memory_info.percent,
            "app_name": self.app_name
        }
    
    def create_processing_load(self, level: int):
        """Create CPU-intensive processing load"""
        if level == 0:
            # Stop any existing CPU simulation
            if hasattr(self, 'cpu_thread') and self.cpu_thread and self.cpu_thread.is_alive():
                self.cpu_thread = None
            return
            
        # Calculate iterations based on level (0-100)
        iterations = int((level / 100) * 1000000)
        
        # Start CPU simulation in background thread
        def cpu_worker():
            while True:
                result = 0
                for i in range(iterations):
                    result += math.sqrt(i * math.pi) * math.sin(i)
                    # Add a small delay to prevent overwhelming the system
                    if i % 10000 == 0:
                        time.sleep(0.001)
                time.sleep(0.1)  # Brief pause between cycles
        
        # Stop existing thread if running
        if hasattr(self, 'cpu_thread') and self.cpu_thread and self.cpu_thread.is_alive():
            self.cpu_thread = None
        
        # Start new thread
        self.cpu_thread = threading.Thread(target=cpu_worker, daemon=True)
        self.cpu_thread.start()
    
    def create_storage_load(self, level: int):
        """Create memory-intensive storage load"""
        if level == 0:
            self.memory_data.clear()
            return
            
        # Calculate memory usage based on level (0-100)
        # Target: 0% = 0MB, 100% = 200MB per app
        target_mb = int((level / 100) * 200)
        
        # Clear existing data
        self.memory_data.clear()
        
        # Create data structures to consume memory
        elements_needed = target_mb * 1024  # 1KB per element
        
        # Create lists of strings to consume memory
        chunk_size = 10000
        for i in range(0, elements_needed, chunk_size):
            chunk = [f"storage_data_{self.app_name}_{i+j}_{'x'*100}" 
                    for j in range(min(chunk_size, elements_needed - i))]
            self.memory_data.extend(chunk)
            
            # Small delay to prevent blocking
            if i % (chunk_size * 10) == 0:
                time.sleep(0.001)
    
    async def create_traffic_load(self, level: int, api_gateway_url: str):
        """Create network-intensive traffic load"""
        if level == 0:
            return
            
        # Calculate request frequency based on level
        requests_per_second = int((level / 100) * 10)  # Max 10 requests/second
        
        if requests_per_second == 0:
            return
            
        # Make requests to API gateway
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                endpoints = ["/", "/health", "/metrics"]
                endpoint = random.choice(endpoints)
                
                response = await client.get(f"{api_gateway_url}{endpoint}")
                self.request_count += 1
                
                if response.status_code >= 400:
                    self.error_count += 1
                    
        except Exception as e:
            self.error_count += 1
    
    def create_orders_load(self, level: int):
        """Create business process simulation (orders processing)"""
        if level == 0:
            return
            
        # Simulate order processing workload
        orders_to_process = int((level / 100) * 1000)
        
        # Simulate order processing logic
        for i in range(orders_to_process):
            # Simulate order validation
            order_id = f"ORD-{self.app_name}-{i}"
            order_data = {
                "id": order_id,
                "items": random.randint(1, 10),
                "total": random.uniform(10.0, 1000.0),
                "status": "processing"
            }
            
            # Simulate some processing time
            if i % 100 == 0:
                time.sleep(0.001)
    
    def create_completions_load(self, level: int):
        """Create work completion simulation"""
        if level == 0:
            return
            
        # Simulate work completion tracking
        completions = int((level / 100) * 500)
        
        for i in range(completions):
            completion = {
                "id": f"COMP-{self.app_name}-{i}",
                "timestamp": time.time(),
                "status": "completed",
                "duration": random.uniform(0.1, 5.0)
            }
            
            # Simulate some processing
            if i % 50 == 0:
                time.sleep(0.001)
    
    async def update_resources(self, levels: Dict[str, int], api_gateway_url: str = None):
        """Update all resource levels"""
        import time
        timestamp = time.time()
        print(f"[{timestamp}] [{self.app_name}] update_resources called with levels: {levels}")
        
        # Use lock to prevent race conditions
        with self._lock:
            self.current_levels.update(levels)
            
            # Determine if app should be running based on any non-zero levels
            total_intensity = sum(self.current_levels.values())
            new_running_state = total_intensity > 0
            
            # Add stability check to prevent rapid state changes
            current_time = time.time()
            time_since_last_change = current_time - self._last_running_change
            
            if new_running_state != self.is_running:
                if time_since_last_change >= self._running_stability_threshold:
                    print(f"[{timestamp}] [{self.app_name}] State change: {self.is_running} -> {new_running_state} (total_intensity: {total_intensity})")
                    self.is_running = new_running_state
                    self._last_running_change = current_time
                else:
                    print(f"[{timestamp}] [{self.app_name}] State change blocked (too soon): {self.is_running} -> {new_running_state} (time_since_last_change: {time_since_last_change:.1f}s)")
            else:
                print(f"[{timestamp}] [{self.app_name}] total_intensity: {total_intensity}, is_running: {self.is_running} (stable)")
        
        # Create processing load
        if "processing" in levels:
            self.create_processing_load(levels["processing"])
        
        # Create storage load  
        if "storage" in levels:
            self.create_storage_load(levels["storage"])
        
        # Create traffic load
        if "traffic" in levels and api_gateway_url:
            await self.create_traffic_load(levels["traffic"], api_gateway_url)
        
        # Create orders load
        if "orders" in levels:
            self.create_orders_load(levels["orders"])
        
        # Create completions load
        if "completions" in levels:
            self.create_completions_load(levels["completions"])
    
    def get_metrics(self):
        """Get current resource metrics"""
        # Refresh instance count periodically
        self._refresh_instance_count()
        
        with self._lock:
            is_running = self.is_running
            current_levels = self.current_levels.copy()
        
        if not is_running:
            # When not running, show minimal/zero usage
            return {
                "app_name": self.app_name,
                "cpu_percent": 0.0,
                "memory_percent": 0.0,
                "memory_used_mb": 0,
                "memory_total_mb": 0,
                "current_levels": current_levels,
                "request_count": self.request_count,
                "error_count": self.error_count,
                "is_running": is_running,
                "instance_count": self.instance_count
            }
        
        # When running, show actual resource consumption
        # In production (Upsun), this will read actual container metrics
        # Locally, this reads host system resources (which is expected)
        memory_info = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=0.1)
        
        # Calculate app-specific resource usage based on current levels
        total_intensity = sum(current_levels.values())
        if total_intensity > 0:
            # Scale system resources based on app intensity
            app_cpu_usage = (cpu_percent * total_intensity / 500)
            app_memory_usage = (memory_info.percent * total_intensity / 500)
        else:
            app_cpu_usage = 0
            app_memory_usage = 0
        
        return {
            "app_name": self.app_name,
            "cpu_percent": min(app_cpu_usage, 100.0),  # Cap at 100%
            "memory_percent": min(app_memory_usage, 100.0),  # Cap at 100%
            "memory_used_mb": int((memory_info.total - memory_info.available) * app_memory_usage / 100),
            "memory_total_mb": memory_info.total // (1024 * 1024),
            "current_levels": current_levels,
            "request_count": self.request_count,
            "error_count": self.error_count,
            "is_running": is_running,
            "instance_count": self.instance_count
        }
    
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
