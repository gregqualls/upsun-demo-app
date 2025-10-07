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
            "storage": resource_data.get("storage", 0)
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

@app.post("/enhanced/cpu")
async def set_cpu_load(request_data: Dict[str, Any]):
    """Set CPU load using enhanced PID regulator approach"""
    try:
        if resource_manager.enhanced_microservice is None:
            raise HTTPException(status_code=503, detail="Enhanced load generation not available")
            
        target_percentage = request_data.get("target_percentage", 0)
        if not 0 <= target_percentage <= 100:
            raise HTTPException(status_code=400, detail="Target percentage must be between 0 and 100")
        
        result = await resource_manager.enhanced_microservice.set_cpu_load(target_percentage)
        
        return {
            "status": "success",
            "app_name": APP_NAME,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhanced/memory")
async def set_memory_load(request_data: Dict[str, Any]):
    """Set memory load using enhanced direct allocation approach"""
    try:
        if resource_manager.enhanced_microservice is None:
            raise HTTPException(status_code=503, detail="Enhanced load generation not available")
            
        target_mb = request_data.get("target_mb", 0)
        if target_mb < 0:
            raise HTTPException(status_code=400, detail="Target memory must be non-negative")
        
        result = await resource_manager.enhanced_microservice.set_memory_load(target_mb)
        
        return {
            "status": "success",
            "app_name": APP_NAME,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/enhanced/load")
async def get_enhanced_load():
    """Get current enhanced load generation status"""
    try:
        if resource_manager.enhanced_microservice is None:
            raise HTTPException(status_code=503, detail="Enhanced load generation not available")
            
        load_status = await resource_manager.enhanced_microservice.get_current_load()
        
        return {
            "status": "success",
            "app_name": APP_NAME,
            "load_status": load_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/enhanced/history")
async def get_load_history(limit: int = 10):
    """Get enhanced load generation history"""
    try:
        if resource_manager.enhanced_microservice is None:
            raise HTTPException(status_code=503, detail="Enhanced load generation not available")
            
        history = resource_manager.enhanced_microservice.get_load_history(limit)
        
        return {
            "status": "success",
            "app_name": APP_NAME,
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhanced/toggle")
async def toggle_enhanced_load(request_data: Dict[str, Any]):
    """Toggle between enhanced and legacy load generation"""
    try:
        enabled = request_data.get("enabled", True)
        resource_manager.set_enhanced_load(enabled)
        
        return {
            "status": "success",
            "app_name": APP_NAME,
            "enhanced_load_enabled": enabled,
            "message": f"Enhanced load generation {'enabled' if enabled else 'disabled'}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhanced/stop")
async def stop_all_load():
    """Stop all load generation"""
    try:
        resource_manager.stop_all_load()
        
        return {
            "status": "success",
            "app_name": APP_NAME,
            "message": "All load generation stopped"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=APP_PORT)
