// OrdinInOrdine — sito marketing — lightbox screenshot
// Al click su uno screenshot desktop, mostra TUTTI gli screenshot desktop
// della pagina insieme, affiancati (Ordini + Riepilogo hanno senso solo
// visti uno accanto all'altro, per apprezzare l'aggregazione automatica).
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

    function openLightbox() {
      overlay.classList.add('active');
    }

    function closeLightbox() {
      overlay.classList.remove('active');
    }

    shots.forEach(function (img) {
      img.addEventListener('click', openLightbox);
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });

    closeBtn.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  });
})();
