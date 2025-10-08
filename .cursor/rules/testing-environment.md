# Testing Tools and Environment

## Available Testing Tools

### Browser Testing:
- **NAVIGATE** to environment URLs for manual testing
- **VERIFY** frontend functionality and UI updates
- **TEST** API endpoints and responses
- **CHECK** real-time updates and effectiveness indicators

### Upsun MCP Tools:
- **MONITOR** environment status and deployments
- **TEST** CLI commands and authentication
- **VERIFY** resource allocation and metrics
- **CHECK** database connectivity and services
- **VALIDATE** configuration changes

## Environment Information

### Current Environment:
- **Branch**: `enhanced-metrics-integration`
- **Frontend URL**: https://enhanced-metrics-hacqp4a-ckxfak37732ke.ch-1.platformsh.site/
- **API URL**: https://api.enhanced-metrics-hacqp4a-ckxfak37732ke.ch-1.platformsh.site/
- **API Token**: `SW7SPfKB7gGSuZxJi6xPz9Lixw9Qb3LrOTnJX27qg4Q` (configured)

### Services:
- api-gateway (Python 3.11)
- user-management (Python 3.11)
- payment-processing (Python 3.11)
- inventory-system (Python 3.11)
- notification-center (Python 3.11)
- frontend (Node.js 20)

## Testing Requirements

### Before Each Implementation Step:
1. **USE BROWSER TOOLS** to test the current environment
2. **USE UPSUN MCP TOOLS** to verify metrics collection
3. **VALIDATE** each component before moving to the next

### Success Metrics (Must Achieve):
1. **Enhanced Load Generation**: Precise CPU/memory load generation using PID regulator
2. **CLI Integration**: Upsun CLI working in containers with CSV output
3. **Resource Awareness**: Sliders respect actual Upsun resource limits
4. **Database Integration**: Metrics persistently stored with historical tracking
5. **Real-time Integration**: Slider effectiveness measured against Upsun metrics
6. **Performance**: <1% accuracy, <2 second response times
7. **User Experience**: Frontend showing real-time effectiveness indicators
8. **Professional Quality**: Production-grade load generation standards
