/**
 * Notification channel for the Service Worker.
 */
export const CHANNEL = new BroadcastChannel("@frank-mayer/service-worker");

/**
 * Get notified when the service workers offline first cache has been updated.
 * @param {() => void} callback - The callback to be called when the cache has been updated.
 */
export const onServiceWorkerCacheUpdated = (callback) => {
  CHANNEL.addEventListener("message", (ev) => {
    if (
      ev.data.from === "@frank-mayer/service-worker" &&
      ev.data.type === "cache-updated"
    ) {
      callback();
    }
  });
};

/**
 * Notify the service worker to preload resources.
 * @param {Array<string>} resources - The resources to preload.
 * @returns Promise that resolves when the service worker has been notified.
 */
export const serviceWorkerPreloadResources = (resources) =>
  Promise.all(
    resources.map((resource) => fetch(resource, { cache: "reload" }))
  );

/**
 * Notify the service worker to clear the cache.
 * @returns Promise that resolves when the cache has been cleared.
 */
export const serviceWorkerClearCache = () =>
  new Promise((resolve, reject) => {
    CHANNEL.postMessage({
      from: "@frank-mayer/service-worker/client",
      type: "clear-cache",
    });

    CHANNEL.addEventListener(
      "message",
      async (ev) => {
        if (
          ev.data.from === "@frank-mayer/service-worker" &&
          ev.data.type === "clear-cache"
        ) {
          resolve();
        }
      },
      {
        once: true,
      }
    );

    setTimeout(() => {
      reject();
    }, 3000);
  });
