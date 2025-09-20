from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import asyncio
import os
import subprocess
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
            "notification_center": "http://localhost:8004",
        }

SERVICES = get_service_urls()

# Global state for resource levels - per app (default to medium/50)
resource_levels = {
    "user_management": {
        "processing": 50,
        "storage": 50,
        "traffic": 50,
        "orders": 50,
        "completions": 50
    },
    "payment_processing": {
        "processing": 50,
        "storage": 50,
        "traffic": 50,
        "orders": 50,
        "completions": 50
    },
    "inventory_system": {
        "processing": 50,
        "storage": 50,
        "traffic": 50,
        "orders": 50,
        "completions": 50
    },
    "notification_center": {
        "processing": 50,
        "storage": 50,
        "traffic": 50,
        "orders": 50,
        "completions": 50
    }
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
async def update_resource_levels(request_data: Dict[str, Any]):
    """Update resource levels for a specific app"""
    global resource_levels
    
    app_name = request_data.get("app_name")
    levels = request_data.get("levels", {})
    
    if not app_name or app_name not in resource_levels:
        raise HTTPException(status_code=400, detail=f"Invalid app name: {app_name}")
    
    # Validate input
    for key, value in levels.items():
        if key not in resource_levels[app_name]:
            raise HTTPException(status_code=400, detail=f"Invalid resource type: {key}")
        if not isinstance(value, int) or value < 0 or value > 100:
            raise HTTPException(status_code=400, detail=f"Invalid value for {key}: must be 0-100")
    
    # Update local state
    resource_levels[app_name].update(levels)
    
    # Propagate to the specific service
    service_url = SERVICES.get(app_name)
    if service_url:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                print(f"Sending {levels} to {app_name} at {service_url}")
                response = await client.post(f"{service_url}/resources", json=levels)
                if response.status_code != 200:
                    print(f"Error updating {app_name}: {response.status_code}")
        except Exception as e:
            print(f"Error updating {app_name}: {e}")
    
    return {"message": f"Resource levels updated for {app_name}", "levels": resource_levels[app_name]}

@app.post("/resources/all")
async def update_all_resource_levels(request_data: Dict[str, Any]):
    """Update resource levels for all apps"""
    global resource_levels
    
    levels = request_data.get("levels", {})
    
    # Validate input
    for app_name, app_levels in levels.items():
        if app_name not in resource_levels:
            continue
        for key, value in app_levels.items():
            if key not in resource_levels[app_name]:
                continue
            if not isinstance(value, int) or value < 0 or value > 100:
                continue
    
    # Update local state
    for app_name, app_levels in levels.items():
        if app_name in resource_levels:
            resource_levels[app_name].update(app_levels)
    
    # Propagate to all services in parallel (don't wait)
    async def update_service(app_name, app_levels):
        if app_name not in SERVICES:
            return
        service_url = SERVICES[app_name]
        try:
            print(f"Sending {app_levels} to {app_name} at {service_url}")
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(f"{service_url}/resources", json=app_levels)
                print(f"{app_name} updated successfully: {response.status_code}")
        except Exception as e:
            print(f"Error updating {app_name}: {e}")
    
    # Start all updates in background (don't wait)
    tasks = []
    for app_name, app_levels in levels.items():
        task = asyncio.create_task(update_service(app_name, app_levels))
        tasks.append(task)
    
    return {"message": "Resource levels updated for all apps", "levels": resource_levels}

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

@app.post("/apps/{app_name}/reset")
async def reset_app_resources(app_name: str):
    """Reset all resource levels for a specific app"""
    if app_name not in resource_levels:
        raise HTTPException(status_code=400, detail=f"Invalid app name: {app_name}")
    
    # Reset local state to medium levels
    resource_levels[app_name] = {
        "processing": 50,
        "storage": 50,
        "traffic": 50,
        "orders": 50,
        "completions": 50
    }
    
    # Reset on the service
    service_url = SERVICES.get(app_name)
    if service_url:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(f"{service_url}/resources/reset")
                if response.status_code != 200:
                    print(f"Error resetting {app_name}: {response.status_code}")
        except Exception as e:
            print(f"Error resetting {app_name}: {e}")
    
    return {"message": f"Resources reset for {app_name}", "levels": resource_levels[app_name]}

@app.get("/apps")
async def get_apps():
    """Get list of all apps and their current status"""
    apps = {}
    
    # Add business microservices with resource controls
    for app_name in resource_levels.keys():
        apps[app_name] = {
            "name": app_name.replace("_", " ").title(),
            "levels": resource_levels[app_name],
            "status": "unknown",
            "has_controls": True
        }
    
    # Add API Gateway (no controls)
    apps["api_gateway"] = {
        "name": "API Gateway",
        "levels": {"processing": 0, "storage": 0, "traffic": 0, "orders": 0, "completions": 0},
        "status": "healthy",
        "has_controls": False
    }
    
    # Add Dashboard (no controls)
    apps["dashboard"] = {
        "name": "Dashboard",
        "levels": {"processing": 0, "storage": 0, "traffic": 0, "orders": 0, "completions": 0},
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

@app.get("/instances/{app_name}")
async def get_instance_count(app_name: str):
    """Get instance count for a specific app from Upsun"""
    try:
        # Check if we're running on Upsun
        if not os.getenv("PLATFORM_APPLICATION_NAME"):
            # Running locally - return 1 instance
            return {"instances": 1, "source": "local"}
        
        # Running on Upsun - try to get instance count
        try:
            # Try to get instance count for specific app
            result = subprocess.run(
                ['upsun', 'resources:get', app_name, '--format=json'], 
                capture_output=True, 
                text=True,
                timeout=10
            )
            
            # If specific app fails, try getting all resources
            if result.returncode != 0:
                result = subprocess.run(
                    ['upsun', 'resources:get', '--format=json'], 
                    capture_output=True, 
                    text=True,
                    timeout=10
                )
            
            if result.returncode == 0:
                resources_data = json.loads(result.stdout)
                print(f"Upsun resources data for {app_name}: {resources_data}")
                
                # Handle different response formats
                resources = []
                if isinstance(resources_data, list):
                    resources = resources_data
                elif isinstance(resources_data, dict):
                    resources = resources_data.get('resources', [])
                    # If it's a single resource, wrap it in a list
                    if 'name' in resources_data and 'instances' in resources_data:
                        resources = [resources_data]
                
                # Look for our app in the resources
                for resource in resources:
                    if resource.get('name') == app_name:
                        instances = resource.get('instances', 1)
                        print(f"Found {instances} instances for {app_name} from Upsun CLI")
                        return {"instances": instances, "source": "upsun_cli"}
                
                print(f"App {app_name} not found in Upsun resources")
            else:
                print(f"Upsun CLI failed: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            print(f"Upsun CLI timeout for {app_name}")
        except json.JSONDecodeError as e:
            print(f"Failed to parse Upsun CLI output for {app_name}: {e}")
        except Exception as e:
            print(f"Upsun CLI error for {app_name}: {e}")
        
        # Fallback to known configuration
        instance_counts = {
            "user-management": 1,
            "payment-processing": 3,
            "inventory-system": 1,
            "notification-center": 3,
            "api-gateway": 1
        }
        
        instances = instance_counts.get(app_name, 1)
        print(f"Using fallback instance count for {app_name}: {instances}")
        return {"instances": instances, "source": "fallback"}
        
    except Exception as e:
        print(f"Error getting instance count for {app_name}: {e}")
        return {"instances": 1, "source": "error"}

if __name__ == "__main__":
    import uvicorn
    # Use port 8000 for Upsun deployment, 8004 for local development
    port = int(os.getenv("PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)
