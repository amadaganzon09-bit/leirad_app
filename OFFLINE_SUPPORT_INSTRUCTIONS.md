# Offline Support Implementation - Step by Step Instructions

## Overview

This document provides step-by-step instructions on how to implement offline support in your React application using Workbox service workers. The implementation includes offline page loading, static asset caching, API request caching, and offline fallback functionality.

## Prerequisites

- Node.js installed
- Existing React project with Vite
- Vercel deployment setup
- Express-like backend in /api directory

## Implementation Steps

### 1. Install Dependencies

```bash
npm install workbox-cli workbox-core workbox-precaching workbox-routing workbox-strategies workbox-expiration workbox-cacheable-response --save-dev
```

### 2. Create Public Directory

Create a `public` directory in your project root to store static assets:

```bash
mkdir public
```

### 3. Create Workbox Configuration

Create `workbox-config.cjs` in your project root:

```javascript
module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,css,js,json,png,jpg,jpeg,svg,ico,woff,woff2,ttf,eot}'
  ],
  swDest: 'dist/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Cache API requests with Network First strategy for dynamic data
      urlPattern: /^https:\/\/[^\/]*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Cache Supabase requests with Stale-While-Revalidate for fast loading
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 15 * 60, // 15 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Cache Google Fonts with Cache First strategy
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Cache Google Fonts files with Cache First strategy
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-files-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    }
  ],
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [
    // Exclude API routes from navigation fallback
    /^\/api\//,
    // Exclude service worker file
    /\/sw\.js$/,
  ],
};
```

### 4. Create Service Worker Registration

Create `src/serviceWorkerRegistration.js`:

```javascript
// serviceWorkerRegistration.js
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register() {
  if ('serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `/sw.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker.'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl);
      }
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all tabs for this page are closed.'
              );
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}
```

### 5. Update index.tsx

Modify `index.tsx` to register the service worker:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { register } from './src/serviceWorkerRegistration';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker
register();
```

### 6. Create Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "routes": [
    {
      "src": "/sw.js",
      "dest": "/sw.js",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate",
        "service-worker-allowed": "/"
      }
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 7. Create Offline Fallback Page

Create `public/offline.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LeiradMaster - Offline</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            text-align: center;
            color: #334155;
        }
        .offline-container {
            max-width: 500px;
            padding: 2rem;
        }
        .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #94a3b8;
        }
        h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        p {
            font-size: 1rem;
            color: #64748b;
            line-height: 1.5;
        }
        button {
            margin-top: 1.5rem;
            padding: 0.75rem 1.5rem;
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="icon">📶</div>
        <h1>You're Offline</h1>
        <p>LeiradMaster is currently offline. Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()">Retry</button>
    </div>
</body>
</html>
```

### 8. Create PWA Manifest

Create `public/manifest.json`:

```json
{
  "short_name": "LeiradMaster",
  "name": "LeiradMaster Task & Budget Manager",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff"
}
```

### 9. Update index.html

Update `index.html` to include PWA manifest:

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#3b82f6" />
  <meta name="description" content="LeiradMaster - Task and Budget Management App" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" href="/favicon.ico" />
  <title>LeiradMaster</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script type="importmap" src="/importmap.json"></script>

</head>

<body>
  <div id="root"></div>
  <script>
        document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.keyCode === 123)) {
            e.preventDefault();
        }
    });
  </script>
  <script src="/main.js"></script>
  <script type="module" src="/index.tsx"></script>
</body>

</html>
```

### 10. Update Package.json Scripts

Update `package.json` to include Workbox build step:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build && workbox generateSW workbox-config.cjs",
    "preview": "vite preview",
    "build-sw": "workbox generateSW workbox-config.cjs"
  }
}
```

## Testing Offline Mode

### Local Testing

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview locally:
   ```bash
   npm run preview
   ```

3. Open Chrome DevTools and go to the Application tab

4. In the Service Workers section:
   - Check "Offline" to simulate offline mode
   - Check "Update on reload" to ensure the latest service worker is used

5. Refresh the page to see the offline fallback

6. Test API functionality by:
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

## Caching Strategies Explained

### Static Assets (Precaching)
- Strategy: CacheFirst
- All built assets are cached during installation
- Updated automatically with each new build

### API Requests (/api/...)
- Strategy: NetworkFirst
- Attempts to fetch from network first
- Falls back to cache if network fails
- Cache expiration: 5 minutes
- Maximum cache entries: 50

### Supabase Requests
- Strategy: StaleWhileRevalidate
- Serves cached data immediately
- Updates cache in background
- Cache expiration: 15 minutes
- Maximum cache entries: 100

### Google Fonts
- Strategy: CacheFirst
- Long-term caching for optimal performance
- Cache expiration: 1 year
- Separate caches for CSS and font files

## Troubleshooting

### Service Worker Not Registering
- Ensure you're running in production mode (not development)
- Check browser console for errors
- Verify service worker file exists at `/sw.js`

### Cache Not Working
- Check DevTools > Application > Cache Storage
- Verify caching strategies in workbox-config.cjs
- Ensure requests match the defined URL patterns

### Offline Fallback Not Showing
- Verify offline.html exists in public directory
- Check service worker fetch event handler
- Ensure navigation requests are properly intercepted

## Additional Notes

1. The service worker is only active in production builds
2. Cache is automatically updated when a new build is deployed
3. Users may need to refresh the page to get the latest service worker
4. The implementation is compatible with Vercel's deployment environment
5. All static assets are served from the public directory
6. API requests are properly cached and handled for offline scenarios