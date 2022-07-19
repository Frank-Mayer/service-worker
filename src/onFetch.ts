import { CACHE_NAME } from "./globals";

const currentlyFetching = new Map<string, Promise<Response>>();

const cacheMatchOptionsSameOrigin: CacheOptions = {
  ignoreSearch: true,
  ignoreMethod: true,
};

/** stale while revalidate */
export const onFetch = (ev: FetchEvent) =>
  new Promise<Response>(async (resolve, reject) => {
    const url = new URL(ev.request.url);
    const fullUrl = url.origin + url.pathname;
    let done = false;
    console.debug("fetching", fullUrl);

    const timeoutId = setTimeout(() => {
      if (!done) {
        console.debug("fetching timeout", fullUrl);
        reject(new Error("fetching timeout"));
      }
    }, 10000);

    caches
      .open(CACHE_NAME)
      .then((cache) => {
        cache
          .match(fullUrl, cacheMatchOptionsSameOrigin)
          .then((cachedResponse) => {
            if (cachedResponse && !done) {
              done = true;
              clearTimeout(timeoutId);
              resolve(cachedResponse);
              console.debug("cache hit", fullUrl);
            }
          })
          .catch((err) => {
            console.error(err);
          });

        if (currentlyFetching.has(fullUrl)) {
          currentlyFetching.get(fullUrl)!.then((response) => {
            if (!done) {
              done = true;
              clearTimeout(timeoutId);
              resolve(response.clone());
              console.debug("from network (cloned)", fullUrl);
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
              console.debug("from network", fullUrl);
            }
            cache.put(fullUrl, networkResponse.clone());
            currentlyFetching.delete(fullUrl);
          });
        }
      })
      .catch(reject);
  });
