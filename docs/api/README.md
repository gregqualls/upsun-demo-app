# API Documentation

## Upsun CLI Integration

### Authentication
- **Token**: `SW7SPfKB7gGSuZxJi6xPz9Lixw9Qb3LrOTnJX27qg4Q`
- **Environment Variable**: `UPSUN_CLI_TOKEN`
- **Authentication Method**: Non-interactive CLI authentication

### Metrics Collection
```bash
# Get all metrics in CSV format
upsun metrics:all --format=csv

# Get resource information
upsun resources:get --format=csv

# Check authentication
upsun auth:info
```

### CSV Output Format
- **Metrics**: `Timestamp,Service,CPU %,Memory %,Disk %,/tmp %`
- **Resources**: `App or service,Size,CPU type,CPU,Memory (MB),Disk (MB),Instances`

## API Gateway Endpoints

### Metrics Endpoints
- `GET /metrics/{app_name}` - Get current metrics for specific app
- `POST /metrics/store` - Store metrics in database
- `GET /metrics/history/{app_name}` - Get historical metrics
- `GET /metrics/validate/{app_name}` - Validate slider effectiveness
- `POST /metrics/auto-adjust/{app_name}` - Auto-adjust microservice

### Resource Endpoints
- `GET /resources/{app_name}` - Get resource limits for app
- `POST /resources/{app_name}` - Update resource settings
- `GET /resources/dashboard` - Get comprehensive resource dashboard

## Load Generation API

### CPU Load Generation
- **Method**: PID regulator approach
- **Precision**: <1% accuracy
- **Response Time**: <2 seconds
- **Control**: Precise percentage control (0-100%)

### Memory Load Generation
- **Method**: Direct memory allocation (`bytearray()`)
- **Precision**: Exact MB amounts
- **Cleanup**: Automatic memory deallocation
- **Efficiency**: No disk I/O required
