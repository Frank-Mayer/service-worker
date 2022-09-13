/**
 * Notification channel for the Service Worker.
 */
export const CHANNEL: BroadcastChannel;

/**
 * Get notified when the service workers offline first cache has been updated.
 * @param callback - The callback to be called when the cache has been updated.
 */
export const onServiceWorkerCacheUpdated: (callback: () => void) => void;
