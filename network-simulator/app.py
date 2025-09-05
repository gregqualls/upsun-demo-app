from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import httpx
import time
import os
from typing import Dict, Any
import random

app = FastAPI(title="Network Simulator Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
current_network_level = 0
is_running = False
request_count = 0
error_count = 0

# Service URLs for inter-service communication
SERVICES = {
    "api_gateway": os.getenv("API_GATEWAY_URL", "http://localhost:8000"),
    "cpu_worker": os.getenv("CPU_WORKER_URL", "http://localhost:8001"),
    "memory_worker": os.getenv("MEMORY_WORKER_URL", "http://localhost:8002"),
}

async def make_service_request(service_name: str, service_url: str):
    """Make a request to a service"""
    global request_count, error_count
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Randomly choose between different endpoints
            endpoints = ["/", "/health", "/metrics", "/resources"]
            endpoint = random.choice(endpoints)
            
            response = await client.get(f"{service_url}{endpoint}")
            request_count += 1
            
            if response.status_code >= 400:
                error_count += 1
                
            return {
                "service": service_name,
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds()
            }
    except Exception as e:
        error_count += 1
        return {
            "service": service_name,
            "error": str(e),
            "status_code": 0
        }

async def network_worker():
    """Background worker that makes network requests"""
    global is_running
    
    while True:
        if current_network_level > 0 and is_running:
            # Calculate request frequency based on level (0-100)
            # 0% = 0 requests/sec, 100% = 10 requests/sec
            requests_per_second = (current_network_level / 100) * 10
            
            if requests_per_second > 0:
                # Calculate delay between requests
                delay = 1.0 / requests_per_second
                
                # Make requests to random services
                service_name = random.choice(list(SERVICES.keys()))
                service_url = SERVICES[service_name]
                
                await make_service_request(service_name, service_url)
                await asyncio.sleep(delay)
            else:
                await asyncio.sleep(1)
        else:
            await asyncio.sleep(1)

@app.get("/")
async def root():
    return {"message": "Network Simulator Service", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Upsun"""
    return {"status": "healthy", "service": "network-simulator"}

@app.get("/metrics")
async def get_metrics():
    """Get network metrics"""
    return {
        "request_count": request_count,
        "error_count": error_count,
        "success_rate": ((request_count - error_count) / max(request_count, 1)) * 100,
        "current_level": current_network_level,
        "is_running": is_running,
        "target_requests_per_second": (current_network_level / 100) * 10
    }

@app.post("/resources")
async def update_resources(resources: Dict[str, int]):
    """Update resource levels"""
    global current_network_level, is_running
    
    if "network" in resources:
        new_level = resources["network"]
        current_network_level = new_level
        is_running = new_level > 0
        
        # Start worker if not already running
        if is_running:
            asyncio.create_task(network_worker())
    
    return {"message": "Network resources updated", "network_level": current_network_level}

@app.get("/resources")
async def get_resources():
    """Get current resource levels"""
    return {"network": current_network_level}

@app.post("/reset-metrics")
async def reset_metrics():
    """Reset request and error counters"""
    global request_count, error_count
    request_count = 0
    error_count = 0
    return {"message": "Metrics reset"}

if __name__ == "__main__":
    import uvicorn
    # Use port 8000 for Upsun deployment, 8003 for local development
    port = int(os.getenv("PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)
