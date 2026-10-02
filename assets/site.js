// OrdinInOrdine — sito marketing — lightbox screenshot
// Al click su uno screenshot desktop, mostra TUTTI gli screenshot desktop
// della pagina insieme, in colonna (stessa impostazione della coppia
// Ordini + Riepilogo nella hero, per coerenza visiva in tutto il sito).
// Su smartphone non serve: .shot-desktop è nascosta sotto gli 800px
// (vedi site.css), quindi il listener non trova nulla su cui agganciarsi.

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var shots = document.querySelectorAll('.app-shot .shot-desktop');
    if (!shots.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Chiudi');
    closeBtn.innerHTML = '&times;';
    overlay.appendChild(closeBtn);

    var imagesWrap = document.createElement('div');
    imagesWrap.className = 'lightbox-images';
    shots.forEach(function (img) {
      var clone = document.createElement('img');
      clone.src = img.currentSrc || img.src;
      clone.alt = img.alt || '';
      imagesWrap.appendChild(clone);
    });
    overlay.appendChild(imagesWrap);

    document.body.appendChild(overlay);

    // Accessibilità (EAA): finestra di dialogo vera, apribile anche da tastiera; mentre è aperta il
    // cursore resta dentro; Esc la chiude e riporta il cursore dove era.
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', "Schermate dell'app ingrandite");
    imagesWrap.setAttribute('tabindex', '0'); // l'area scorre: con la tastiera si scorre con le frecce
    var tornaA = null;

    function openLightbox() {
      tornaA = document.activeElement;
      overlay.classList.add('active');
      closeBtn.focus();
    }

    function closeLightbox() {
      if (!overlay.classList.contains('active')) return;
      overlay.classList.remove('active');
      if (tornaA && tornaA.focus) tornaA.focus();
      tornaA = null;
    }

    shots.forEach(function (img) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Ingrandisci le schermate' + (img.alt ? ': ' + img.alt : ''));
      img.addEventListener('click', openLightbox);
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
      });
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });

    closeBtn.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'Tab') {
        // Solo due elementi raggiungibili: il pulsante Chiudi e l'area delle immagini.
        var dentro = [closeBtn, imagesWrap];
        var i = dentro.indexOf(document.activeElement);
        e.preventDefault();
        dentro[(i + (e.shiftKey ? dentro.length - 1 : 1)) % dentro.length].focus();
      }
    });
  });
})();
