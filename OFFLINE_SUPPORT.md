# Offline Support Implementation

This document describes how offline support has been implemented in the LeiradMaster application using Workbox service workers.

## Project Structure Changes

The following files and directories have been added/modified:

```
.
├── public/                     # New directory for static assets
│   ├── favicon.ico            # App favicon
│   ├── manifest.json          # PWA manifest file
│   ├── offline.html           # Offline fallback page
│   └── sw.js                 # Service worker implementation
├── src/
│   └── serviceWorkerRegistration.js  # Service worker registration
├── workbox-config.js         # Workbox configuration
├── vercel.json               # Vercel routing configuration
├── index.html                # Updated with manifest reference
├── index.tsx                 # Updated to register service worker
└── package.json              # Updated with build scripts
```

## Implementation Details

### 1. Workbox Configuration (`workbox-config.js`)

The configuration includes:
- Static asset caching (HTML, CSS, JS, images)
- Runtime caching strategies for different request types:
  - NetworkFirst for API requests (ensures fresh data when online)
  - StaleWhileRevalidate for Supabase requests (fast loading with background updates)
  - CacheFirst for Google Fonts (optimal performance)
- Navigation fallback to index.html for SPA routing
- Exclusion of API routes from navigation fallback

### 2. Service Worker (`public/sw.js`)

The service worker implements:
- Precaching of all build assets
- Runtime caching with appropriate strategies
- Offline fallback to offline.html for navigation requests
- Proper cache expiration and response validation

### 3. Service Worker Registration (`src/serviceWorkerRegistration.js`)

Handles:
- Service worker registration on app load
- Update detection and notification
- Localhost development considerations

### 4. Vercel Configuration (`vercel.json`)

Configures:
- Proper serving of the service worker with correct headers
- SPA routing fallback to index.html
- API route handling

## How to Build and Deploy

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npm run build
```

This command will:
1. Build the React application using Vite
2. Generate the service worker with Workbox

### 3. Preview Locally

```bash
npm run preview
```

### 4. Deploy to Vercel

Simply push to your GitHub repository connected to Vercel, or use the Vercel CLI:

```bash
vercel --prod
```

## Testing Offline Mode

### Local Testing

1. Build and preview the application:
   ```bash
   npm run build
   npm run preview
   ```

2. Open Chrome DevTools and go to the Application tab

3. In the Service Workers section:
   - Check "Offline" to simulate offline mode
   - Check "Update on reload" to ensure the latest service worker is used

4. Refresh the page to see the offline fallback

5. Test API functionality by:
   - Going online and loading data
   - Going offline and navigating the app
   - Verifying cached data is still accessible

### Vercel Testing

1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Open the deployed application in Chrome

3. Open DevTools > Application > Service Workers

4. Check "Offline" and test the application

5. Verify that:
   - The app loads even when offline
   - Cached data is accessible
   - API requests are properly handled
   - The offline fallback page shows when needed

## Caching Strategies

### Static Assets
- Strategy: Precaching (cache-first)
- Updated when a new build is deployed
- Includes all HTML, CSS, JS, images, and fonts

### API Requests (/api/...)
- Strategy: NetworkFirst
- Cache expiration: 5 minutes
- Maximum cache entries: 50
- Ensures fresh data when online, with fallback when offline

### Supabase Requests
- Strategy: StaleWhileRevalidate
- Cache expiration: 15 minutes
- Maximum cache entries: 100
- Provides fast loading with background updates

### Google Fonts
- Strategy: CacheFirst
- Long-term caching (1 year)
- Optimizes font loading performance

## Offline Fallback

When the app is offline:
1. Navigation requests fall back to index.html (SPA support)
2. Failed page loads show the offline.html page
3. Cached data remains accessible
4. Users can continue interacting with cached content

## Notes

1. The service worker is only active in production builds, not during development
2. Cache is automatically updated when a new build is deployed
3. Users may need to refresh the page to get the latest service worker
4. API data is cached temporarily and will expire based on the configured timeouts
5. The offline.html page provides a user-friendly experience when completely offline