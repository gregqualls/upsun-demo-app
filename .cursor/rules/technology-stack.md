# Technology Stack Rules

## Frontend Stack

### React Framework
- **Version**: React 18+ with functional components and hooks
- **State Management**: useState, useEffect, useCallback for local state
- **Component Structure**: Functional components with TypeScript (if available)
- **Performance**: Use React.memo() for expensive components
- **Error Handling**: Error boundaries for graceful error handling
- **Code Organization**: Components in separate files with clear naming

### Tailwind CSS
- **Utility-First**: Use Tailwind utility classes for styling
- **Responsive Design**: Mobile-first approach with responsive prefixes
- **Color Palette**: Consistent color scheme matching Upsun branding
- **Spacing**: Use Tailwind's spacing scale (4, 8, 12, 16, 24, 32px)
- **Typography**: Use Tailwind's typography plugin for consistent text styling
- **Custom Components**: Create reusable component classes when needed

### Frontend Architecture
- **Component Library**: Build reusable UI components
- **Layout Components**: Consistent layout patterns across pages
- **Form Handling**: Controlled components with proper validation
- **API Integration**: Use fetch or axios for API calls
- **Loading States**: Skeleton screens and loading indicators
- **Error States**: User-friendly error messages and recovery options

## Backend Stack

### Python Framework
- **Version**: Python 3.11+
- **Framework**: FastAPI for high-performance API development
- **Async/Await**: Use async/await patterns for I/O operations
- **Type Hints**: Comprehensive type hints for all functions
- **Error Handling**: Proper exception handling with meaningful messages
- **Code Organization**: Modular structure with separate files for different concerns

### FastAPI Best Practices
- **Dependency Injection**: Use FastAPI's dependency system
- **Pydantic Models**: Use Pydantic for request/response validation
- **API Documentation**: Automatic OpenAPI/Swagger documentation
- **CORS**: Proper CORS configuration for frontend integration
- **Middleware**: Use middleware for logging, authentication, etc.
- **Background Tasks**: Use FastAPI's background task system for long operations

### Database Integration
- **ORM**: SQLAlchemy 2.0+ for database operations
- **Migrations**: Alembic for database schema management
- **Connection Pooling**: Proper connection pool configuration
- **Transactions**: Use database transactions for data consistency
- **Query Optimization**: Efficient database queries with proper indexing

## Development Tools

### Package Management
- **Python**: pip with requirements.txt for dependency management
- **Node.js**: npm with package.json and package-lock.json
- **Version Pinning**: Pin specific versions for reproducible builds
- **Security**: Regular dependency updates and vulnerability scanning

### Code Quality
- **Linting**: ESLint for JavaScript/React, flake8 for Python
- **Formatting**: Prettier for frontend, black for Python
- **Type Checking**: TypeScript for frontend, mypy for Python
- **Testing**: Jest for frontend, pytest for Python
- **Pre-commit Hooks**: Automated code quality checks

### Build and Deployment
- **Build Process**: Optimized production builds for both frontend and backend
- **Environment Variables**: Proper environment variable management
- **Docker**: Containerization for consistent deployment
- **CI/CD**: Automated testing and deployment pipelines

## Upsun Platform Integration

### CLI Integration
- **Upsun CLI**: Install and configure CLI in build process
- **Authentication**: Use UPSUN_CLI_TOKEN for non-interactive authentication
- **Commands**: Use CSV format for reliable data parsing
- **Error Handling**: Graceful fallback when CLI commands fail
- **Performance**: Optimize CLI command execution and caching

### Environment Configuration
- **Config Files**: Proper .upsun/config.yaml structure
- **Services**: PostgreSQL database service configuration
- **Variables**: Environment variables for configuration
- **Relationships**: Proper service relationships and dependencies
- **Scaling**: Resource allocation and scaling configuration

## API Design

### RESTful API Principles
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE
- **Status Codes**: Appropriate HTTP status codes for responses
- **URL Structure**: Clean, RESTful URL patterns
- **Request/Response**: Consistent JSON request/response format
- **Versioning**: API versioning strategy for future compatibility

### API Endpoints Structure
- **Metrics Endpoints**: `/api/metrics/*` for metrics-related operations
- **Resources Endpoints**: `/api/resources/*` for resource management
- **Health Endpoints**: `/api/health` for service health checks
- **Documentation**: Comprehensive API documentation with examples

## Security Considerations

### Authentication & Authorization
- **API Tokens**: Secure handling of Upsun API tokens
- **Environment Variables**: Never commit sensitive data to version control
- **Input Validation**: Validate all user inputs and API requests
- **SQL Injection**: Use parameterized queries to prevent SQL injection
- **CORS**: Proper CORS configuration for security

### Data Protection
- **Sensitive Data**: Encrypt sensitive data in transit and at rest
- **Logging**: Avoid logging sensitive information
- **Error Messages**: Don't expose internal system details in error messages
- **Rate Limiting**: Implement rate limiting for API endpoints

## Performance Optimization

### Frontend Performance
- **Code Splitting**: Split code for faster initial loading
- **Lazy Loading**: Lazy load components and routes
- **Image Optimization**: Optimize images and use appropriate formats
- **Caching**: Implement proper caching strategies
- **Bundle Size**: Monitor and optimize bundle size

### Backend Performance
- **Database Queries**: Optimize database queries and use indexes
- **Caching**: Implement caching for frequently accessed data
- **Async Operations**: Use async/await for I/O operations
- **Connection Pooling**: Proper database connection pooling
- **Memory Management**: Efficient memory usage and garbage collection

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Test individual components with Jest
- **Integration Tests**: Test component interactions
- **E2E Tests**: End-to-end testing with Playwright or Cypress
- **Visual Testing**: Visual regression testing
- **Accessibility Testing**: Automated accessibility testing

### Backend Testing
- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints and database operations
- **Performance Tests**: Load testing for API endpoints
- **Security Tests**: Security vulnerability testing
- **Database Tests**: Test database operations and migrations

## Monitoring and Logging

### Application Monitoring
- **Health Checks**: Regular health check endpoints
- **Performance Metrics**: Monitor response times and throughput
- **Error Tracking**: Track and monitor application errors
- **Uptime Monitoring**: Monitor service availability
- **Resource Usage**: Monitor CPU, memory, and disk usage

### Logging Strategy
- **Structured Logging**: Use structured logging format (JSON)
- **Log Levels**: Appropriate use of DEBUG, INFO, WARN, ERROR levels
- **Log Aggregation**: Centralized logging for easier debugging
- **Log Rotation**: Proper log rotation to manage disk space
- **Sensitive Data**: Never log sensitive information

## Development Workflow

### Git Workflow
- **Branch Strategy**: Feature branches with pull request reviews
- **Commit Messages**: Clear, descriptive commit messages
- **Code Reviews**: Mandatory code reviews for all changes
- **Continuous Integration**: Automated testing on every commit
- **Deployment**: Automated deployment to staging and production

### Environment Management
- **Local Development**: Docker Compose for local development
- **Staging Environment**: Separate staging environment for testing
- **Production Environment**: Production environment with proper monitoring
- **Configuration**: Environment-specific configuration management
- **Secrets Management**: Secure handling of secrets and credentials
