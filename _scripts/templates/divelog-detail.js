// _scripts/templates/divelog-detail.js

function escapeYaml(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function renderDivelogDetail(dive) {
  const slug = dive.slug?.current || dive._id;
  const title = dive.title || 'Duiklog';
  const dateStr = dive.date
    ? new Date(dive.date).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const teaserUrl = dive.photos?.[0]?.url || null;
  const headerImageHtml = teaserUrl
    ? `<img src="${teaserUrl}" alt="${title}" class="divelog-detail__hero">`
    : '';

  const metaHtml = [
    dateStr ? `<span class="divelog-detail__date"><i class="fas fa-calendar-alt"></i> ${dateStr}</span>` : '',
    dive.location ? `<span class="divelog-detail__location"><i class="fas fa-map-marker-alt"></i> ${dive.location}</span>` : '',
  ].filter(Boolean).join('\n      ');

  const descHtml = dive.descriptionHTML || '';
  const galleryPhotos = dive.photos && dive.photos.length > 0 ? dive.photos : [];

  const galleryHtml = galleryPhotos.length > 0
    ? `<div class="divelog-detail__gallery" id="diveGallery">
${galleryPhotos.map((p, i) => `  <figure class="divelog-detail__gallery-item" data-index="${i}">
    <img src="${p.url}" alt="${p.alt || title}" loading="lazy">
    ${p.caption ? `<figcaption>${p.caption}</figcaption>` : ''}
  </figure>`).join('\n')}
</div>

<!-- Lightbox -->
<div id="diveLightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="Foto weergave">
  <button class="lightbox__close" id="lightboxClose" aria-label="Sluiten">&times;</button>
  <button class="lightbox__nav lightbox__nav--prev" id="lightboxPrev" aria-label="Vorige foto">&#8249;</button>
  <div class="lightbox__img-wrap">
    <img id="lightboxImg" src="" alt="">
    <p id="lightboxCaption" class="lightbox__caption"></p>
  </div>
  <button class="lightbox__nav lightbox__nav--next" id="lightboxNext" aria-label="Volgende foto">&#8250;</button>
  <div class="lightbox__counter" id="lightboxCounter"></div>
</div>`
    : '';

  const galleryScript = galleryPhotos.length > 0
    ? `<script>
(function() {
  // Move lightbox to <body> to escape any stacking context from page wrappers
  var lb = document.getElementById('diveLightbox');
  document.body.appendChild(lb);

  var photos = ${JSON.stringify(galleryPhotos.map(p => ({ url: p.url, alt: p.alt || title, caption: p.caption || '' })))};
  var current = 0;
  var lbImg = document.getElementById('lightboxImg');
  var lbCaption = document.getElementById('lightboxCaption');
  var lbCounter = document.getElementById('lightboxCounter');

  function show(index) {
    current = (index + photos.length) % photos.length;
    var p = photos[current];
    lbImg.src = p.url;
    lbImg.alt = p.alt;
    lbCaption.textContent = p.caption;
    lbCaption.style.display = p.caption ? 'block' : 'none';
    lbCounter.textContent = (current + 1) + ' / ' + photos.length;
    lb.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('#diveGallery .divelog-detail__gallery-item').forEach(function(fig) {
    fig.addEventListener('click', function() { show(parseInt(fig.dataset.index)); });
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(parseInt(fig.dataset.index)); }
    });
  });

  document.getElementById('lightboxClose').addEventListener('click', close);
  document.getElementById('lightboxPrev').addEventListener('click', function() { show(current - 1); });
  document.getElementById('lightboxNext').addEventListener('click', function() { show(current + 1); });
  lb.addEventListener('click', function(e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('lightbox--open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  var touchStartX = 0;
  lb.addEventListener('touchstart', function(e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? show(current + 1) : show(current - 1); }
  }, { passive: true });
})();
</script>`
    : '';

  return {
    slug,
    content: `---
layout: single
title: "${escapeYaml(title)}"
author_profile: false
---

<div class="divelog-detail">
  ${headerImageHtml}

  <div class="divelog-detail__meta">
    ${metaHtml}
  </div>

  <div class="divelog-detail__body">
    ${descHtml}
  </div>

  ${galleryHtml}

  <a href="/duiklogs/" class="btn btn--inverse">&larr; Terug naar duiklogs</a>
</div>

${galleryScript}

<style>
.divelog-detail__hero {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.divelog-detail__meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: #555;
}
.divelog-detail__meta span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.divelog-detail__body p {
  line-height: 1.7;
}
.divelog-detail__gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 2rem 0;
}
.divelog-detail__gallery-item {
  cursor: pointer;
  margin: 0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
.divelog-detail__gallery-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  transition: background 0.2s;
  border-radius: 6px;
}
.divelog-detail__gallery-item:hover::after,
.divelog-detail__gallery-item:focus::after {
  background: rgba(0,0,0,0.18);
}
.divelog-detail__gallery-item:focus {
  outline: 2px solid #0077b6;
  outline-offset: 2px;
}
.divelog-detail__gallery-item img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.divelog-detail__gallery-item:hover img {
  transform: scale(1.04);
}
.divelog-detail__gallery-item figcaption {
  font-size: 0.82rem;
  text-align: center;
  padding: 0.3rem 0.5rem;
  color: #666;
}

/* Lightbox */
.lightbox {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.lightbox--open {
  display: flex;
}
.lightbox__img-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
  max-height: 85vh;
}
.lightbox__img-wrap img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  display: block;
  user-select: none;
}
.lightbox__caption {
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 0.6rem;
  text-align: center;
  max-width: 70vw;
}
.lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 2.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.lightbox__close:hover { opacity: 1; }
.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  font-size: 3rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  opacity: 0.75;
  transition: opacity 0.15s, background 0.15s;
  user-select: none;
}
.lightbox__nav:hover { opacity: 1; background: rgba(255,255,255,0.22); }
.lightbox__nav--prev { left: 0.75rem; }
.lightbox__nav--next { right: 0.75rem; }
.lightbox__counter {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.65);
  font-size: 0.88rem;
}
@media (max-width: 600px) {
  .lightbox__nav { font-size: 2rem; padding: 0.2rem 0.6rem; }
  .lightbox__close { font-size: 2rem; }
}
</style>
`,
  };
}
