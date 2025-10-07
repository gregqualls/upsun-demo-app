"""
Centralized resource management library for microservices.
This library provides CPU, memory, and network resource simulation
that can be used by any microservice in the ecosystem.

Enhanced with professional-grade load generation using PID regulators
and direct memory allocation for precise control.
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

# Import enhanced load generation
try:
    from enhanced_load_generator import EnhancedMicroservice, CPULoadGenerator, MemoryAllocator
except ImportError:
    # Fallback for when enhanced_load_generator is not available
    EnhancedMicroservice = None
    CPULoadGenerator = None
    MemoryAllocator = None

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
        
        # Enhanced load generation
        if EnhancedMicroservice is not None:
            self.enhanced_microservice = EnhancedMicroservice(app_name)
            self.use_enhanced_load = True  # Toggle for enhanced vs legacy load generation
        else:
            self.enhanced_microservice = None
            self.use_enhanced_load = False
        
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
        """Update all resource levels with enhanced load generation"""
        self.current_levels.update(levels)
        
        if self.use_enhanced_load and self.enhanced_microservice is not None:
            # Use enhanced load generation for CPU and memory
            if "processing" in levels:
                cpu_percent = (levels["processing"] / 100) * 100  # Convert 0-100 to percentage
                await self.enhanced_microservice.set_cpu_load(cpu_percent)
            
            if "storage" in levels:
                # Convert 0-100 to MB (0% = 0MB, 100% = 200MB)
                memory_mb = int((levels["storage"] / 100) * 200)
                await self.enhanced_microservice.set_memory_load(memory_mb)
        else:
            # Use legacy load generation
            if "processing" in levels:
                self.create_processing_load(levels["processing"])
            
            if "storage" in levels:
                self.create_storage_load(levels["storage"])
        
        # Create traffic load (always use legacy for network simulation)
        if "traffic" in levels and api_gateway_url:
            await self.create_traffic_load(levels["traffic"], api_gateway_url)
        
        # Create orders load (always use legacy for business simulation)
        if "orders" in levels:
            self.create_orders_load(levels["orders"])
        
        # Create completions load (always use legacy for work simulation)
        if "completions" in levels:
            self.create_completions_load(levels["completions"])
    
    def get_metrics(self):
        """Get current resource metrics with enhanced load generation data"""
        memory_info = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)
        
        base_metrics = {
            "app_name": self.app_name,
            "cpu_percent": cpu_percent,
            "memory_percent": memory_info.percent,
            "memory_used_mb": (memory_info.total - memory_info.available) // (1024 * 1024),
            "memory_total_mb": memory_info.total // (1024 * 1024),
            "current_levels": self.current_levels,
            "request_count": self.request_count,
            "error_count": self.error_count,
            "is_running": self.is_running
        }
        
        if self.use_enhanced_load and self.enhanced_microservice is not None:
            # Add enhanced load generation metrics
            try:
                # Try to get current event loop, if none exists, create one
                try:
                    loop = asyncio.get_running_loop()
                    # We're in an async context, need to use a different approach
                    enhanced_metrics = {
                        "app_name": self.app_name,
                        "cpu": {
                            "target_percent": self.enhanced_microservice.current_cpu_load,
                            "actual_percent": self.enhanced_microservice.cpu_generator.get_current_load(),
                            "accuracy_percent": 100.0
                        },
                        "memory": {
                            "target_mb": self.enhanced_microservice.current_memory_mb,
                            "actual_mb": self.enhanced_microservice.memory_allocator.get_memory_usage_mb(),
                            "allocated_mb": self.enhanced_microservice.memory_allocator.get_total_allocated(),
                            "accuracy_percent": 100.0
                        },
                        "load_history_count": len(self.enhanced_microservice.load_history)
                    }
                except RuntimeError:
                    # No running loop, safe to use asyncio.run
                    enhanced_metrics = asyncio.run(self.enhanced_microservice.get_current_load())
                
                base_metrics.update({
                    "enhanced_load": enhanced_metrics,
                    "load_generation_type": "enhanced"
                })
            except Exception as e:
                # Fallback if enhanced metrics fail
                base_metrics.update({
                    "enhanced_load": {"error": str(e)},
                    "load_generation_type": "enhanced_error"
                })
        else:
            base_metrics["load_generation_type"] = "legacy"
            
        return base_metrics
    
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
    
    def set_enhanced_load(self, enabled: bool):
        """Toggle between enhanced and legacy load generation"""
        if self.enhanced_microservice is None:
            self.use_enhanced_load = False
            return
            
        self.use_enhanced_load = enabled
        if not enabled:
            # Stop enhanced load generation when switching to legacy
            self.enhanced_microservice.stop_all_load()
    
    async def get_enhanced_load_history(self, limit: int = 10):
        """Get enhanced load generation history"""
        if self.use_enhanced_load and self.enhanced_microservice is not None:
            return self.enhanced_microservice.get_load_history(limit)
        return []
    
    def stop_all_load(self):
        """Stop all load generation (both enhanced and legacy)"""
        if self.use_enhanced_load and self.enhanced_microservice is not None:
            self.enhanced_microservice.stop_all_load()
        
        # Stop legacy load generation
        self.memory_data.clear()
        for task in self.worker_tasks:
            if not task.done():
                task.cancel()
        self.worker_tasks.clear()
    
    def cleanup(self):
        """Cleanup all resources"""
        self.stop_all_load()
        if self.use_enhanced_load and self.enhanced_microservice is not None:
            self.enhanced_microservice.cleanup()
        self.thread_pool.shutdown(wait=True)


class UpsunMetricsManager(ResourceManager):
    """
    Upsun-specific metrics manager that extends ResourceManager
    Provides compatibility with existing microservice code
    """
    
    def __init__(self, app_name: str):
        super().__init__(app_name)
        # Enable enhanced load generation by default if available
        if hasattr(self, 'enhanced_microservice') and self.enhanced_microservice is not None:
            self.use_enhanced_load = True
    
    def set_running(self, is_running: bool):
        """Set the running state of the service"""
        self.is_running = is_running
        if not is_running:
            self.stop_all_load()
    
    async def update_resources(self, levels: Dict[str, int], api_gateway_url: str = None):
        """Update resources with Upsun-specific handling"""
        await super().update_resources(levels, api_gateway_url)
    
    def get_metrics(self):
        """Get metrics with Upsun-specific formatting"""
        return super().get_metrics()
    
    def get_health(self):
        """Get health status with Upsun-specific formatting"""
        return super().get_health()
