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
 * NOTIFICHE PUSH (FCM):
 * In precedenza gestite da un file separato (firebase-messaging-sw.js),
 * registrato senza scope esplicito nella stessa cartella di questo file:
 * due Service Worker con lo stesso scope di default si sovrascrivevano
 * a vicenda in modo silenzioso (nessun errore, solo perdita random
 * della registrazione), causando notifiche "inviate con successo" lato
 * server ma mai mostrate sul dispositivo. Unendo tutto in un solo file
 * si elimina il conflitto di scope alla radice.
 *
 * IMPORTANTE PER GLI AGGIORNAMENTI FUTURI:
 * Ogni volta che modifichi questo file (sw.js), incrementa il
 * numero in CACHE_NAME qui sotto (es. da 'v2' a 'v3'). Questo
 * garantisce che i client scarichino la nuova versione e puliscano
 * automaticamente la cache vecchia, invece di restare "bloccati"
 * su un comportamento precedente.
 * ---------------------------------------------------------
 */

const CACHE_NAME = 'ordininordine-cache-v3';

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

// --- Firebase Cloud Messaging: notifiche push in background/app chiusa ---
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyByjm6Hcp-4VhousgnJC5Jhf_oiQZLIrHo",
  authDomain: "ordini-in-ordine-f4966.firebaseapp.com",
  projectId: "ordini-in-ordine-f4966",
  storageBucket: "ordini-in-ordine-f4966.firebasestorage.app",
  messagingSenderId: "621333481193",
  appId: "1:621333481193:web:332edbad10053665239278"
});

const messaging = firebase.messaging();

// Gestisce le notifiche ricevute quando l'app è in background o chiusa
// Il messaggio arriva come "data" puro (non "notification"): questo evita
// che l'SDK Firebase Messaging mostri automaticamente una sua notifica in
// parallelo a questa mostrata manualmente, causando doppioni.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.data && payload.data.title) || "OrdinInOrdine";
  const options = {
    body: (payload.data && payload.data.body) || "",
    tag: "ordininordine-notifica"
  };
  self.registration.showNotification(title, options);
});
