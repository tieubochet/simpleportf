const CACHE_NAME = 'crypto-portfolio-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/usePortfolio.ts',
  '/hooks/useStreak.ts',
  '/hooks/useTheme.ts',
  '/services/coingecko.ts',
  '/utils/calculations.ts',
  '/components/icons.tsx',
  '/components/PortfolioHeader.tsx',
  '/components/PortfolioSummary.tsx',
  '/components/AssetTable.tsx',
  '/components/AllocationChart.tsx',
  '/components/Heatmap.tsx',
  '/components/AddAssetModal.tsx',
  '/components/AddWalletModal.tsx',
  '/components/WalletCard.tsx',
  '/components/AddTransactionModal.tsx',
  '/components/DailyStreak.tsx',
  '/components/BackToTopButton.tsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
      return;
  }

  if (event.request.url.includes('api.coingecko.com') || event.request.url.includes('esm.sh') || event.request.url.includes('cdn.tailwindcss.com')) {
    // Let the browser handle these requests, bypassing the cache.
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Only cache local app shell files (basic responses)
            if (response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
            }

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});