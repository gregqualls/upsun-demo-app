# Upsun Demo Application

A multi-service application that simulates resource utilization to demonstrate Upsun's auto-scaling and monitoring capabilities. Perfect for showcasing Upsun's platform features in demos and presentations.

[![GitHub](https://img.shields.io/github/license/gregqualls/upsun-demo-app)](https://github.com/gregqualls/upsun-demo-app)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.3.0-blue.svg)](https://tailwindcss.com/)

## 🎬 Demo

The application features a modern, responsive UI with real-time resource controls and monitoring:

- **Resource Control Sliders**: Adjust CPU, memory, and network usage in real-time
- **Service Status Dashboard**: Live health checks and status indicators
- **Real-time Metrics**: Live updates of resource consumption and performance
- **Dark Mode Toggle**: Switch between light and dark themes
- **Demo-Optimized UI**: Large, clear elements perfect for screen recording

## 🏗️ Architecture

- **Frontend**: React + Tailwind CSS with dark mode
- **API Gateway**: FastAPI service for resource control and orchestration
- **CPU Worker**: Python service for CPU-intensive tasks
- **Memory Worker**: Python service for memory-intensive tasks
- **Network Simulator**: Service for inter-service communication
- **Redis**: Caching and message queuing (managed by Upsun)

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
   upsun project:create upsun-demo-app
   upsun app:deploy
   ```

3. **Access your deployed application**:
   - Frontend: `https://upsun-demo-frontend-{project}.upsunapp.com`
   - API Gateway: `https://upsun-demo-api-gateway-{project}.upsunapp.com`

## 🎯 Demo Features

### Resource Control
- **CPU Usage**: Adjustable sliders to control CPU-intensive calculations
- **Memory Usage**: Control memory consumption with data structures
- **Network Traffic**: Simulate inter-service API calls
- **Bulk Controls**: Start/Stop/Reset all services at once

### Real-time Monitoring
- **Service Status**: Live health checks for all services
- **Resource Metrics**: CPU, memory, and network usage in real-time
- **Performance Data**: Request counts, error rates, and response times
- **System Overview**: Aggregated metrics across all services

### UI/UX Features
- **Dark Mode**: Toggle between light and dark themes
- **Demo-Optimized**: Large, clear UI elements perfect for screen recording
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data refresh every 2 seconds

## 🔧 Service Details

### API Gateway (`api-gateway/`)
- **Port**: 8004
- **Framework**: FastAPI
- **Purpose**: Central orchestration and resource management
- **Endpoints**:
  - `GET /services/status` - Service health checks
  - `POST /resources` - Update resource levels
  - `GET /metrics` - Aggregated metrics

### CPU Worker (`cpu-worker/`)
- **Port**: 8001
- **Framework**: FastAPI
- **Purpose**: CPU-intensive calculations and processing
- **Features**: Configurable load levels, real-time CPU monitoring

### Memory Worker (`memory-worker/`)
- **Port**: 8002
- **Framework**: FastAPI
- **Purpose**: Memory-intensive data structures and caching
- **Features**: Dynamic memory allocation, process monitoring

### Network Simulator (`network-simulator/`)
- **Port**: 8003
- **Framework**: FastAPI
- **Purpose**: Inter-service communication simulation
- **Features**: Configurable request rates, error simulation

### Frontend (`frontend/`)
- **Port**: 3000
- **Framework**: React + Tailwind CSS
- **Purpose**: User interface for resource control and monitoring
- **Features**: Dark mode, real-time updates, responsive design

## 📊 Upsun Integration

This application is designed to showcase Upsun's key features:

### Auto-Scaling
- Services automatically scale based on resource usage
- CPU and memory thresholds trigger scaling events
- Network load affects service instances

### Built-in Monitoring
- Upsun's native metrics and monitoring
- Service health checks and status reporting
- Performance analytics and alerting

### Service Discovery
- Automatic service-to-service communication
- Environment variable configuration
- Health check endpoints for all services

### Environment Management
- Separate environments for development and production
- Environment-specific configuration
- Easy deployment and rollback

## 🛠️ Development

### Project Structure
```
├── api-gateway/          # API Gateway service
├── cpu-worker/           # CPU Worker service
├── memory-worker/        # Memory Worker service
├── network-simulator/    # Network Simulator service
├── frontend/             # React frontend
├── deploy.sh             # Upsun deployment instructions
├── start-local.sh        # Local development script
└── README.md             # This file
```

### Adding New Services
1. Create a new directory with your service code
2. Update the API Gateway service URLs
3. Add the service to deployment instructions

### Customizing Resource Simulation
- Modify the worker functions in each service
- Adjust the resource calculation algorithms
- Add new resource types or metrics
- Customize the UI components

## 🎬 Demo Script

### Setup (2 minutes)
1. Deploy the application to Upsun
2. Open the Upsun dashboard in one tab
3. Open the application frontend in another tab

### Demo Flow (5-10 minutes)
1. **Introduction**: Show the clean, modern UI and service status
2. **Resource Control**: Demonstrate the sliders and bulk controls
3. **Auto-Scaling**: Increase CPU usage and show Upsun scaling
4. **Monitoring**: Show real-time metrics and service health
5. **Network Simulation**: Demonstrate inter-service communication
6. **Dark Mode**: Toggle themes to show UI flexibility

### Key Talking Points
- **Multi-Service Architecture**: Show how services work together
- **Real-time Control**: Demonstrate immediate resource changes
- **Upsun Features**: Highlight auto-scaling, monitoring, and management
- **Developer Experience**: Show easy deployment and configuration

## 🔍 Troubleshooting

### Local Development
- Ensure all ports (3000, 8000-8003) are available
- Check Python and Node.js versions
- Verify all dependencies are installed

### Upsun Deployment
- Check Upsun CLI is installed and authenticated
- Verify organization ID in deployment script
- Check service URLs and relationships

### Common Issues
- **CORS errors**: Check API Gateway CORS configuration
- **Service communication**: Verify environment variables
- **Build failures**: Check Python/Node.js versions and dependencies

## 📝 License

This project is created for demonstration purposes. Feel free to use and modify for your own Upsun demos and presentations.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests to improve the demo application.
