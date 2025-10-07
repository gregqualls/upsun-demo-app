# Enhanced Metrics Integration Project Rules

## Project Overview
This is an Upsun demo application implementing ScalSun-inspired metrics collection and real-time integration with microservice sliders. The goal is to create professional-grade load generation using PID regulators and direct memory allocation, integrated with Upsun CLI metrics.

## Primary Project Goal
Create a **visually interesting and aesthetically pleasing** interface that demonstrates Upsun's console capabilities for metrics and autoscaling. This is an **interface for creating resource usage** - not recreating the metrics dashboard, but showcasing how Upsun handles resource management through an intuitive, modern UX.

## Core Implementation Principles

### 1. ScalSun-Inspired Approach
- **ALWAYS** use ScalSun's CLI approach for metrics collection (`upsun metrics:all --format=csv`)
- **NEVER** attempt to bypass CLI with direct API calls (API is incomplete for our needs)
- **FOLLOW** ScalSun's CSV parsing methodology exactly
- **USE** `UPSUN_CLI_TOKEN` for authentication (already configured: `SW7SPfKB7gGSuZxJi6xPz9Lixw9Qb3LrOTnJX27qg4Q`)

### 2. Enhanced Load Generation Standards
- **IMPLEMENT** CPULoadGenerator's PID regulator approach for precise CPU control
- **USE** direct memory allocation (`bytearray()`) instead of file I/O for memory load
- **MAINTAIN** <1% accuracy and <2 second response times
- **ENSURE** production-grade quality matching industry standards

### 3. Resource-Aware Implementation
- **INITIALIZE** slider limits from Upsun resource data (`upsun resources:get --format=csv`)
- **RESPECT** actual resource allocation (CPU cores, memory limits)
- **VALIDATE** slider effectiveness against real Upsun metrics
- **UPDATE** every 2 minutes (Upsun's metrics update frequency)

## Testing Requirements

### Before Each Implementation Step:
1. **USE BROWSER TOOLS** to test the current environment:
   - Navigate to: https://enhanced-metrics-hacqp4a-ckxfak37732ke.ch-1.platformsh.site/
   - Test API endpoints: https://api.enhanced-metrics-hacqp4a-ckxfak37732ke.ch-1.platformsh.site/
   - Verify current functionality before making changes

2. **USE UPSUN MCP TOOLS** to verify metrics collection:
   - Test `upsun metrics:all --format=csv` commands
   - Verify `upsun resources:get --format=csv` output
   - Check authentication with `upsun auth:info`
   - Monitor deployment status with `upsun environment:list`

3. **VALIDATE** each component before moving to the next:
   - Test CLI commands work in container
   - Verify CSV parsing accuracy
   - Confirm load generation precision
   - Check database connectivity
   - Validate frontend integration

## Implementation Phases (STRICT ORDER)

### Phase 1: Enhanced Load Generation (Week 1)
- [ ] Implement CPULoadGenerator-based PID regulator
- [ ] Implement direct memory allocation strategy
- [ ] Create EnhancedMicroservice class
- [ ] Test load generation accuracy (<1% error)

**Testing Checkpoints:**
- Use browser to verify microservice endpoints respond
- Use Upsun MCP to check resource allocation
- Validate CPU/memory load precision

### Phase 2: CLI Integration (Week 2)
- [ ] Update `.upsun/config.yaml` with CLI installation
- [ ] Implement CSV-based metrics collection
- [ ] Test CLI commands in Upsun environment
- [ ] Add error handling and fallbacks

**Testing Checkpoints:**
- Use Upsun MCP to verify CLI installation
- Test `upsun metrics:all --format=csv` in container
- Validate CSV parsing with real data

### Phase 3: Resource-Aware Integration (Week 3)
- [ ] Implement ResourceAwareSliders class
- [ ] Connect Upsun resource limits to slider maximums
- [ ] Add real-time metrics validation
- [ ] Create effectiveness indicators

**Testing Checkpoints:**
- Use browser to test slider functionality
- Use Upsun MCP to verify resource limits
- Validate effectiveness calculations

### Phase 4: Database Integration (Week 4)
- [ ] Add PostgreSQL service to Upsun config
- [ ] Create database models and migrations
- [ ] Implement metrics storage endpoints
- [ ] Add historical data retrieval

**Testing Checkpoints:**
- Use Upsun MCP to verify database service
- Test database connectivity
- Validate metrics storage

### Phase 5: Frontend Enhancement (Week 5)
- [ ] Update frontend with effectiveness indicators
- [ ] Add real-time resource limit display
- [ ] Implement auto-adjustment functionality
- [ ] Add comprehensive metrics dashboard

**Testing Checkpoints:**
- Use browser to test all frontend features
- Verify real-time updates
- Test auto-adjustment functionality

## Code Quality Standards

### Python Code:
- **USE** type hints for all functions
- **FOLLOW** PEP 8 style guidelines
- **IMPLEMENT** proper error handling with try/catch blocks
- **ADD** comprehensive docstrings
- **ENSURE** async/await patterns for I/O operations

### Frontend Code:
- **USE** React hooks properly (useCallback, useEffect dependencies)
- **IMPLEMENT** proper error boundaries
- **ADD** loading states for all async operations
- **ENSURE** responsive design with Tailwind CSS

### Configuration Files:
- **MAINTAIN** `.upsun/config.yaml` structure
- **PRESERVE** existing relationships and services
- **ADD** new services without breaking existing ones
- **DOCUMENT** all configuration changes

## Security and Best Practices

### Sensitive Information:
- **NEVER** commit API tokens or sensitive data
- **USE** environment variables for all secrets
- **MAINTAIN** `.gitignore` for planning documents
- **VERIFY** no sensitive data in tracked files

### Error Handling:
- **IMPLEMENT** graceful degradation for CLI failures
- **PROVIDE** meaningful error messages
- **LOG** all errors for debugging
- **FALLBACK** to container metrics when Upsun CLI fails

## Success Metrics (Must Achieve)

1. **Enhanced Load Generation**: Precise CPU/memory load generation using PID regulator
2. **CLI Integration**: Upsun CLI working in containers with CSV output
3. **Resource Awareness**: Sliders respect actual Upsun resource limits
4. **Database Integration**: Metrics persistently stored with historical tracking
5. **Real-time Integration**: Slider effectiveness measured against Upsun metrics
6. **Performance**: <1% accuracy, <2 second response times
7. **User Experience**: Frontend showing real-time effectiveness indicators
8. **Professional Quality**: Production-grade load generation standards
9. **Visual Appeal**: Modern, aesthetically pleasing interface that showcases Upsun capabilities
10. **Intuitive UX**: Users can understand and use controls without instruction
11. **Effective Demonstration**: Successfully demonstrates Upsun's metrics and autoscaling features

## Testing Tools Available

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

## Git Workflow Requirements

### Commit Standards
- **Conventional Commits**: Use `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- **Descriptive Messages**: Clear, concise commit messages
- **Small Commits**: Frequent, focused commits rather than large batches
- **No Sensitive Data**: Never commit API keys or sensitive information

### Branch Strategy
- **Feature Branches**: Create branches for each feature/phase
- **Self-Review**: Review your own code before merging
- **Direct Merge**: Merge feature branches directly to main when ready
- **Clean History**: Squash commits before merging to main

### Quality Gates
- **Pre-commit Checks**: Linting, formatting, type checking
- **Testing**: All tests must pass before merge
- **Documentation**: Update docs for API or config changes
- **Security**: Security scan and sensitive data check

## Critical Reminders

1. **ALWAYS** test with browser and Upsun MCP tools before proceeding
2. **NEVER** skip testing checkpoints between phases
3. **MAINTAIN** ScalSun's proven CLI approach
4. **ENSURE** professional-grade load generation quality
5. **RESPECT** Upsun resource limits and constraints
6. **FOLLOW** the strict phase order - no shortcuts
7. **VALIDATE** each component thoroughly before moving forward
8. **DOCUMENT** all changes and test results
9. **FOLLOW** Git workflow standards and commit conventions
10. **MAINTAIN** clean, reviewable code history
11. **SELF-REVIEW** code before committing and merging

## Technology Stack

### Frontend Stack:
- **React 18+**: Functional components with hooks
- **Tailwind CSS**: Utility-first styling with responsive design
- **Modern UX**: Intuitive, visually appealing interface
- **Component Library**: Reusable UI components
- **Performance**: Code splitting, lazy loading, optimized builds

### Backend Stack:
- **Python 3.11+**: Modern Python with type hints
- **FastAPI**: High-performance API framework
- **SQLAlchemy 2.0+**: Database ORM with migrations
- **Async/Await**: Non-blocking I/O operations
- **Upsun CLI**: Integrated metrics collection

### Development Tools:
- **Package Management**: pip (Python), npm (Node.js)
- **Code Quality**: ESLint, Prettier, TypeScript, mypy
- **Testing**: Jest (frontend), pytest (backend)
- **Build Process**: Optimized production builds
- **Security**: Dependency scanning, input validation
- **Git Workflow**: Conventional commits, self-review process, branch strategy

## Implementation Files to Focus On

### Priority Files:
- `.upsun/config.yaml` - CLI installation and database service
- `api-gateway/app.py` - Main API Gateway implementation
- `api-gateway/enhanced_microservice.py` - Load generation classes
- `api-gateway/resource_aware_sliders.py` - Slider integration
- `api-gateway/database.py` - Database models and connections
- `frontend/src/App.js` - Frontend integration
- `frontend/src/components/` - UI components for effectiveness indicators

### Configuration Files:
- `api-gateway/requirements.txt` - Python dependencies
- `frontend/package.json` - Node.js dependencies
- `.gitignore` - Security and file management

Remember: **TEST EVERYTHING** with browser and Upsun MCP tools before moving to the next step!