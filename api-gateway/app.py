from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import asyncio
import os
from typing import Dict, Any
import json

app = FastAPI(title="Upsun Demo API Gateway", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs - Use Upsun relationship environment variables
def get_service_urls():
    """Get service URLs based on environment (Upsun vs local)"""
    if os.getenv("PLATFORM_APPLICATION_NAME"):  # Running on Upsun
        # Use Upsun relationship environment variables
        return {
            "cpu_worker": os.getenv("PLATFORM_RELATIONSHIPS_CPU_WORKER_0_URL", "http://cpu-worker.internal"),
            "memory_worker": os.getenv("PLATFORM_RELATIONSHIPS_MEMORY_WORKER_0_URL", "http://memory-worker.internal"),
            "network_simulator": os.getenv("PLATFORM_RELATIONSHIPS_NETWORK_SIMULATOR_0_URL", "http://network-simulator.internal"),
        }
    else:  # Local development
        return {
            "cpu_worker": "http://localhost:8001",
            "memory_worker": "http://localhost:8002", 
            "network_simulator": "http://localhost:8003",
        }

SERVICES = get_service_urls()

# Global state for resource levels
resource_levels = {
    "cpu": 0,
    "memory": 0,
    "network": 0
}

@app.get("/")
async def root():
    return {"message": "Upsun Demo API Gateway", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Upsun"""
    return {"status": "healthy", "service": "api-gateway"}

@app.get("/services/status")
async def get_services_status():
    """Get status of all services"""
    status = {}
    
    # Debug: Print environment variables and service URLs
    print(f"Platform Application Name: {os.getenv('PLATFORM_APPLICATION_NAME')}")
    print(f"Service URLs: {SERVICES}")
    
    for service_name, service_url in SERVICES.items():
        try:
            print(f"Checking {service_name} at {service_url}")
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/health")
                status[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "url": service_url,
                    "response_code": response.status_code
                }
                print(f"{service_name} responded with status {response.status_code}")
        except Exception as e:
            print(f"Error connecting to {service_name}: {e}")
            status[service_name] = {
                "status": "unhealthy",
                "error": str(e),
                "url": service_url
            }
    
    return status

@app.get("/resources")
async def get_resource_levels():
    """Get current resource levels"""
    return resource_levels

@app.post("/resources")
async def update_resource_levels(levels: Dict[str, int]):
    """Update resource levels for all services"""
    global resource_levels
    
    # Validate input
    for key, value in levels.items():
        if key not in resource_levels:
            raise HTTPException(status_code=400, detail=f"Invalid resource type: {key}")
        if not isinstance(value, int) or value < 0 or value > 100:
            raise HTTPException(status_code=400, detail=f"Invalid value for {key}: must be 0-100")
    
    # Update local state
    resource_levels.update(levels)
    
    # Propagate to services
    async with httpx.AsyncClient(timeout=10.0) as client:
        tasks = []
        for service_name, service_url in SERVICES.items():
            # Send only relevant resource type to each service
            service_resources = {}
            if service_name == "cpu_worker" and "cpu" in levels:
                service_resources["cpu"] = levels["cpu"]
            elif service_name == "memory_worker" and "memory" in levels:
                service_resources["memory"] = levels["memory"]
            elif service_name == "network_simulator" and "network" in levels:
                service_resources["network"] = levels["network"]
            
            if service_resources:
                try:
                    print(f"Sending {service_resources} to {service_name} at {service_url}")
                    task = client.post(f"{service_url}/resources", json=service_resources)
                    tasks.append(task)
                except Exception as e:
                    print(f"Error updating {service_name}: {e}")
        
        # Wait for all updates to complete
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    print(f"Task {i} failed: {result}")
                else:
                    print(f"Task {i} completed successfully")
    
    return {"message": "Resource levels updated", "levels": resource_levels}

@app.get("/metrics")
async def get_metrics():
    """Get aggregated metrics from all services"""
    metrics = {}
    
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/metrics")
                if response.status_code == 200:
                    metrics[service_name] = response.json()
        except Exception as e:
            metrics[service_name] = {"error": str(e)}
    
    return metrics

if __name__ == "__main__":
    import uvicorn
    # Use port 8000 for Upsun deployment, 8004 for local development
    port = int(os.getenv("PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)
