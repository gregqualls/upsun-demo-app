from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time
import multiprocessing
import os
from typing import Dict, Any
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

def cpu_intensive_task(level: int):
    """CPU-intensive task that scales with the level"""
    if level == 0:
        return
    
    # Calculate iterations based on level (0-100)
    iterations = int((level / 100) * 1000000)
    
    # Perform CPU-intensive calculations
    result = 0
    for i in range(iterations):
        result += i ** 2
        if i % 100000 == 0:  # Check for cancellation every 100k iterations
            if not is_running:
                break
    
    return result

async def cpu_worker():
    """Background worker that runs CPU-intensive tasks"""
    global is_running
    
    while True:
        if current_cpu_level > 0 and is_running:
            # Run CPU task in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, cpu_intensive_task, current_cpu_level)
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
    """Get CPU metrics"""
    cpu_percent = psutil.cpu_percent(interval=1)
    memory_info = psutil.virtual_memory()
    
    return {
        "cpu_percent": cpu_percent,
        "memory_percent": memory_info.percent,
        "memory_used_mb": memory_info.used / (1024 * 1024),
        "memory_total_mb": memory_info.total / (1024 * 1024),
        "current_level": current_cpu_level,
        "is_running": is_running
    }

@app.post("/resources")
async def update_resources(resources: Dict[str, int]):
    """Update resource levels"""
    global current_cpu_level, is_running
    
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
    
    return {"message": "CPU resources updated", "cpu_level": current_cpu_level}

@app.get("/resources")
async def get_resources():
    """Get current resource levels"""
    return {"cpu": current_cpu_level}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
