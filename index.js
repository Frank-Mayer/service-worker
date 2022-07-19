const $62949b4493919097$export$b087472abae6d2a = async ()=>{};


const $faf1f3875f7c7772$export$e538f94cc8cf4db8 = [];
const $faf1f3875f7c7772$export$83d89fbfd8236492 = "sw_000001";
const $faf1f3875f7c7772$export$14b7e2c312f27acd = "sw-cache";


const $d5f6fcc947396926$var$currentlyFetching = new Map();
const $d5f6fcc947396926$var$cacheMatchOptionsSameOrigin = {
    ignoreSearch: true,
    ignoreMethod: true
};
const $d5f6fcc947396926$export$47572a522c09dea5 = (ev)=>new Promise(async (resolve, reject)=>{
        const url = new URL(ev.request.url);
        const fullUrl = url.origin + url.pathname;
        let done = false;
        console.debug("fetching", fullUrl);
        const timeoutId = setTimeout(()=>{
            if (!done) {
                console.debug("fetching timeout", fullUrl);
                reject(new Error("fetching timeout"));
            }
        }, 10000);
        caches.open((0, $faf1f3875f7c7772$export$14b7e2c312f27acd)).then((cache)=>{
            cache.match(fullUrl, $d5f6fcc947396926$var$cacheMatchOptionsSameOrigin).then((cachedResponse)=>{
                if (cachedResponse && !done) {
                    done = true;
                    clearTimeout(timeoutId);
                    resolve(cachedResponse);
                    console.debug("cache hit", fullUrl);
                }
            }).catch((err)=>{
                console.error(err);
            });
            if ($d5f6fcc947396926$var$currentlyFetching.has(fullUrl)) $d5f6fcc947396926$var$currentlyFetching.get(fullUrl).then((response)=>{
                if (!done) {
                    done = true;
                    clearTimeout(timeoutId);
                    resolve(response.clone());
                    console.debug("from network (cloned)", fullUrl);
                }
            });
            else {
                const fetchPromise = fetch(fullUrl, {
                    method: ev.request.method,
                    headers: ev.request.headers,
                    body: ev.request.body,
                    redirect: "follow"
                });
                $d5f6fcc947396926$var$currentlyFetching.set(fullUrl, fetchPromise);
                fetchPromise.then((networkResponse)=>{
                    if (!done) {
                        done = true;
                        clearTimeout(timeoutId);
                        resolve(networkResponse);
                        console.debug("from network", fullUrl);
                    }
                    cache.put(fullUrl, networkResponse.clone());
                    $d5f6fcc947396926$var$currentlyFetching.delete(fullUrl);
                });
            }
        }).catch(reject);
    });



const $7e5ea790c1754515$export$820f6522f9e3e880 = async ()=>{
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.filter((cacheName)=>cacheName !== (0, $faf1f3875f7c7772$export$14b7e2c312f27acd)).map((cacheName)=>caches.delete(cacheName)));
};


self.addEventListener("install", (ev)=>{
    ev.waitUntil((0, $62949b4493919097$export$b087472abae6d2a)().then(()=>self.skipWaiting()));
});
self.addEventListener("fetch", (ev)=>{
    try {
        if (!ev.request.url.startsWith(self.location.origin)) return;
        // Prevent Chrome Developer Tools error:
        // Failed to execute 'fetch' on 'ServiceWorkerGlobalScope': 'only-if-cached' can be set only with 'same-origin' mode
        // See also https://stackoverflow.com/a/49719964/1217468
        if (ev.request.cache === "only-if-cached" && ev.request.mode !== "same-origin") return;
        ev.respondWith((0, $d5f6fcc947396926$export$47572a522c09dea5)(ev).catch(()=>{
            console.error("fetch failed", ev);
        }));
    } catch (err) {
        console.error(err, ev);
    }
});
self.addEventListener("activate", (event)=>{
    event.waitUntil((0, $7e5ea790c1754515$export$820f6522f9e3e880)());
});


