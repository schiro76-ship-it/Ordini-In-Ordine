// OrdinInOrdine — sito marketing — lightbox screenshot
// Ingrandisce al click gli screenshot desktop (.app-shot .shot-desktop).
// Su smartphone non serve: .shot-mobile è già a schermo quasi intero e
// .shot-desktop è nascosta sotto gli 800px (vedi site.css), quindi il
// listener non trova nulla su cui agganciarsi in quel contesto.

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var shots = document.querySelectorAll('.app-shot .shot-desktop');
    if (!shots.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Chiudi">&times;</button>' +
      '<img src="" alt="">';
    document.body.appendChild(overlay);

    var overlayImg = overlay.querySelector('img');
    var closeBtn = overlay.querySelector('.lightbox-close');

    function openLightbox(src, alt) {
      overlayImg.src = src;
      overlayImg.alt = alt || '';
      overlay.classList.add('active');
    }

    function closeLightbox() {
      overlay.classList.remove('active');
    }

    shots.forEach(function (img) {
      img.addEventListener('click', function () {
        openLightbox(img.currentSrc || img.src, img.alt);
      });
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
