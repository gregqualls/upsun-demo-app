from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time
import os
from typing import Dict, Any, List
import psutil

app = FastAPI(title="Memory Worker Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
current_memory_level = 0
memory_data = []  # List to hold memory-intensive data structures
is_running = False

def create_memory_load(level: int):
    """Create memory load based on the level"""
    global memory_data
    
    if level == 0:
        memory_data.clear()
        return
    
    # Calculate memory usage based on level (0-100)
    # Target: 0% = 0MB, 100% = 500MB
    target_mb = int((level / 100) * 500)
    
    # Clear existing data
    memory_data.clear()
    
    # Create data structures to consume memory
    # Each list element is about 1KB, so we need target_mb * 1024 elements
    elements_needed = target_mb * 1024
    
    # Create lists of strings to consume memory
    chunk_size = 10000  # Process in chunks to avoid blocking
    for i in range(0, elements_needed, chunk_size):
        chunk = [f"memory_data_{i+j}_{'x'*100}" for j in range(min(chunk_size, elements_needed - i))]
        memory_data.extend(chunk)
        
        # Small delay to prevent blocking
        if i % (chunk_size * 10) == 0:
            time.sleep(0.001)

async def memory_worker():
    """Background worker that manages memory load"""
    global is_running
    
    while True:
        if current_memory_level > 0 and is_running:
            # Update memory load
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, create_memory_load, current_memory_level)
            await asyncio.sleep(5)  # Update every 5 seconds
        else:
            await asyncio.sleep(1)

@app.get("/")
async def root():
    return {"message": "Memory Worker Service", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Upsun"""
    return {"status": "healthy", "service": "memory-worker"}

@app.get("/metrics")
async def get_metrics():
    """Get memory metrics"""
    memory_info = psutil.virtual_memory()
    process = psutil.Process()
    process_memory = process.memory_info()
    
    return {
        "memory_percent": memory_info.percent,
        "memory_used_mb": memory_info.used / (1024 * 1024),
        "memory_total_mb": memory_info.total / (1024 * 1024),
        "process_memory_mb": process_memory.rss / (1024 * 1024),
        "data_structures_count": len(memory_data),
        "current_level": current_memory_level,
        "is_running": is_running
    }

@app.post("/resources")
async def update_resources(resources: Dict[str, int]):
    """Update resource levels"""
    global current_memory_level, is_running
    
    if "memory" in resources:
        new_level = resources["memory"]
        current_memory_level = new_level
        is_running = new_level > 0
        
        # Update memory load immediately
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, create_memory_load, new_level)
    
    return {"message": "Memory resources updated", "memory_level": current_memory_level}

@app.get("/resources")
async def get_resources():
    """Get current resource levels"""
    return {"memory": current_memory_level}

if __name__ == "__main__":
    import uvicorn
    # Use port 8000 for Upsun deployment, 8002 for local development
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
