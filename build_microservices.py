"""
Build script to generate microservices based on Upsun config.yaml
This script reads the config and creates the necessary microservice directories and files.
"""

import yaml
import os
import shutil
from pathlib import Path

def load_upsun_config():
    """Load the Upsun config.yaml file"""
    config_path = ".upsun/config.yaml"
    with open(config_path, 'r') as file:
        return yaml.safe_load(file)

def get_business_apps(config):
    """Extract business apps from config (exclude frontend and api-gateway)"""
    apps = []
    core_apps = ['frontend', 'api-gateway']
    
    for app_name, app_config in config.get('applications', {}).items():
        if app_name not in core_apps:
            apps.append({
                'name': app_name,
                'config': app_config
            })
    
    return apps

def create_microservice_directory(app_name, port):
    """Create directory structure for a microservice"""
    app_dir = Path(f"microservices/{app_name}")
    app_dir.mkdir(parents=True, exist_ok=True)
    
    # Create requirements.txt
    requirements_content = """fastapi==0.104.1
uvicorn==0.24.0
psutil==5.9.6
httpx==0.25.2
python-multipart==0.0.6
"""
    (app_dir / "requirements.txt").write_text(requirements_content)
    
    # Create app.py from template
    template_path = "microservice_template.py"
    app_py_path = app_dir / "app.py"
    
    with open(template_path, 'r') as template_file:
        template_content = template_file.read()
    
    # Replace placeholders
    app_content = template_content.replace("{{APP_NAME}}", app_name)
    app_content = app_content.replace("{{APP_PORT}}", str(port))
    
    app_py_path.write_text(app_content)
    
    print(f"Created microservice: {app_name} on port {port}")

def main():
    """Main build process"""
    print("Building microservices from Upsun config...")
    
    # Load config
    config = load_upsun_config()
    
    # Get business apps
    business_apps = get_business_apps(config)
    
    print(f"Found {len(business_apps)} business apps to build:")
    for app in business_apps:
        print(f"  - {app['name']}")
    
    # Create microservices directory
    microservices_dir = Path("microservices")
    if microservices_dir.exists():
        shutil.rmtree(microservices_dir)
    microservices_dir.mkdir()
    
    # Copy shared resources
    shutil.copy("shared_resources.py", microservices_dir / "shared_resources.py")
    
    # Create each microservice
    port = 8001
    for app in business_apps:
        create_microservice_directory(app['name'], port)
        port += 1
    
    print(f"\nBuild complete! Created {len(business_apps)} microservices in ./microservices/")
    print("Each microservice includes:")
    print("  - app.py (FastAPI application)")
    print("  - requirements.txt (dependencies)")
    print("  - shared_resources.py (resource management)")

if __name__ == "__main__":
    main()
