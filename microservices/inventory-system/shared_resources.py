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
            return
            
        # Calculate iterations based on level (0-100)
        iterations = int((level / 100) * 1000000)
        
        # CPU-intensive calculations
        result = 0
        for i in range(iterations):
            result += math.sqrt(i * math.pi) * math.sin(i)
        
        return result
    
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
        self.current_levels.update(levels)
        
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
        if not self.is_running:
            # When not running, show minimal/zero usage
            return {
                "app_name": self.app_name,
                "cpu_percent": 0.0,
                "memory_percent": 0.0,
                "memory_used_mb": 0,
                "memory_total_mb": 0,
                "current_levels": self.current_levels,
                "request_count": self.request_count,
                "error_count": self.error_count,
                "is_running": self.is_running,
                "instance_count": 1
            }
        
        # When running, show actual resource consumption
        memory_info = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=0.1)  # Shorter interval for responsiveness
        
        # Calculate app-specific resource usage based on current levels
        # This is a simplified calculation - in reality you'd track actual consumption
        app_cpu_usage = (cpu_percent * sum(self.current_levels.values()) / 500) if sum(self.current_levels.values()) > 0 else 0
        app_memory_usage = (memory_info.percent * sum(self.current_levels.values()) / 500) if sum(self.current_levels.values()) > 0 else 0
        
        return {
            "app_name": self.app_name,
            "cpu_percent": min(app_cpu_usage, 100.0),  # Cap at 100%
            "memory_percent": min(app_memory_usage, 100.0),  # Cap at 100%
            "memory_used_mb": int((memory_info.total - memory_info.available) * app_memory_usage / 100),
            "memory_total_mb": memory_info.total // (1024 * 1024),
            "current_levels": self.current_levels,
            "request_count": self.request_count,
            "error_count": self.error_count,
            "is_running": self.is_running,
            "instance_count": 1
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
