"""
Microservice template for business applications.
This template gets customized during the build process based on the app name.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from typing import Dict, Any
import uvicorn

# Import the shared resource manager
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from shared_resources import UpsunMetricsManager

# App name will be set via environment variable
APP_NAME = os.getenv("PLATFORM_APPLICATION_NAME", "microservice")
APP_PORT = int(os.getenv("PORT", 8000))

app = FastAPI(title=f"{APP_NAME} Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize resource manager
resource_manager = UpsunMetricsManager(APP_NAME)

# Get API Gateway URL for traffic simulation
def get_api_gateway_url():
    """Get API Gateway URL based on environment"""
    if os.getenv("PLATFORM_APPLICATION_NAME"):  # Running on Upsun
        return os.getenv("PLATFORM_RELATIONSHIPS_API_GATEWAY_0_URL", "http://api-gateway.internal")
    else:  # Local development
        return "http://localhost:8004"

@app.get("/")
async def root():
    return {
        "message": f"{APP_NAME} Service", 
        "status": "running",
        "app_name": APP_NAME
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return resource_manager.get_health()

@app.get("/metrics")
async def metrics():
    """Get resource metrics"""
    return resource_manager.get_metrics()

@app.get("/system")
async def system_info():
    """Get system information"""
    return resource_manager.get_metrics()

@app.post("/system/running")
async def set_running_state(request_data: Dict[str, Any]):
    """Set the running state of the service"""
    is_running = request_data.get("is_running", False)
    resource_manager.set_running(is_running)
    return {"message": f"Service running state set to {is_running}", "is_running": is_running}

@app.post("/resources")
async def update_resources(resource_data: Dict[str, Any]):
    """Update resource levels for this service"""
    try:
        levels = {
            "processing": resource_data.get("processing", 0),
            "storage": resource_data.get("storage", 0),
            "traffic": resource_data.get("traffic", 0),
            "orders": resource_data.get("orders", 0),
            "completions": resource_data.get("completions", 0)
        }
        
        print(f"[{APP_NAME}] Calling resource_manager.update_resources with levels: {levels}")
        resource_manager.update_resources(levels)
        print(f"[{APP_NAME}] resource_manager.update_resources completed")
        
        return {
            "status": "success",
            "app_name": APP_NAME,
            "levels": levels
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resources/reset")
async def reset_resources():
    """Reset all resource levels to zero"""
    try:
        levels = {
            "processing": 0,
            "storage": 0,
            "traffic": 0,
            "orders": 0,
            "completions": 0
        }
        
        await resource_manager.update_resources(levels)
        
        return {
            "status": "success",
            "app_name": APP_NAME,
            "message": "Resources reset"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=APP_PORT)
