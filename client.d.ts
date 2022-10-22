/**
 * Notification channel for the Service Worker.
 */
export const CHANNEL: BroadcastChannel;

/**
 * Get notified when the service workers offline first cache has been updated.
 * @param callback - The callback to be called when the cache has been updated.
 */
export const onServiceWorkerCacheUpdated: (callback: () => void) => void;

/**
 * Notify the service worker to preload resources.
 * @param {Array<string>} resources - The resources to preload.
 * @returns Promise that resolves when the service worker has been notified.
 */
export const serviceWorkerPreloadResources: (
  resources: Array<string>
) => Promise<void>;

/**
 * Notify the service worker to clear the cache.
 * @returns Promise that resolves when the cache has been cleared.
 */
export const serviceWorkerClearCache = () => Promise<void>;
