export const CHANNEL = new BroadcastChannel("@frank-mayer/service-worker");

/**
 * Get notified when the service workers offline first cache has been updated.
 */
export const onServiceWorkerCacheUpdated = (callback: () => void) => {
  CHANNEL.addEventListener("message", (ev) => {
    if (
      ev.data.from === "@frank-mayer/service-worker" &&
      ev.data.type === "cache-updated"
    ) {
      callback();
    }
  });
};
