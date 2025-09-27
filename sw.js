


const CACHE_NAME = 'crypto-portfolio-cache-v33'; // Cache version bump
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/usePortfolio.ts',
  '/hooks/useWeb3Streak.ts',
  '/hooks/useCeloStreak.ts',
  '/hooks/useUnichainStreak.ts',
  '/hooks/useEthereumStreak.ts',
  '/hooks/useOpStreak.ts',
  '/hooks/useMonadStreak.ts',
  '/hooks/useTheme.ts',
  '/services/coingecko.ts',
  '/services/marketData.ts',
  '/services/web3modal.tsx',
  '/services/streakContract.ts',
  '/services/celoStreakContract.ts',
  '/services/unichainStreakContract.ts',
  '/services/ethereumStreakContract.ts',
  '/services/opStreakContract.ts',
  '/services/monadStreakContract.ts',
  '/utils/calculations.ts',
  '/components/icons.tsx',
  '/components/PortfolioHeader.tsx',
  '/components/PortfolioSummary.tsx',
  '/components/AssetTable.tsx',
  '/components/AllocationChart.tsx',
  '/components/AddAssetModal.tsx',
  '/components/AddWalletModal.tsx',
  '/components/WalletCard.tsx',
  '/components/AddTransactionModal.tsx',
  '/components/DailyStreak.tsx',
  '/components/CeloDailyStreak.tsx',
  '/components/UnichainDailyStreak.tsx',
  '/components/EthereumDailyStreak.tsx',
  '/components/OpDailyStreak.tsx',
  '/components/MonadDailyStreak.tsx',
  '/components/DailyStreakGroup.tsx',
  '/components/BackToTopButton.tsx',
  '/components/MarketIndices.tsx'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
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

  // Let the browser handle API/CDN requests to ensure fresh data, bypassing the SW cache.
  if (
    event.request.url.includes('api.coingecko.com') || 
    event.request.url.includes('api.etherscan.io') ||
    event.request.url.includes('esm.sh') || 
    event.request.url.includes('cdn.tailwindcss.com')
  ) {
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
    clients.claim().then(() => { // Take control of all clients immediately.
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    })
  );
});