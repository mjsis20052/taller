// Service worker básico: habilita la instalabilidad de la PWA.
// Offline avanzado (caché, cola de fotos): fase futura — ver docs/02-arquitectura.md
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(self.clients.claim());
});
