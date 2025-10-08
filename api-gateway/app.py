from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from typing import Dict, Any

app = FastAPI(title="Upsun Demo API Gateway", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs - Use Upsun relationship environment variables
def get_service_urls():
    """Get service URLs based on environment (Upsun vs local)"""
    if os.getenv("PLATFORM_APPLICATION_NAME"):  # Running on Upsun
        return {
            "user_management": os.getenv("PLATFORM_RELATIONSHIPS_USER_MANAGEMENT_0_URL", "http://user-management.internal"),
            "payment_processing": os.getenv("PLATFORM_RELATIONSHIPS_PAYMENT_PROCESSING_0_URL", "http://payment-processing.internal"),
            "inventory_system": os.getenv("PLATFORM_RELATIONSHIPS_INVENTORY_SYSTEM_0_URL", "http://inventory-system.internal"),
            "notification_center": os.getenv("PLATFORM_RELATIONSHIPS_NOTIFICATION_CENTER_0_URL", "http://notification-center.internal"),
        }
    else:  # Local development
        return {
            "user_management": "http://localhost:8001",
            "payment_processing": "http://localhost:8002", 
            "inventory_system": "http://localhost:8003",
            "notification_center": "http://localhost:8005",
        }

SERVICES = get_service_urls()

# Global state for resource levels
resource_levels = {
    "user_management": {"processing": 50, "storage": 50},
    "payment_processing": {"processing": 50, "storage": 50},
    "inventory_system": {"processing": 50, "storage": 50},
    "notification_center": {"processing": 50, "storage": 50}
}

@app.get("/")
async def root():
    return {"message": "Upsun Demo API Gateway", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-gateway"}

@app.get("/services/status")
async def get_services_status():
    """Get status of all services"""
    status = {}
    
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/health")
                status[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "url": service_url,
                    "response_code": response.status_code
                }
        except Exception as e:
            status[service_name] = {
                "status": "unhealthy",
                "error": str(e),
                "url": service_url
            }
    
    return status

@app.get("/resources")
async def get_resource_levels():
    return resource_levels

@app.post("/resources")
async def update_resource_levels(request_data: Dict[str, Any]):
    """Update resource levels for a specific app"""
    global resource_levels
    
    app_name = request_data.get("app_name")
    levels = request_data.get("levels", {})
    
    if not app_name or app_name not in resource_levels:
        raise HTTPException(status_code=400, detail=f"Invalid app name: {app_name}")
    
    # Update local state
    resource_levels[app_name].update(levels)
    
    # Propagate to the specific service
    service_url = SERVICES.get(app_name)
    if service_url:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(f"{service_url}/resources", json=levels)
        except Exception as e:
            print(f"Error updating {app_name}: {e}")
    
    return {"message": f"Resource levels updated for {app_name}", "levels": resource_levels[app_name]}

@app.post("/system/toggle")
async def toggle_system(request_data: Dict[str, Any]):
    """Toggle system on/off for all apps"""
    is_running = request_data.get("is_running", False)
    
    # Propagate to all services
    for app_name in SERVICES.keys():
        service_url = SERVICES[app_name]
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(f"{service_url}/system/running", json={"is_running": is_running})
        except Exception as e:
            print(f"Error updating {app_name} running state: {e}")
    
    return {"message": f"System {'started' if is_running else 'stopped'} for all apps", "is_running": is_running}

@app.get("/metrics")
async def get_metrics():
    """Get aggregated metrics from all services"""
    metrics = {}
    
    # Get metrics from business microservices
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/metrics")
                if response.status_code == 200:
                    metrics[service_name] = response.json()
        except Exception as e:
            metrics[service_name] = {"error": str(e)}
    
    # Add mock metrics for API Gateway
    metrics["api_gateway"] = {
        "app_name": "api_gateway",
        "cpu_percent": 15.0,
        "memory_percent": 25.0,
        "memory_used_mb": 88,
        "memory_total_mb": 352,
        "current_levels": {"processing": 0, "storage": 0},
        "request_count": 0,
        "error_count": 0,
        "is_running": True,
        "instance_count": 1,
        "source": "simulation"
    }
    
    # Add mock metrics for Dashboard
    metrics["dashboard"] = {
        "app_name": "dashboard",
        "cpu_percent": 5.0,
        "memory_percent": 40.0,
        "memory_used_mb": 141,
        "memory_total_mb": 352,
        "current_levels": {"processing": 0, "storage": 0},
        "request_count": 0,
        "error_count": 0,
        "is_running": True,
        "instance_count": 1,
        "source": "simulation"
    }
    
    return metrics

@app.get("/system")
async def get_system_info():
    """Get system information from all services"""
    system_info = {}
    
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/system")
                if response.status_code == 200:
                    system_info[service_name] = response.json()
        except Exception as e:
            system_info[service_name] = {"error": str(e)}
    
    return system_info

@app.get("/apps")
async def get_apps():
    """Get list of all apps and their current status"""
    apps = {}
    
    # Add business microservices
    for app_name in resource_levels.keys():
        apps[app_name] = {
            "name": app_name.replace("_", " ").title(),
            "levels": resource_levels[app_name],
            "status": "unknown",
            "has_controls": True
        }
    
    # Add API Gateway and Dashboard
    apps["api_gateway"] = {
        "name": "API Gateway",
        "levels": {"processing": 0, "storage": 0},
        "status": "healthy",
        "has_controls": False
    }
    
    apps["dashboard"] = {
        "name": "Dashboard",
        "levels": {"processing": 0, "storage": 0},
        "status": "healthy",
        "has_controls": False
    }
    
    # Get status from services
    for app_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/health")
                if response.status_code == 200:
                    apps[app_name]["status"] = "healthy"
                else:
                    apps[app_name]["status"] = "unhealthy"
        except Exception as e:
            apps[app_name]["status"] = "unhealthy"
    
    return apps

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)
