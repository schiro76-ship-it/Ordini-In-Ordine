/* OrdinInOrdine — sito marketing — consenso cookie + Google Analytics (GA4)
   Nessuna richiesta viene inviata a domini Google prima che l'utente scelga
   "Accetta". Dettagli: app/privacy.html#cookie
   Aggiunto: 21 settembre 2026 */
(function () {
  "use strict";

  var GA_MEASUREMENT_ID = "G-ZS0HJQELK4";
  var STORAGE_KEY = "oio_ga_consent";
  var PRIVACY_URL = "app/privacy.html#cookie";

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(status) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ status: status, ts: new Date().toISOString() })
      );
    } catch (e) {}
  }

  function loadGA() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf("XXXX") !== -1) return; // ID non ancora configurato
    if (window.__oioGaLoaded) return;
    window.__oioGaLoaded = true;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    // Solo statistiche di provenienza/campagna: niente Google Signals né
    // personalizzazione annunci (non facciamo remarketing).
    gtag("config", GA_MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function deleteGaCookies() {
    var names = document.cookie.split(";").map(function (c) {
      return c.split("=")[0].trim();
    });
    names.forEach(function (name) {
      if (/^_ga/.test(name)) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          name +
          "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." +
          location.hostname +
          ";";
      }
    });
  }

  function closeBanner(banner) {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
  }

  function buildBanner() {
    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Messaggio sui cookie");

    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<div class="cookie-banner-text">' +
          '<strong>Cookie e statistiche</strong>' +
          '<span>Statistiche anonime sui visitatori, niente pubblicità personalizzata. ' +
            '<a href="' + PRIVACY_URL + '">Maggiori informazioni</a>' +
          '</span>' +
        '</div>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="cookie-btn cookie-btn-reject">Rifiuta</button>' +
          '<button type="button" class="cookie-btn cookie-btn-accept">Accetta</button>' +
        '</div>' +
      '</div>';

    // Inserito come primo elemento del body: raggiungibile con Tab subito,
    // senza rubare il focus alla pagina (pattern GOV.UK cookie banner).
    document.body.insertBefore(banner, document.body.firstChild);

    banner.querySelector(".cookie-btn-accept").addEventListener("click", function () {
      setConsent("granted");
      loadGA();
      closeBanner(banner);
    });
    banner.querySelector(".cookie-btn-reject").addEventListener("click", function () {
      setConsent("denied");
      deleteGaCookies();
      closeBanner(banner);
    });
  }

  function showBanner() {
    if (document.querySelector(".cookie-banner")) return;
    buildBanner();
  }

  // Link "Preferenze cookie" nel footer: permette di riaprire il banner e
  // cambiare scelta in qualsiasi momento (revoca inclusa).
  window.oioOpenCookiePreferences = function () {
    showBanner();
  };

  document.addEventListener("DOMContentLoaded", function () {
    var consent = getConsent();
    if (consent && consent.status === "granted") {
      loadGA();
    } else if (!consent) {
      showBanner();
    }
    // Se consent.status === "denied", non facciamo nulla: nessuno script
    // Google viene caricato finché l'utente non cambia idea dal footer.
  });
})();
