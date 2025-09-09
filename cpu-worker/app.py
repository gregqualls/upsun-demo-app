from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time
import multiprocessing
import os
import json
import math
from typing import Dict, Any, Optional
import psutil

app = FastAPI(title="CPU Worker Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
current_cpu_level = 0
worker_tasks = []
is_running = False
stress_mode = False
system_info = {}

def get_system_info():
    """Get system resource information including Upsun limits"""
    global system_info
    
    # Get basic system info
    cpu_count = psutil.cpu_count()
    memory_info = psutil.virtual_memory()
    
    # Try to get Upsun resource limits
    upsun_cpu_limit = None
    upsun_memory_limit = None
    
    # Check for Upsun environment variables - get ACTUAL resource limits
    if os.getenv("PLATFORM_APPLICATION"):
        try:
            app_config = json.loads(os.getenv("PLATFORM_APPLICATION", "{}"))
            # Get actual CPU limit from Upsun resources
            if "resources" in app_config and "default" in app_config["resources"]:
                upsun_cpu_limit = app_config["resources"]["default"].get("cpu", 0.5)
            else:
                # Fallback to container profile if resources not available
                if "build" in app_config and "container_profile" in app_config["build"]:
                    profile = app_config["build"]["container_profile"]
                    if profile == "HIGH_CPU":
                        upsun_cpu_limit = 2.0  # 2 CPU cores
                    elif profile == "MEDIUM_CPU":
                        upsun_cpu_limit = 1.0  # 1 CPU core
                    else:
                        upsun_cpu_limit = 0.5  # 0.5 CPU cores
                else:
                    upsun_cpu_limit = 0.5
        except Exception as e:
            print(f"Error parsing PLATFORM_APPLICATION: {e}")
            upsun_cpu_limit = 0.5
    
    # Fallback to detected CPU count if no Upsun limits
    if upsun_cpu_limit is None:
        upsun_cpu_limit = cpu_count
    
    # Memory limit detection - get ACTUAL memory limits from Upsun
    if os.getenv("PLATFORM_APPLICATION"):
        try:
            app_config = json.loads(os.getenv("PLATFORM_APPLICATION", "{}"))
            # Get actual memory limit from Upsun resources (in MB)
            if "resources" in app_config and "default" in app_config["resources"]:
                upsun_memory_limit = app_config["resources"]["default"].get("memory", 256)
            else:
                # Fallback to container profile if resources not available
                if "build" in app_config and "container_profile" in app_config["build"]:
                    profile = app_config["build"]["container_profile"]
                    if profile == "HIGH_CPU":
                        upsun_memory_limit = 1024  # 1GB
                    elif profile == "MEDIUM_CPU":
                        upsun_memory_limit = 512   # 512MB
                    else:
                        upsun_memory_limit = 256   # 256MB
                else:
                    upsun_memory_limit = 256
        except Exception as e:
            print(f"Error parsing PLATFORM_APPLICATION for memory: {e}")
            upsun_memory_limit = 256
    
    # Fallback to detected memory if no Upsun limits
    if upsun_memory_limit is None:
        upsun_memory_limit = memory_info.total / (1024 * 1024)  # Convert to MB
    
    # Get additional Upsun information
    container_profile = "unknown"
    instance_count = 1
    if os.getenv("PLATFORM_APPLICATION"):
        try:
            app_config = json.loads(os.getenv("PLATFORM_APPLICATION", "{}"))
            container_profile = app_config.get("container_profile", "unknown")
            instance_count = app_config.get("instance_count", 1)
        except:
            pass
    
    system_info = {
        "cpu_count": cpu_count,
        "upsun_cpu_limit": upsun_cpu_limit,
        "memory_total_mb": memory_info.total / (1024 * 1024),
        "upsun_memory_limit_mb": upsun_memory_limit,
        "memory_available_mb": memory_info.available / (1024 * 1024),
        "platform": "upsun" if os.getenv("PLATFORM_APPLICATION") else "local",
        "container_profile": container_profile,
        "instance_count": instance_count,
        "memory_used_mb": memory_info.used / (1024 * 1024),
        "memory_percent": memory_info.percent
    }
    
    return system_info

def cpu_intensive_task(level: int, stress_mode: bool = False):
    """CPU-intensive task that scales realistically with available CPU"""
    if level == 0:
        return
    
    global system_info
    
    # Get current system info
    if not system_info:
        get_system_info()
    
    # Calculate target CPU utilization
    target_cpu_percent = level
    if stress_mode:
        target_cpu_percent = min(level * 1.5, 200)  # "Turn it up to 11" - can exceed 100%
    
    # Get available CPU cores
    available_cores = system_info.get("upsun_cpu_limit", psutil.cpu_count())
    
    # Calculate work duration based on target CPU usage
    # More realistic approach: run for a short burst, then sleep
    work_duration = 0.1  # 100ms of work
    sleep_duration = work_duration * (100 - target_cpu_percent) / target_cpu_percent if target_cpu_percent > 0 else 1.0
    
    # Perform CPU-intensive calculations
    start_time = time.time()
    result = 0
    iteration = 0
    
    while time.time() - start_time < work_duration:
        # More CPU-intensive calculation
        result += math.sqrt(iteration) * math.sin(iteration * 0.01)
        iteration += 1
        
        # Check for cancellation
        if not is_running:
            break
    
    # Sleep to achieve target CPU percentage
    if sleep_duration > 0:
        time.sleep(sleep_duration)
    
    return result

async def cpu_worker():
    """Background worker that runs CPU-intensive tasks"""
    global is_running, stress_mode
    
    while True:
        if current_cpu_level > 0 and is_running:
            # Run CPU task in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, cpu_intensive_task, current_cpu_level, stress_mode)
        else:
            await asyncio.sleep(0.1)  # Small delay when not running

@app.get("/")
async def root():
    return {"message": "CPU Worker Service", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Upsun"""
    return {"status": "healthy", "service": "cpu-worker"}

@app.get("/metrics")
async def get_metrics():
    """Get CPU metrics with system information"""
    # Update system info
    get_system_info()
    
    cpu_percent = psutil.cpu_percent(interval=1)
    memory_info = psutil.virtual_memory()
    
    return {
        "cpu_percent": cpu_percent,
        "memory_percent": memory_info.percent,
        "memory_used_mb": memory_info.used / (1024 * 1024),
        "memory_total_mb": memory_info.total / (1024 * 1024),
        "current_level": current_cpu_level,
        "is_running": is_running,
        "stress_mode": stress_mode,
        "system_info": system_info
    }

@app.get("/system")
async def get_system_info_endpoint():
    """Get detailed system information"""
    get_system_info()
    return system_info

@app.post("/stress")
async def toggle_stress_mode():
    """Toggle stress mode (turn it up to 11)"""
    global stress_mode
    stress_mode = not stress_mode
    return {
        "message": f"Stress mode {'enabled' if stress_mode else 'disabled'}",
        "stress_mode": stress_mode
    }

@app.get("/stress")
async def get_stress_mode():
    """Get current stress mode status"""
    return {"stress_mode": stress_mode}

@app.post("/resources")
async def update_resources(resources: Dict[str, Any]):
    """Update resource levels and stress mode"""
    global current_cpu_level, is_running, stress_mode
    
    if "cpu" in resources:
        new_level = resources["cpu"]
        current_cpu_level = new_level
        is_running = new_level > 0
        
        # Start worker if not already running
        if is_running and not worker_tasks:
            task = asyncio.create_task(cpu_worker())
            worker_tasks.append(task)
        elif not is_running and worker_tasks:
            # Stop worker tasks
            for task in worker_tasks:
                task.cancel()
            worker_tasks.clear()
    
    # Handle stress mode toggle
    if "stress_mode" in resources:
        stress_mode = bool(resources["stress_mode"])
    
    return {
        "message": "CPU resources updated", 
        "cpu_level": current_cpu_level,
        "stress_mode": stress_mode
    }

@app.get("/resources")
async def get_resources():
    """Get current resource levels"""
    return {
        "cpu": current_cpu_level,
        "stress_mode": stress_mode
    }

if __name__ == "__main__":
    import uvicorn
    # Use port 8000 for Upsun deployment, 8001 for local development
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
