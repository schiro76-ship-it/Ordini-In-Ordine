/**
 * sw.js — Service Worker di OrdinInOrdine
 * ---------------------------------------------------------
 * Strategia deliberatamente conservativa (network-first):
 * - Prova SEMPRE a scaricare la versione più recente dalla rete
 * - Usa la cache SOLO come riserva se manca la connessione
 * - Interviene SOLO sulle richieste GET dello stesso dominio
 *   (il file HTML dell'app) — ogni altra richiesta (Firebase,
 *   Firestore, CDN esterni come Tabler Icons o Google Fonts)
 *   passa invariata, senza alcuna interferenza
 *
 * IMPORTANTE PER GLI AGGIORNAMENTI FUTURI:
 * Ogni volta che modifichi questo file (sw.js), incrementa il
 * numero in CACHE_NAME qui sotto (es. da 'v1' a 'v2'). Questo
 * garantisce che i client scarichino la nuova versione e puliscano
 * automaticamente la cache vecchia, invece di restare "bloccati"
 * su un comportamento precedente.
 * ---------------------------------------------------------
 */

const CACHE_NAME = 'ordininordine-cache-v1';

self.addEventListener('install', function(event) {
  // Attiva subito la nuova versione, senza attendere la chiusura di tutte le schede aperte
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(nomiCache) {
      return Promise.all(
        nomiCache
          .filter(function(nome) { return nome !== CACHE_NAME; })
          .map(function(nome) { return caches.delete(nome); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  const richiesta = event.request;

  // Interviene SOLO su richieste GET dello stesso dominio.
  // Tutto il resto (Firestore, Firebase Auth, CDN esterni) passa
  // invariato: il browser lo gestisce normalmente, senza che il
  // Service Worker lo tocchi in alcun modo.
  let stessoOrigine = false;
  try {
    stessoOrigine = new URL(richiesta.url).origin === self.location.origin;
  } catch (e) {
    stessoOrigine = false;
  }
  if (richiesta.method !== 'GET' || !stessoOrigine) {
    return;
  }

  event.respondWith(
    fetch(richiesta)
      .then(function(risposta) {
        const copia = risposta.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(richiesta, copia);
        });
        return risposta;
      })
      .catch(function() {
        // Nessuna connessione: prova a rispondere con l'ultima versione salvata in cache
        return caches.match(richiesta);
      })
  );
});
