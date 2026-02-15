const CACHE_NAME = "crusty-v8"; // nom/version du cache (si tu changes ça, ça force une "nouvelle version")

const ASSETS = [ // fichiers importants à mettre en cache à l'installation
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
];

// INSTALLATION des assets statiques en gros sa sert à faire du cache-first pour les assets critiques (index.html, style.css, app.js)
self.addEventListener("install", (event) => {
  // Ici on prépare le cache pendant l'installation du service worker
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME); // ouvre/crée le cache

      await Promise.allSettled(
        ASSETS.map((asset) => cache.add(new Request(asset, { cache: "reload" }))) // ajoute chaque fichier au cache
      );
    })()
  );
  self.skipWaiting(); // force l'installation immédiate (pas besoin d'attendre)
});

// ACTIVATION
self.addEventListener("activate", (event) => {
  // Ici on supprime les anciens caches (ancienne version)
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)) // supprime tout sauf le cache actuel
      )
    )
  );
  self.clients.claim(); // force l'update immédiate sur les pages ouvertes
});

// FETCH — NETWORK FIRST
self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes non-GET (POST, etc.)
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  // Évite les erreurs de cache sur des ressources externes (Google Maps, etc.)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    // stratégie: on essaye le réseau d'abord, sinon on prend le cache
    fetch(event.request)
      .then((response) => {
        const clone = response.clone(); // clone car une response ne peut être lue qu'une fois
        caches.open(CACHE_NAME).then((cache) => {
          // cache.put peut échouer sur certaines réponses Safari (opaque/stream)
          try {
            cache.put(event.request, clone); // met à jour le cache avec la nouvelle version
          } catch {
            // ignore
          }
        });
        return response; // on renvoie la réponse réseau
      })
      .catch(() => caches.match(event.request)) // si réseau KO: on renvoie ce qu'on a en cache
  );
});
