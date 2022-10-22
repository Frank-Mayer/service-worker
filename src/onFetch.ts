import { CACHE_NAME, CHANNEL } from "./globals";

const currentlyFetching = new Map<string, Promise<Response>>();

const cacheMatchOptionsSameOrigin: CacheOptions = {
  ignoreSearch: true,
  ignoreMethod: true,
};

let cacheUpdatedTimer: number | null = null;

/** stale while revalidate */
export const onFetch = (ev: FetchEvent) =>
  new Promise<Response>(async (resolve) => {
    let cacheContent: string | null = null;
    const url = new URL(ev.request.url);
    const fullUrl = url.origin + url.pathname;
    let done = false;

    // timeout after 10 seconds
    const timeoutId = setTimeout(() => {
      if (!done) {
        resolve(new Response("Network Timeout", { status: 503 }));
      }
    }, 10000);

    // try to get the content from the cache
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        cache
          .match(fullUrl, cacheMatchOptionsSameOrigin)
          .then((cachedResponse) => {
            if (!done) {
              if (cachedResponse) {
                done = true;
                clearTimeout(timeoutId);
                resolve(cachedResponse);
                cachedResponse
                  .clone()
                  .text()
                  .then((cachedResponseText) => {
                    cacheContent = cachedResponseText;
                  });
              } else if (!navigator.onLine) {
                done = true;
                clearTimeout(timeoutId);
                resolve(new Response("Service Unavailable", { status: 503 }));
              }
            }
          })
          .catch((err) => {
            console.error(err);
          });

        // try to get the content from the network
        if (navigator.onLine) {
          // if we are already fetching the content, wait for the other fetch to finish
          if (currentlyFetching.has(fullUrl)) {
            currentlyFetching.get(fullUrl)!.then((response) => {
              if (!done) {
                done = true;
                clearTimeout(timeoutId);
                resolve(response.clone());
              }
            });
          } else {
            // fetch the content from the network
            const fetchPromise = fetch(fullUrl, {
              method: ev.request.method,
              headers: ev.request.headers,
              body: ev.request.body,
              redirect: "follow",
              cache: "reload",
            } as RequestInit);
            currentlyFetching.set(fullUrl, fetchPromise);
            fetchPromise.then((networkResponse) => {
              if (!done) {
                done = true;
                clearTimeout(timeoutId);
                resolve(networkResponse);
              }
              if (networkResponse.ok) {
                cache.put(fullUrl, networkResponse.clone());
              }
              currentlyFetching.delete(fullUrl);

              networkResponse
                .clone()
                .text()
                .then((networkResponseText) => {
                  if (
                    cacheContent !== null &&
                    cacheContent !== networkResponseText
                  ) {
                    // notify the client that the cache has been updated
                    if (cacheUpdatedTimer) {
                      clearTimeout(cacheUpdatedTimer);
                    }
                    cacheUpdatedTimer = setTimeout(() => {
                      CHANNEL.postMessage({
                        from: "@frank-mayer/service-worker",
                        type: "cache-updated",
                      });
                    }, 3000);
                  }
                });
            });
          }
        }
      })
      .catch((err) => {
        // on error, return internal server error
        const message =
          typeof err === "string"
            ? err
            : "message" in err
            ? err.message
            : "name" in err
            ? err.name
            : "toString" in err
            ? err.toString()
            : err;
        resolve(new Response(message, { status: 500 }));
      });
  });

CHANNEL.addEventListener("message", async (ev) => {
  if (
    ev.data.from === "@frank-mayer/service-worker/client" &&
    ev.data.type === "clear-cache"
  ) {
    await caches.delete(CACHE_NAME);
    await self.clients.claim();

    CHANNEL.postMessage({
      from: "@frank-mayer/service-worker",
      type: "clear-cache",
    });
  }
});
