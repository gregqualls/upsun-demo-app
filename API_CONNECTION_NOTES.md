# API Connection Architecture - Important Notes

## ⚠️ CRITICAL: Do Not Break This Implementation

This document explains how the frontend-backend API connection works in this Upsun multi-app deployment. **DO NOT** modify the API URL detection logic without understanding these notes.

## The Problem We Solved

### Original Issue
- React apps need environment variables at **build time** to bake them into the JavaScript bundle
- Upsun's `PLATFORM_ROUTES` environment variable is only available at **runtime**, not during build
- Using `.environment` scripts or build-time environment variables failed because routes aren't available during build

### Why Standard Approaches Failed
1. **`.environment` file approach**: Routes not available during build
2. **Build-time environment variables**: `PLATFORM_ROUTES` not accessible in build hooks
3. **Hardcoded URLs**: Don't work across different environments

## Our Solution: Runtime API URL Detection

### Location
**File**: `frontend/src/App.js` (lines 20-38)

### How It Works
```javascript
const getApiBaseUrl = () => {
  // Priority 1: Use environment variable if available (for overrides)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Priority 2: Auto-detect API URL from current domain (production)
  if (window.location.hostname.includes('platformsh.site')) {
    const currentHost = window.location.hostname;
    const apiHost = currentHost.replace(/^/, 'api.');
    return `https://${apiHost}`;
  }
  
  // Priority 3: Fallback to localhost (development)
  return 'http://localhost:8004';
};
```

### Logic Flow
1. **Check for environment variable first** - allows manual overrides if needed
2. **Detect Upsun production environment** - looks for `platformsh.site` in hostname
3. **Construct API URL dynamically** - replaces current host with `api.` prefix
4. **Fallback to localhost** - for local development

### Examples
- **Production**: `main-bvxea6i-ckxfak37732ke.ch-1.platformsh.site` → `api.main-bvxea6i-ckxfak37732ke.ch-1.platformsh.site`
- **Local Dev**: Any localhost → `http://localhost:8004`

## Why This Works

### ✅ Advantages
1. **No build-time dependencies** - works regardless of environment variable availability
2. **Environment agnostic** - works in dev, staging, production automatically
3. **Self-healing** - automatically adapts to domain changes
4. **Upsun compatible** - follows Upsun's subdomain routing pattern
5. **Future-proof** - doesn't break when routes change

### ✅ Upsun Integration
- Leverages Upsun's standard subdomain routing: `api.{default}`
- Works with any Upsun environment automatically
- No need for environment variable configuration
- Compatible with Upsun's internal service communication

## Configuration Files

### Upsun Config
**File**: `.upsun/config.yaml`
```yaml
routes:
  https://{default}/:
    type: upstream
    upstream: frontend:http
  https://api.{default}/:
    type: upstream
    upstream: api-gateway:http
    id: api  # Not used by our solution, but good to have
```

### Build Hook
**File**: `.upsun/config.yaml` (frontend hooks)
```yaml
hooks:
  build: |
    set -ex
    pwd
    ls -la
    ls -la public/
    # Don't set REACT_APP_API_URL during build - will be determined at runtime
    echo "Building React app without hardcoded API URL"
    npm ci
    npm run build
    ls -la build/
```

## What NOT to Do

### ❌ Don't Do These
1. **Don't add build-time environment variables** for API URL
2. **Don't use `.environment` files** for React build process
3. **Don't hardcode API URLs** in the React code
4. **Don't modify the `getApiBaseUrl()` function** without understanding the logic
5. **Don't remove the runtime detection** in favor of build-time variables

### ❌ Common Mistakes
- Trying to use `PLATFORM_ROUTES` in build hooks (not available)
- Setting `REACT_APP_API_URL` in build hooks (routes not available)
- Hardcoding URLs that break across environments
- Removing the fallback logic for local development

## Testing the Implementation

### Verify It's Working
1. **Check API connectivity**: Visit the frontend and ensure no API errors
2. **Verify URL construction**: Check browser dev tools for correct API calls
3. **Test across environments**: Should work in dev, staging, production
4. **Check service status**: API should show all services as healthy

### Debug Commands
```bash
# Check if API is responding
curl -s "https://api.main-bvxea6i-ckxfak37732ke.ch-1.platformsh.site/services/status"

# Check if frontend is loading
curl -s "https://main-bvxea6i-ckxfak37732ke.ch-1.platformsh.site/"

# Check built JavaScript contains platformsh.site detection
curl -s "https://main-bvxea6i-ckxfak37732ke.ch-1.platformsh.site/static/js/main.*.js" | grep platformsh
```

## Maintenance Notes

### When Adding New Features
- **Don't modify** the `getApiBaseUrl()` function unless absolutely necessary
- **Test thoroughly** if you do modify it
- **Keep the fallback logic** for local development
- **Maintain the priority order** (env var → auto-detect → localhost)

### When Deploying
- **No special configuration needed** - works automatically
- **No environment variables to set** - completely self-contained
- **Works with any Upsun environment** - dev, staging, production

### If Something Breaks
1. **Check the browser console** for API connection errors
2. **Verify the URL construction** is working correctly
3. **Test the API directly** to ensure it's responding
4. **Check the built JavaScript** contains the detection logic

## Related Files
- `frontend/src/App.js` - Main implementation
- `.upsun/config.yaml` - Upsun configuration
- `api-gateway/app.py` - Backend API
- `cpu-worker/app.py`, `memory-worker/app.py`, `network-simulator/app.py` - Worker services

---
**Last Updated**: September 9, 2025
**Status**: ✅ Working and tested
**Critical**: ⚠️ Do not modify without understanding this architecture
