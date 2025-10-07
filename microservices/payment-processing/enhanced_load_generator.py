"""
Enhanced Load Generation System
Implements CPULoadGenerator-based PID regulator and direct memory allocation
for precise, professional-grade load generation.
"""

import psutil
import time
import threading
import asyncio
from typing import Optional, Dict, Any, List
from dataclasses import dataclass


@dataclass
class LoadMetrics:
    """Metrics for load generation accuracy"""
    target_cpu_percent: float
    actual_cpu_percent: float
    target_memory_mb: int
    actual_memory_mb: int
    accuracy_cpu: float
    accuracy_memory: float
    timestamp: float


class CPULoadGenerator:
    """
    CPU Load Generator using PID regulator approach
    Based on CPULoadGenerator principles for precise CPU control
    """
    
    def __init__(self):
        self.running = False
        self.target_load = 0.0
        self.thread: Optional[threading.Thread] = None
        self.pid_params = {
            'kp': 0.1,  # Proportional gain
            'ki': 0.01, # Integral gain  
            'kd': 0.05  # Derivative gain
        }
        self.integral_error = 0.0
        self.last_error = 0.0
        self.last_time = time.time()
        
    def generate_load(self, target_percentage: float, duration: int = 0):
        """
        Generate precise CPU load using PID regulator approach
        
        Args:
            target_percentage: Target CPU percentage (0-100)
            duration: Duration in seconds (0 = indefinite)
        """
        self.target_load = target_percentage
        self.running = True
        
        # Reset PID controller
        self.integral_error = 0.0
        self.last_error = 0.0
        self.last_time = time.time()
        
        if duration > 0:
            # Run for specific duration
            self.thread = threading.Thread(
                target=self._run_with_duration, 
                args=(duration,),
                daemon=True
            )
        else:
            # Run indefinitely until stopped
            self.thread = threading.Thread(
                target=self._run_indefinitely,
                daemon=True
            )
            
        self.thread.start()
    
    def _run_with_duration(self, duration: int):
        """Run CPU load generation for specific duration"""
        end_time = time.time() + duration
        while self.running and time.time() < end_time:
            self._pid_regulate_cpu()
    
    def _run_indefinitely(self):
        """Run CPU load generation indefinitely"""
        while self.running:
            self._pid_regulate_cpu()
    
    def _pid_regulate_cpu(self):
        """
        PID regulator to maintain precise CPU load
        Adjusts work/sleep ratio based on current vs target load
        """
        current_time = time.time()
        dt = current_time - self.last_time
        
        if dt <= 0:
            dt = 0.1  # Prevent division by zero
            
        # Get current CPU load
        current_load = psutil.cpu_percent(interval=0.1)
        
        # Calculate error
        error = self.target_load - current_load
        
        # PID calculation
        # Proportional term
        p_term = self.pid_params['kp'] * error
        
        # Integral term
        self.integral_error += error * dt
        i_term = self.pid_params['ki'] * self.integral_error
        
        # Derivative term
        derivative_error = (error - self.last_error) / dt
        d_term = self.pid_params['kd'] * derivative_error
        
        # PID output
        pid_output = p_term + i_term + d_term
        
        # Convert PID output to work/sleep ratio
        # PID output range: approximately -50 to +50
        # Work time range: 0.001 to 0.1 seconds
        work_time = max(0.001, min(0.1, 0.05 + pid_output * 0.001))
        sleep_time = max(0.001, 0.1 - work_time)
        
        # Generate load
        start_time = time.time()
        while time.time() - start_time < work_time:
            pass  # Busy wait
        
        time.sleep(sleep_time)
        
        # Update for next iteration
        self.last_error = error
        self.last_time = current_time
    
    def stop(self):
        """Stop CPU load generation"""
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)
    
    def get_current_load(self) -> float:
        """Get current CPU load percentage"""
        return psutil.cpu_percent(interval=0.1)


class MemoryAllocator:
    """
    Memory Allocator using direct memory allocation
    Much simpler and more efficient than file I/O approach
    """
    
    def __init__(self):
        self.allocated_blocks: List[bytearray] = []
        self.total_allocated_mb = 0
        
    def allocate_memory(self, size_mb: int) -> int:
        """
        Allocate specific amount of memory using direct allocation
        
        Args:
            size_mb: Memory size in megabytes
            
        Returns:
            Block ID for tracking
        """
        if size_mb <= 0:
            return -1
            
        size_bytes = size_mb * 1024 * 1024
        memory_block = bytearray(size_bytes)
        
        # Initialize with some data to ensure allocation
        for i in range(0, size_bytes, 1024):
            memory_block[i:i+4] = b'DATA'
            
        self.allocated_blocks.append(memory_block)
        self.total_allocated_mb += size_mb
        
        return len(self.allocated_blocks) - 1  # Return block ID
    
    def deallocate_memory(self, block_id: int) -> bool:
        """
        Free allocated memory by block ID
        
        Args:
            block_id: Block ID returned from allocate_memory
            
        Returns:
            True if successful, False if block_id invalid
        """
        if 0 <= block_id < len(self.allocated_blocks):
            # Calculate size before deletion
            block_size_mb = len(self.allocated_blocks[block_id]) // (1024 * 1024)
            
            # Remove the block
            del self.allocated_blocks[block_id]
            self.total_allocated_mb -= block_size_mb
            
            return True
        return False
    
    def deallocate_all(self):
        """Free all allocated memory"""
        self.allocated_blocks.clear()
        self.total_allocated_mb = 0
    
    def get_total_allocated(self) -> int:
        """Get total allocated memory in MB"""
        return self.total_allocated_mb
    
    def get_memory_usage_mb(self) -> int:
        """Get actual memory usage in MB"""
        process = psutil.Process()
        memory_info = process.memory_info()
        return memory_info.rss // (1024 * 1024)


class EnhancedMicroservice:
    """
    Enhanced Microservice with precise load generation capabilities
    Combines CPULoadGenerator and MemoryAllocator for professional-grade control
    """
    
    def __init__(self, app_name: str):
        self.app_name = app_name
        self.cpu_generator = CPULoadGenerator()
        self.memory_allocator = MemoryAllocator()
        self.current_cpu_load = 0.0
        self.current_memory_mb = 0
        self.load_history: List[LoadMetrics] = []
        
    async def set_cpu_load(self, target_percentage: float) -> Dict[str, Any]:
        """
        Set CPU load using PID regulator approach
        
        Args:
            target_percentage: Target CPU percentage (0-100)
            
        Returns:
            Dictionary with load generation results
        """
        # Stop current load generation
        self.cpu_generator.stop()
        
        # Start new load generation
        self.cpu_generator.generate_load(target_percentage)
        self.current_cpu_load = target_percentage
        
        # Wait a moment for load to stabilize
        await asyncio.sleep(1.0)
        
        # Get actual load
        actual_load = self.cpu_generator.get_current_load()
        accuracy = (actual_load / target_percentage * 100) if target_percentage > 0 else 100
        
        # Record metrics
        metrics = LoadMetrics(
            target_cpu_percent=target_percentage,
            actual_cpu_percent=actual_load,
            target_memory_mb=self.current_memory_mb,
            actual_memory_mb=self.memory_allocator.get_memory_usage_mb(),
            accuracy_cpu=accuracy,
            accuracy_memory=100.0,  # Will be updated by memory allocation
            timestamp=time.time()
        )
        self.load_history.append(metrics)
        
        return {
            "status": "success",
            "target_cpu_percent": target_percentage,
            "actual_cpu_percent": actual_load,
            "accuracy_percent": accuracy,
            "app_name": self.app_name
        }
        
    async def set_memory_load(self, target_mb: int) -> Dict[str, Any]:
        """
        Set memory load using direct allocation
        
        Args:
            target_mb: Target memory usage in MB
            
        Returns:
            Dictionary with memory allocation results
        """
        # Free current memory
        self.memory_allocator.deallocate_all()
        
        # Allocate new memory if target > 0
        if target_mb > 0:
            block_id = self.memory_allocator.allocate_memory(target_mb)
            if block_id == -1:
                return {
                    "status": "error",
                    "message": "Failed to allocate memory",
                    "app_name": self.app_name
                }
        
        self.current_memory_mb = target_mb
        
        # Wait a moment for memory allocation to stabilize
        await asyncio.sleep(0.5)
        
        # Get actual memory usage
        actual_mb = self.memory_allocator.get_memory_usage_mb()
        accuracy = (actual_mb / target_mb * 100) if target_mb > 0 else 100
        
        # Update latest metrics
        if self.load_history:
            latest = self.load_history[-1]
            latest.target_memory_mb = target_mb
            latest.actual_memory_mb = actual_mb
            latest.accuracy_memory = accuracy
        
        return {
            "status": "success",
            "target_memory_mb": target_mb,
            "actual_memory_mb": actual_mb,
            "allocated_mb": self.memory_allocator.get_total_allocated(),
            "accuracy_percent": accuracy,
            "app_name": self.app_name
        }
        
    async def get_current_load(self) -> Dict[str, Any]:
        """Get current load status"""
        actual_cpu = self.cpu_generator.get_current_load()
        actual_memory = self.memory_allocator.get_memory_usage_mb()
        
        cpu_accuracy = (actual_cpu / self.current_cpu_load * 100) if self.current_cpu_load > 0 else 100
        memory_accuracy = (actual_memory / self.current_memory_mb * 100) if self.current_memory_mb > 0 else 100
        
        return {
            "app_name": self.app_name,
            "cpu": {
                "target_percent": self.current_cpu_load,
                "actual_percent": actual_cpu,
                "accuracy_percent": cpu_accuracy
            },
            "memory": {
                "target_mb": self.current_memory_mb,
                "actual_mb": actual_memory,
                "allocated_mb": self.memory_allocator.get_total_allocated(),
                "accuracy_percent": memory_accuracy
            },
            "load_history_count": len(self.load_history)
        }
    
    def get_load_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent load generation history"""
        recent_history = self.load_history[-limit:] if self.load_history else []
        
        return [
            {
                "timestamp": metrics.timestamp,
                "target_cpu_percent": metrics.target_cpu_percent,
                "actual_cpu_percent": metrics.actual_cpu_percent,
                "target_memory_mb": metrics.target_memory_mb,
                "actual_memory_mb": metrics.actual_memory_mb,
                "accuracy_cpu": metrics.accuracy_cpu,
                "accuracy_memory": metrics.accuracy_memory
            }
            for metrics in recent_history
        ]
    
    def stop_all_load(self):
        """Stop all load generation"""
        self.cpu_generator.stop()
        self.memory_allocator.deallocate_all()
        self.current_cpu_load = 0.0
        self.current_memory_mb = 0
    
    def cleanup(self):
        """Cleanup resources"""
        self.stop_all_load()
        self.load_history.clear()
