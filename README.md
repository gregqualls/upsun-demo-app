# Upsun Demo Application v1

A realistic microservices ecosystem that simulates business applications with individual resource controls to demonstrate Upsun's auto-scaling and monitoring capabilities. Perfect for showcasing real-world microservices patterns and Upsun's platform features in demos and presentations.

[![GitHub](https://img.shields.io/github/license/gregqualls/upsun-demo-app)](https://github.com/gregqualls/upsun-demo-app)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.3.0-blue.svg)](https://tailwindcss.com/)
[![Upsun](https://img.shields.io/badge/deployed%20on-upsun-00d4aa.svg)](https://upsun.com)

## 🎬 Demo

The application features a modern, responsive UI with per-application resource controls and monitoring:

- **Per-App Resource Controls**: Individual sliders for each business application
- **Business-Focused Metrics**: Processing, Storage, Traffic, Orders, and Completions
- **Real-time Status Dashboard**: Live health checks and status indicators for each app
- **Real-time Metrics**: Live updates of resource consumption and performance
- **Dark Mode Toggle**: Switch between light and dark themes
- **Demo-Optimized UI**: Large, clear elements perfect for screen recording and presentations
- **Realistic Microservices**: Each app behaves like a real business service

## 🏗️ Architecture

### v1 - Business Microservices Architecture

- **Frontend**: React + Tailwind CSS with per-app resource controls
- **API Gateway**: FastAPI service for orchestration and resource management
- **Business Applications** (4 configurable microservices):
  - **User Management**: User account and authentication services
  - **Payment Processing**: Financial transaction handling
  - **Inventory System**: Product and stock management
  - **Notification Center**: Communication and alerting

### Resource Management

Each business application includes:
- **Processing**: CPU-intensive tasks and calculations
- **Storage**: Memory-intensive operations and data structures

**Simplified Control**: The system now uses a streamlined 2-slider interface (Processing/Storage) for easier demo control while maintaining realistic resource simulation.

**Service Communication**: All services communicate via HTTP using Upsun's internal relationships (`http://service-name.internal`), with centralized resource management through a shared library.

## 🚀 Quick Start

### Local Development

1. **Prerequisites**:
   - Python 3.11+
   - Node.js 20+
   - Git

   **Note**: The script automatically creates a Python virtual environment to avoid system package conflicts.

2. **Start all services locally**:
   ```bash
   ./start-local.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8004

### Upsun Deployment

1. **Prerequisites**:
   - Upsun account and organization
   - Upsun CLI installed

2. **Deploy to Upsun**:
   ```bash
   # Create a new project
   upsun project:create upsun-demo-app
   
   # Deploy the application
   upsun app:deploy
   ```

3. **Access your deployed application**:
   - Frontend: `https://rearchitect-ljoo54q-ckxfak37732ke.ch-1.platformsh.site/`
   - API Gateway: `https://api.rearchitect-ljoo54q-ckxfak37732ke.ch-1.platformsh.site/`

**Note**: The application uses Upsun's internal relationships for service communication. Services communicate via `http://service-name.internal` URLs, which are automatically configured by Upsun based on the relationships defined in `.upsun/config.yaml`.

## 🎯 Demo Features

### Per-Application Resource Control
- **Individual App Controls**: Each business application has its own resource sliders (Processing/Storage)
- **Simplified Metrics**: Streamlined 2-slider interface for easier demo control
- **Real-time Adjustments**: Modify resource usage for each app independently
- **App-Specific Actions**: Start/Stop/Reset individual applications
- **Bulk Operations**: Control all apps simultaneously

### Real-time Monitoring
- **App Status Dashboard**: Live health checks for each business application
- **Resource Metrics**: Real-time CPU and memory usage per app with visual progress bars
- **Instance Monitoring**: Live container instance counts with autoscaling indicators
- **Performance Data**: Request counts, error rates, and response times
- **System Overview**: Aggregated metrics across all applications
- **Visual Indicators**: Color-coded status and resource levels

### UI/UX Features
- **Modern Card Layout**: Clean, organized display for each application
- **Dark Mode**: Toggle between light and dark themes
- **Demo-Optimized**: Large, clear UI elements perfect for screen recording
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data refresh every 2 seconds
- **Accessibility**: Color-blind friendly and accessible design

## 🔧 Service Details

### API Gateway (`api-gateway/`)
- **Port**: 8004 (local) / 8000 (Upsun)
- **Framework**: FastAPI
- **Purpose**: Central orchestration and per-app resource management
- **Endpoints**:
  - `GET /apps` - List all business applications and their status
  - `POST /resources` - Update resource levels for specific app
  - `POST /resources/all` - Update resource levels for all apps
  - `POST /apps/{app_name}/reset` - Reset specific app resources
  - `GET /metrics` - Aggregated metrics from all apps

### Business Applications (`microservices/`)
Each business application is a configurable microservice:

#### User Management (`user-management/`)
- **Port**: 8001 (local) / Dynamic (Upsun)
- **Framework**: FastAPI + UpsunMetricsManager
- **Purpose**: User account and authentication services
- **Resource Types**: Processing (CPU), Storage (Memory)

#### Payment Processing (`payment-processing/`)
- **Port**: 8002 (local) / Dynamic (Upsun)
- **Framework**: FastAPI + UpsunMetricsManager
- **Purpose**: Financial transaction handling
- **Resource Types**: Processing (CPU), Storage (Memory)

#### Inventory System (`inventory-system/`)
- **Port**: 8003 (local) / Dynamic (Upsun)
- **Framework**: FastAPI + UpsunMetricsManager
- **Purpose**: Product and stock management
- **Resource Types**: Processing (CPU), Storage (Memory)

#### Notification Center (`notification-center/`)
- **Port**: 8004 (local) / Dynamic (Upsun)
- **Framework**: FastAPI + UpsunMetricsManager
- **Purpose**: Communication and alerting
- **Resource Types**: Processing (CPU), Storage (Memory)

### Frontend (`frontend/`)
- **Port**: 3000
- **Framework**: React + Tailwind CSS
- **Purpose**: Per-app resource control and monitoring interface
- **Features**: 
  - Individual app cards with resource sliders
  - Real-time status indicators
  - Dark mode toggle
  - Responsive design
  - Accessibility features

## 📊 Upsun Integration

This application is designed to showcase Upsun's key features:

### Auto-Scaling
- Services automatically scale based on resource usage
- CPU and memory thresholds trigger scaling events
- Network load affects service instances

### Built-in Monitoring
- **Hybrid Metrics**: Combines real-time simulation with Upsun's native metrics
- **UpsunMetricsManager**: Intelligent metrics collection and instance monitoring
- **Service Health Checks**: Real-time status reporting and health indicators
- **Performance Analytics**: CPU, memory, and instance count tracking

### Service Discovery
- Automatic service-to-service communication
- Environment variable configuration
- Health check endpoints for all services

### Environment Management
- Separate environments for development and production
- Environment-specific configuration
- Easy deployment and rollback

## 🆕 What's New in v1

### Major Architecture Changes
- **Simplified Resource Control**: Streamlined from 5 sliders to 2 sliders (Processing/Storage)
- **Hybrid Metrics System**: UpsunMetricsManager combines real-time simulation with Upsun metrics
- **Enhanced Monitoring**: Live instance counts, CPU/memory bars, and autoscaling indicators
- **Improved Performance**: Reduced CPU load and optimized resource simulation
- **Better Demo Experience**: Cleaner interface focused on core Upsun features

### Key Improvements
- **Simplified Interface**: 2-slider system (Processing/Storage) for easier demo control
- **Hybrid Metrics**: Real-time simulation combined with Upsun's native monitoring
- **Live Instance Tracking**: Visual container counts with autoscaling indicators
- **Better Performance**: Optimized resource simulation with reduced CPU overhead
- **Enhanced UX**: Cleaner, more focused interface for presentations

## 🛠️ Development

### Project Structure
```
├── api-gateway/              # API Gateway service
├── microservices/            # Business applications
│   ├── user-management/      # User Management app
│   ├── payment-processing/   # Payment Processing app
│   ├── inventory-system/     # Inventory System app
│   ├── notification-center/  # Notification Center app
│   └── shared_resources.py   # Centralized resource management
├── frontend/                 # React frontend with per-app controls
├── shared_resources.py       # Resource management library
├── microservice_template.py  # Template for new microservices
├── build_microservices.py    # Build script for microservices
├── start-local.sh           # Local development script
└── README.md                # This file
```

### Adding New Business Applications
1. Add the new app to `.upsun/config.yaml` in the `applications` section
2. Run `python build_microservices.py` to generate the microservice
3. The new app will automatically appear in the frontend
4. No need to modify API Gateway or frontend code

### Customizing Resource Simulation
- Modify `shared_resources.py` to change resource simulation logic
- Add new resource types by updating the `ResourceManager` class
- Customize business metrics in the `current_levels` dictionary
- Update the frontend `AppCard.js` to display new metrics

### Extending the Architecture
- **Add More Apps**: Simply add to the Upsun config and rebuild
- **Custom Resource Types**: Extend the `ResourceManager` class
- **New Business Logic**: Modify individual microservice templates
- **UI Customization**: Update React components in `frontend/src/components/`

## 🎬 Demo Script

### Setup (2 minutes)
1. Deploy the application to Upsun
2. Open the Upsun dashboard in one tab
3. Open the application frontend in another tab

### Demo Flow (5-10 minutes)
1. **Introduction**: Show the modern UI with business application cards
2. **Per-App Controls**: Demonstrate individual resource sliders (Processing/Storage) for each app
3. **Simplified Metrics**: Explain the streamlined 2-slider interface for easier control
4. **Real-time Updates**: Show live status indicators, CPU/memory bars, and instance counts
5. **Auto-Scaling**: Increase resource usage and show Upsun scaling with live instance tracking
6. **Hybrid Monitoring**: Show real-time metrics combined with Upsun's native monitoring
7. **Dark Mode**: Toggle themes to show UI flexibility

### Key Talking Points
- **Simplified Interface**: 2-slider system (Processing/Storage) for easier demo control
- **Hybrid Metrics**: Real-time simulation combined with Upsun's native monitoring
- **Live Instance Tracking**: Visual container counts with autoscaling indicators
- **Upsun Features**: Highlight auto-scaling, monitoring, and management capabilities
- **Developer Experience**: Show easy deployment and configuration
- **Scalability**: Easy to add more business applications

## 📸 Screenshots

### Main Dashboard
The application features a clean, modern interface with individual cards for each business application:

![Upsun Demo Application Screenshot](Screenshot%202025-10-03%20at%2012.59.15%20PM.png)

The interface showcases:
- **Individual App Cards**: Each business application has its own card with health status
- **2-Slider Controls**: Simplified Processing/Storage controls for each app
- **Live Metrics**: Real-time CPU and memory usage bars
- **Instance Monitoring**: Visual container instance counts with autoscaling indicators
- **Modern UI**: Clean design with dark mode toggle and responsive layout

### Live Demo URLs
- **Frontend**: https://rearchitect-ljoo54q-ckxfak37732ke.ch-1.platformsh.site/
- **API Gateway**: https://api.rearchitect-ljoo54q-ckxfak37732ke.ch-1.platformsh.site/

## 🔍 Troubleshooting

### Local Development
- Ensure all ports (3000, 8004) are available
- Check Python and Node.js versions
- Verify all dependencies are installed
- Make sure microservices are built: `python build_microservices.py`

### Upsun Deployment
- Check Upsun CLI is installed and authenticated
- Verify the `rearchitect` branch is active
- Check service URLs and relationships in config

### Common Issues
- **CORS errors**: Check API Gateway CORS configuration
- **Service communication**: Verify environment variables and relationships
- **Build failures**: Check Python/Node.js versions and dependencies
- **Missing apps**: Ensure microservices are built and deployed
- **Resource updates not working**: Check API Gateway endpoints and app status

## 🎯 Why v1 is Better

### For Demos
- **Simplified Interface**: 2-slider system is easier to understand and control
- **Better Engagement**: Live instance counts and CPU/memory bars are more visual
- **Clearer Value**: Hybrid metrics show both simulation and real Upsun data
- **Professional Look**: Modern UI with live monitoring indicators

### For Development
- **Hybrid Metrics**: UpsunMetricsManager combines simulation with real Upsun data
- **Simplified Logic**: 2-slider system reduces complexity while maintaining realism
- **Better Performance**: Optimized resource simulation with reduced CPU overhead
- **Maintainable**: Clear separation of concerns with centralized resource management

### For Upsun Showcase
- **Real Auto-Scaling**: Each app scales independently with live instance tracking
- **Hybrid Monitoring**: Combines real-time simulation with Upsun's native metrics
- **Visual Indicators**: Live CPU/memory bars and container instance counts
- **Professional Deployment**: Production-ready architecture with optimized performance

## 📝 License

This project is created for demonstration purposes. Feel free to use and modify for your own Upsun demos and presentations.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests to improve the demo application.

---

**v1.0.0** - Rearchitected for realistic microservices demonstration
