const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getMessaging} = require("firebase-admin/messaging");

initializeApp();

exports.notificaNuovoOrdine = onDocumentUpdated(
  {document: "dati/{uid}", region: "europe-west1"},
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (!after) return;

    // Rispetta l'interruttore "notifica nuovo ordine" nelle Impostazioni (default: attiva)
    if (after.notifNuovoOrdine === false) return;

    const ordsBefore = before?.ords || [];
    const ordsAfter = after?.ords || [];

    // Un nuovo ordine è stato aggiunto solo se l'array è più lungo di prima
    if (ordsAfter.length <= ordsBefore.length) return;

    // Troviamo gli ordini nuovi confrontando il contenuto
    const beforeSet = new Set(ordsBefore.map((o) => JSON.stringify(o)));
    const nuoviOrdini = ordsAfter.filter((o) => !beforeSet.has(JSON.stringify(o)));

    if (nuoviOrdini.length === 0) return;

    // fcmTokens è una mappa {deviceId: token} — un token per dispositivo
    const tokensMap = after.fcmTokens || {};
    const deviceScrivente = after.lastDeviceId || null;

    // Escludiamo il dispositivo che ha scritto l'ordine: non serve notificare chi l'ha appena creato
    const tokenEntries = Object.entries(tokensMap)
      .filter(([deviceId]) => deviceId !== deviceScrivente)
      .filter(([, token]) => typeof token === "string" && token.length > 0);

    console.log(`Dispositivo scrivente: ${deviceScrivente}`);
    console.log(`Dispositivi totali registrati: ${Object.keys(tokensMap).length}, destinatari dopo esclusione: ${tokenEntries.length}`);

    if (tokenEntries.length === 0) return;

    const tokens = tokenEntries.map(([, token]) => token);
    const nomeCliente = nuoviOrdini[0].cliente || "un cliente";

    // Messaggio "data-only" (niente blocco "notification"): con "notification" presente,
    // l'SDK Firebase Messaging del Service Worker mostra automaticamente una sua notifica,
    // in aggiunta a quella mostrata manualmente da onBackgroundMessage in sw.js, causando
    // un doppione. Con solo "data", la visualizzazione resta esclusivamente responsabilità
    // del nostro codice. I valori devono essere tutti stringhe (requisito FCM per "data").
    const message = {
      data: {
        title: "Nuovo ordine",
        body: `Ordine aggiunto per ${nomeCliente}`,
      },
      tokens: tokens,
    };

    try {
      const response = await getMessaging().sendEachForMulticast(message);
      console.log(`Notifiche inviate: ${response.successCount}/${tokens.length}`);
      // Log dettagliato per ogni destinatario: quale device, esito, ed eventuale motivo del fallimento
      response.responses.forEach((r, i) => {
        const [deviceId] = tokenEntries[i];
        if (r.success) {
          console.log(`  OK ${deviceId}: inviata con successo`);
        } else {
          console.log(`  FALLITA ${deviceId}: ${r.error?.code || "errore sconosciuto"} — ${r.error?.message || ""}`);
        }
      });
    } catch (error) {
      console.error("Errore invio notifica:", error);
    }
  }
);
