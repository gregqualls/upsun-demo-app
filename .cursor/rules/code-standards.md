# Code Quality Standards

## Technology Stack Standards

### Python 3.11+ / FastAPI
- **USE** type hints for all functions and variables
- **FOLLOW** PEP 8 style guidelines with black formatting
- **IMPLEMENT** proper error handling with try/catch blocks
- **ADD** comprehensive docstrings with examples
- **ENSURE** async/await patterns for I/O operations
- **USE** Pydantic models for request/response validation
- **IMPLEMENT** FastAPI dependency injection patterns

### React 18+ / Tailwind CSS
- **USE** functional components with hooks (useState, useEffect, useCallback)
- **IMPLEMENT** proper error boundaries for graceful error handling
- **ADD** loading states and skeleton screens for async operations
- **ENSURE** responsive design with Tailwind CSS mobile-first approach
- **USE** React.memo() for performance optimization
- **IMPLEMENT** controlled components for form handling
- **FOLLOW** component composition patterns

### Database / SQLAlchemy 2.0+
- **USE** SQLAlchemy 2.0+ syntax and patterns
- **IMPLEMENT** proper database migrations with Alembic
- **ENSURE** connection pooling and transaction management
- **USE** parameterized queries to prevent SQL injection
- **IMPLEMENT** proper indexing for query optimization

## Configuration Files
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
