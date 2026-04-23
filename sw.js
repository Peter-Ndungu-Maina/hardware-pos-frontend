/**
 * Elite Hardware POS — Service Worker (Hardened v4)
 * Caches the app shell for offline use.
 * API and External CDNs are handled separately to prevent CORS/Auth loops.
 */

const CACHE_NAME = 'elite-pos-v4';

// All files that make up the app shell (Local assets only)
const APP_SHELL = [
    '/',
    '/index.html',
    '/src/pages/inventory.html',
    '/src/pages/add_product.html',
    '/src/pages/stock_audit.html',
    '/src/pages/stock_movement.html',
    '/src/pages/stock_valuation.html',
    '/src/pages/expenses.html',
    '/src/pages/profit_loss.html',
    '/src/pages/debt_status.html',
    '/src/pages/debtors_report.html',
    '/src/pages/reports.html',
    '/src/pages/debts_repayment.html',
    '/src/pages/payments_report.html',
    '/src/pages/auth.js',
    '/src/pages/sidebar.js',
    '/src/pages/offline-db.js',
    // External Assets that support CORS (Chart.js and Google Fonts)
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
    'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700;900&display=swap'
];

// ── INSTALL — cache the app shell ───────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching App Shell');
            return Promise.allSettled(
                APP_SHELL.map(url =>
                    cache.add(url).catch(err => {
                        console.warn('[SW] Failed to cache:', url, err);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// ── ACTIVATE — clear old caches ──────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Removing old cache:', key);
                        return caches.delete(key);
                    })
            )
        ).then(() => self.clients.claim())
    );
});

// ── FETCH — Network First with Cache Fallback ────────────────────────────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 1. Never intercept API calls
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // 2. Bypass Service Worker for Tailwind/Unpkg CDNs to avoid CORS issues
    if (url.hostname.includes('tailwindcss.com') || url.hostname.includes('unpkg.com')) {
        return;
    }

    // 3. For everything else: try network first, fall back to cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If response is valid, clone it and update the cache
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                // Network failed — serve from cache
                return caches.match(event.request).then(cached => {
                    if (cached) return cached;

                    // If it's a navigation request (page load) and nothing is cached, serve index
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }

                    return new Response('Offline - Content not available', { 
                        status: 503,
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
            })
    );
});

// ── MESSAGE — trigger skipWaiting ────────────────────────────────────────────
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});