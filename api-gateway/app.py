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

# Global state for resource levels - per app (default to medium/50)
resource_levels = {
    "user_management": {"processing": 50, "storage": 50},
    "payment_processing": {"processing": 50, "storage": 50},
    "inventory_system": {"processing": 50, "storage": 50},
    "notification_center": {"processing": 50, "storage": 50},
}

# Global system state - initialize by checking microservices
async def get_initial_system_state():
    """Check if microservices are running to determine initial system state"""
    running_count = 0
    total_count = len(SERVICES)
    
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(f"{service_url}/system")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("is_running", False):
                        running_count += 1
        except:
            pass  # Service is not running
    
    # System is considered running if majority of services are running
    return running_count > total_count // 2

# Initialize system state
system_running = False  # Will be updated on first request

@app.get("/")
async def root():
    return {"message": "API Gateway is working!", "services": list(SERVICES.keys())}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "api-gateway"}

@app.get("/apps")
async def get_apps():
    """Get all business applications and their status"""
    apps = {}
    
    # Get status from each microservice
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/health")
                if response.status_code == 200:
                    health_data = response.json()
                    apps[service_name] = {
                        "name": service_name.replace("_", " ").title(),
                        "status": health_data.get("status", "unknown"),
                        "levels": resource_levels.get(service_name, {"processing": 50, "storage": 50}),
                        "has_controls": True
                    }
                else:
                    apps[service_name] = {
                        "name": service_name.replace("_", " ").title(),
                        "status": "unhealthy",
                        "levels": resource_levels.get(service_name, {"processing": 50, "storage": 50}),
                        "has_controls": True
                    }
        except Exception as e:
            apps[service_name] = {
                "name": service_name.replace("_", " ").title(),
                "status": "unhealthy",
                "levels": resource_levels.get(service_name, {"processing": 50, "storage": 50}),
                "has_controls": True
            }
    
    # Add API Gateway and Dashboard to the apps list
    apps["api_gateway"] = {
        "name": "API Gateway",
        "status": "healthy",
        "levels": {"processing": 0, "storage": 0},
        "has_controls": False
    }
    
    apps["dashboard"] = {
        "name": "Dashboard", 
        "status": "healthy",
        "levels": {"processing": 0, "storage": 0},
        "has_controls": False
    }
    
    return apps

@app.post("/resources")
async def update_resources(request_data: Dict[str, Any]):
    """Update resource levels for a specific app"""
    app_name = request_data.get("app_name")
    levels = request_data.get("levels", {})
    
    if not app_name or app_name not in resource_levels:
        raise HTTPException(status_code=400, detail="Invalid app name")
    
    # Update local state
    resource_levels[app_name] = levels
    
    # Forward to the specific microservice
    service_url = SERVICES.get(app_name)
    if service_url:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Send resource update to microservice (microservices expect direct level values)
                response = await client.post(f"{service_url}/resources", json=levels)
                if response.status_code != 200:
                    print(f"Warning: Failed to update resources for {app_name}: {response.status_code}")
        except Exception as e:
            print(f"Error updating resources for {app_name}: {e}")
    
    return {"message": f"Resources updated for {app_name}", "levels": levels}

@app.post("/resources/all")
async def update_all_resources(request_data: Dict[str, Any]):
    """Update resource levels for all apps"""
    levels = request_data.get("levels", {})
    
    # Update all apps with the same levels
    for app_name in resource_levels.keys():
        resource_levels[app_name] = levels.copy()
        
        # Forward to each microservice
        service_url = SERVICES.get(app_name)
        if service_url:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.post(f"{service_url}/resources", json=levels)
                    if response.status_code != 200:
                        print(f"Warning: Failed to update resources for {app_name}: {response.status_code}")
            except Exception as e:
                print(f"Error updating resources for {app_name}: {e}")
    
    return {"message": "Resources updated for all apps", "levels": levels}

@app.post("/apps/{app_name}/reset")
async def reset_app(app_name: str):
    """Reset specific app resources to normal levels"""
    if app_name not in resource_levels:
        raise HTTPException(status_code=400, detail="Invalid app name")
    
    # Reset to normal levels (50%)
    normal_levels = {"processing": 50, "storage": 50}
    resource_levels[app_name] = normal_levels
    
    # Forward to microservice
    service_url = SERVICES.get(app_name)
    if service_url:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(f"{service_url}/resources", json=normal_levels)
                if response.status_code != 200:
                    print(f"Warning: Failed to reset resources for {app_name}: {response.status_code}")
        except Exception as e:
            print(f"Error resetting resources for {app_name}: {e}")
    
    return {"message": f"Resources reset for {app_name}", "levels": normal_levels}

@app.post("/system/toggle")
async def toggle_system(request_data: Dict[str, Any]):
    """Toggle system running state for all apps"""
    global system_running
    is_running = request_data.get("is_running", not system_running)
    system_running = is_running
    
    # Forward to all microservices
    for app_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(f"{service_url}/system/running", json={
                    "is_running": is_running
                })
                if response.status_code != 200:
                    print(f"Warning: Failed to update system state for {app_name}: {response.status_code}")
        except Exception as e:
            print(f"Error updating system state for {app_name}: {e}")
    
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
                else:
                    # Fallback metrics if service is down
                    metrics[service_name] = {
                        "app_name": service_name,
                        "cpu_percent": 0,
                        "memory_percent": 0,
                        "memory_used_mb": 0,
                        "memory_total_mb": 352,
                        "current_levels": resource_levels.get(service_name, {"processing": 0, "storage": 0}),
                        "request_count": 0,
                        "error_count": 1,
                        "is_running": False,
                        "instance_count": "unknown",
                        "source": "fallback"
                    }
        except Exception as e:
            # Fallback metrics if service is unreachable
            metrics[service_name] = {
                "app_name": service_name,
                "cpu_percent": 0,
                "memory_percent": 0,
                "memory_used_mb": 0,
                "memory_total_mb": 352,
                "current_levels": resource_levels.get(service_name, {"processing": 0, "storage": 0}),
                "request_count": 0,
                "error_count": 1,
                "is_running": False,
                "instance_count": "unknown",
                "source": "error"
            }
    
    # Add mock metrics for API Gateway
    metrics["api_gateway"] = {
        "app_name": "api_gateway",
        "cpu_percent": 15.0,  # Low CPU usage for API Gateway
        "memory_percent": 25.0,  # Moderate memory usage
        "memory_used_mb": 88,  # 25% of 352MB
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
        "cpu_percent": 5.0,  # Very low CPU usage for frontend
        "memory_percent": 40.0,  # Higher memory usage for React app
        "memory_used_mb": 141,  # 40% of 352MB
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
    global system_running
    
    # Initialize system state if not set yet
    if not system_running:
        system_running = await get_initial_system_state()
    
    system_info = {
        "system_running": system_running,
        "services": {}
    }
    
    # Get system info from each microservice
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/system")
                if response.status_code == 200:
                    data = response.json()
                    system_info["services"][service_name] = {
                        "app_name": service_name,
                        "status": "healthy" if data.get("is_running", False) else "unhealthy",
                        "is_running": data.get("is_running", False)
                    }
                else:
                    system_info["services"][service_name] = {
                        "app_name": service_name,
                        "status": "unhealthy",
                        "is_running": False
                    }
        except Exception as e:
            system_info["services"][service_name] = {
                "app_name": service_name,
                "status": "unreachable",
                "is_running": False,
                "error": str(e)
            }
    
    return system_info

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)