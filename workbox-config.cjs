module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,css,js,json,png,jpg,jpeg,svg,ico,woff,woff2,ttf,eot}'
  ],
  swDest: 'public/sw.js',
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