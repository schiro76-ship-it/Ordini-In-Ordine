// Service Worker dedicato a Firebase Cloud Messaging (notifiche push)
// Separato da sw.js esistente per non interferire con la logica PWA già in uso

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
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "OrdinInOrdine";
  const options = {
    body: (payload.notification && payload.notification.body) || "",
    tag: "ordininordine-notifica"
  };
  self.registration.showNotification(title, options);
});
