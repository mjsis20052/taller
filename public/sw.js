// Service worker: instalabilidad + una pantalla de "sin conexión"
// para cuando falla la navegación por falta de red. NO cachea datos
// del taller (clientes, OTs, etc.) — esos siempre vienen del
// servidor. Offline avanzado (cola de fotos, etc.): fase futura,
// ver docs/02-arquitectura.md.
const CACHE = "taller-shell-v1";
const URL_OFFLINE = "/offline";

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(URL_OFFLINE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.mode !== "navigate") return;

  evento.respondWith(
    fetch(evento.request).catch(() => caches.match(URL_OFFLINE)),
  );
});
