import { CACHE_NAME } from "./globals";

const currentlyFetching = new Map<string, Promise<Response>>();

const cacheMatchOptionsSameOrigin: CacheOptions = {
  ignoreSearch: true,
  ignoreMethod: true,
};

/** stale while revalidate */
export const onFetch = (ev: FetchEvent) =>
  new Promise<Response>(async (resolve) => {
    const url = new URL(ev.request.url);
    const fullUrl = url.origin + url.pathname;
    let done = false;

    const timeoutId = setTimeout(() => {
      if (!done) {
        resolve(new Response("Network Timeout", { status: 503 }));
      }
    }, 10000);

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

        if (navigator.onLine) {
          if (currentlyFetching.has(fullUrl)) {
            currentlyFetching.get(fullUrl)!.then((response) => {
              if (!done) {
                done = true;
                clearTimeout(timeoutId);
                resolve(response.clone());
              }
            });
          } else {
            const fetchPromise = fetch(fullUrl, {
              method: ev.request.method,
              headers: ev.request.headers,
              body: ev.request.body,
              redirect: "follow",
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
            });
          }
        }
      })
      .catch((err) => {
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
