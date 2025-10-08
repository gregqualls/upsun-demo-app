# ScalSun Metrics Collection Analysis

## Overview

This document analyzes how the ScalSun tool collects metrics from the Upsun platform. ScalSun is an auto-scaling tool for Upsun projects that monitors resource utilization and adjusts application instances accordingly. While we're not interested in the scaling functionality (as Upsun now has built-in autoscaling), understanding their metrics collection approach is valuable for implementing similar monitoring in our application.

## Key Findings

### 1. Primary Metrics Collection Method

ScalSun uses **Upsun CLI commands** to collect metrics, specifically:

- **`upsun metrics:all`** - Collects CPU and memory usage percentages
- **`upsun resources:get`** - Gets current instance counts and resource allocations
- **`upsun resources:size:list`** - Lists available container size profiles

### 2. Specific CLI Commands Used

#### Metrics Collection (`GetProjectMetrics` function)
```bash
upsun metrics:all \
  --environment=<environment_name> \
  --interval=1m \
  --format=csv \
  --columns=service,cpu_percent,mem_percent \
  --no-header \
  --no-interaction \
  --yes
```

**Output Format:**
- CSV format with columns: `service,cpu_percent,mem_percent`
- Example: `payment-processing,45.2%,67.8%`

#### Resource Information (`GetContainersUsage` function)
```bash
upsun resources:get \
  --environment=<environment_name> \
  --format=csv \
  --columns=service,instance_count,cpu \
  --no-header \
  --no-interaction \
  --yes
```

**Output Format:**
- CSV format with columns: `service,instance_count,cpu`
- Example: `payment-processing,2,0.5`

#### Container Size Profiles (`ListContainerSize` function)
```bash
upsun resources:size:list \
  --environment=<environment_name> \
  --service=<service_name> \
  --no-header \
  --format=csv \
  --no-interaction \
  --yes
```

**Output Format:**
- CSV format with columns: `profile_id,cpu,memory`
- Example: `S,0.25,128`

### 3. Metrics Collected

ScalSun collects the following metrics:

1. **CPU Usage Percentage** - Current CPU utilization as a percentage
2. **Memory Usage Percentage** - Current memory utilization as a percentage  
3. **Instance Count** - Number of running instances for each service
4. **Resource Allocation** - CPU and memory limits per instance
5. **Available Size Profiles** - Different container size options

### 4. Data Processing

The tool processes the CLI output by:

1. **Parsing CSV Output** - Splits comma-separated values
2. **Normalizing Values** - Converts percentages and removes units
3. **Aggregating Data** - Groups metrics by service name
4. **Storing Historical Data** - Maintains arrays of usage values over time

### 5. Implementation Details

#### Go Code Structure
- Uses `github.com/upsun/lib-sun` library for CLI interaction
- Calls `utils.CallCLIString()` function to execute CLI commands
- Parses output using string splitting and type conversion
- Stores data in structured Go types (`UsageApp`, `UsageValue`)

#### Error Handling
- Graceful fallback when CLI commands fail
- Logging of command execution failures
- Continues operation even if some metrics are unavailable

## How This Applies to Our Implementation

### Current Approach in Our App

Looking at our existing codebase, we already have a similar approach implemented:

1. **API Gateway Endpoint** (`/upsun-metrics/{app_name}`):
   ```python
   result = subprocess.run([
       'upsun', 'metrics:all', 
       '--service', app_name,
       '--latest',
       '--format', 'json'
   ], capture_output=True, text=True, timeout=10)
   ```

2. **Resource Information** (`/instances/{app_name}`):
   ```python
   result = subprocess.run(
       ['upsun', 'resources:get'], 
       capture_output=True, 
       text=True,
       timeout=10
   )
   ```

### Key Differences

1. **Output Format**: ScalSun uses CSV, our app uses JSON
2. **Data Processing**: ScalSun parses CSV manually, our app uses JSON parsing
3. **Error Handling**: Both have similar fallback mechanisms
4. **Metrics Scope**: ScalSun gets all services, our app gets specific services

### Recommendations for Our Implementation

1. **Adopt ScalSun's CSV Approach**: 
   - CSV format is more reliable and consistent
   - Better error handling for malformed data
   - Easier to parse and validate

2. **Implement Historical Data Collection**:
   - Store metrics over time like ScalSun does
   - Enable trend analysis and better decision making

3. **Add Resource Profile Information**:
   - Collect available container sizes
   - Monitor resource limits and utilization

4. **Improve Error Handling**:
   - Add more robust fallback mechanisms
   - Better logging and monitoring of CLI command failures

## CLI Command Reference

Based on ScalSun's implementation, here are the key Upsun CLI commands for metrics collection:

### Get All Metrics
```bash
upsun metrics:all --environment=<env> --format=csv --columns=service,cpu_percent,mem_percent --no-header --no-interaction --yes
```

### Get Resource Information
```bash
upsun resources:get --environment=<env> --format=csv --columns=service,instance_count,cpu --no-header --no-interaction --yes
```

### Get Available Size Profiles
```bash
upsun resources:size:list --environment=<env> --service=<service_name> --format=csv --no-header --no-interaction --yes
```

### Get Service List (for filtering)
```bash
upsun service:list --environment=<env> --format=csv --columns=name --no-header --no-interaction --yes
```

## Environment Variables Required

ScalSun relies on these Upsun environment variables:
- `PLATFORM_PROJECT` - Project identifier
- `PLATFORM_BRANCH` - Environment/branch name
- `UPSUN_CLI_TOKEN` - Authentication token for CLI access

## Conclusion

ScalSun's approach to metrics collection is straightforward and effective:
1. Use Upsun CLI commands with CSV output
2. Parse the output programmatically
3. Store and process the data for decision making
4. Implement robust error handling and fallbacks

Our current implementation already follows a similar pattern but could benefit from adopting ScalSun's CSV-based approach and adding historical data collection capabilities.