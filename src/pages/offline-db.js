/**
 * Elite Hardware POS — Offline Queue + Stock Cache (IndexedDB)
 *
 * OfflineQueue  — stores sales made while offline, syncs when back online
 * StockCache    — stores full stock list so POS works after reload while offline
 */

const DB_NAME    = 'ElitePOS_Offline';
const DB_VERSION = 2; // bumped to add stock_cache store

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('pending_sales')) {
                const store = db.createObjectStore('pending_sales', { keyPath: 'offline_id', autoIncrement: true });
                store.createIndex('queued_at', 'queued_at', { unique: false });
            }
            if (!db.objectStoreNames.contains('stock_cache')) {
                db.createObjectStore('stock_cache', { keyPath: 'cache_key' });
            }
        };

        req.onsuccess = e => resolve(e.target.result);
        req.onerror   = e => reject(e.target.error);
    });
}

// ── OFFLINE QUEUE ─────────────────────────────────────────────────────────────
const OfflineQueue = (() => {
    const STORE = 'pending_sales';

    async function add(saleData) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readwrite');
            const req = tx.objectStore(STORE).add({ ...saleData, queued_at: new Date().toISOString(), sync_status: 'pending' });
            req.onsuccess = () => resolve(req.result);
            req.onerror   = () => reject(req.error);
        });
    }

    async function getAll() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror   = () => reject(req.error);
        });
    }

    async function remove(offlineId) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readwrite');
            const req = tx.objectStore(STORE).delete(offlineId);
            req.onsuccess = () => resolve();
            req.onerror   = () => reject(req.error);
        });
    }

    async function count() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).count();
            req.onsuccess = () => resolve(req.result);
            req.onerror   = () => reject(req.error);
        });
    }

    async function clear() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readwrite');
            const req = tx.objectStore(STORE).clear();
            req.onsuccess = () => resolve();
            req.onerror   = () => reject(req.error);
        });
    }

    return { add, getAll, remove, count, clear };
})();

// ── STOCK CACHE ───────────────────────────────────────────────────────────────
const StockCache = (() => {
    const STORE     = 'stock_cache';
    const STOCK_KEY = 'all_stock';
    const META_KEY  = 'sync_meta';

    async function save(stockArray) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readwrite');
            const ts  = new Date().toISOString();
            tx.objectStore(STORE).put({ cache_key: STOCK_KEY, items: stockArray });
            tx.objectStore(STORE).put({ cache_key: META_KEY,  last_sync: ts });
            tx.oncomplete = () => resolve(ts);
            tx.onerror    = () => reject(tx.error);
        });
    }

    async function load() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get(STOCK_KEY);
            req.onsuccess = () => resolve(req.result?.items || null);
            req.onerror   = () => reject(req.error);
        });
    }

    async function getLastSync() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get(META_KEY);
            req.onsuccess = () => resolve(req.result?.last_sync || null);
            req.onerror   = () => reject(req.error);
        });
    }

    async function clear() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE, 'readwrite');
            const req = tx.objectStore(STORE).clear();
            req.onsuccess = () => resolve();
            req.onerror   = () => reject(req.error);
        });
    }

    return { save, load, getLastSync, clear };
})();
