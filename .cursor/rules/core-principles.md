# Core Implementation Principles

## ScalSun-Inspired Approach
- **ALWAYS** use ScalSun's CLI approach for metrics collection (`upsun metrics:all --format=csv`)
- **NEVER** attempt to bypass CLI with direct API calls (API is incomplete for our needs)
- **FOLLOW** ScalSun's CSV parsing methodology exactly
- **USE** `UPSUN_CLI_TOKEN` for authentication (already configured: `SW7SPfKB7gGSuZxJi6xPz9Lixw9Qb3LrOTnJX27qg4Q`)

## Enhanced Load Generation Standards
- **IMPLEMENT** CPULoadGenerator's PID regulator approach for precise CPU control
- **USE** direct memory allocation (`bytearray()`) instead of file I/O for memory load
- **MAINTAIN** <1% accuracy and <2 second response times
- **ENSURE** production-grade quality matching industry standards

## Resource-Aware Implementation
- **INITIALIZE** slider limits from Upsun resource data (`upsun resources:get --format=csv`)
- **RESPECT** actual resource allocation (CPU cores, memory limits)
- **VALIDATE** slider effectiveness against real Upsun metrics
- **UPDATE** every 2 minutes (Upsun's metrics update frequency)

## Testing Requirements
- **ALWAYS** test with browser and Upsun MCP tools before proceeding
- **NEVER** skip testing checkpoints between phases
- **VALIDATE** each component thoroughly before moving forward
- **DOCUMENT** all changes and test results
