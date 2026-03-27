// _scripts/templates/certification-detail.js

function escapeYaml(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function renderCertificationDetail(cert) {
  const slug = cert.slug?.current || cert._id;
  const title = cert.title || 'Opleiding';
  const imageHtml = cert.imageUrl
    ? `<img src="${cert.imageUrl}" alt="${title}" class="certification-detail__image">`
    : `<img src="/assets/images/logo-duikteam-best.png" alt="${title}" class="certification-detail__image certification-detail__image--placeholder">`;
  const levelHtml = cert.level
    ? `<span class="certification-detail__level">${cert.level}</span>`
    : '';
  const descHtml = cert.descriptionHTML || '<p>Meer informatie volgt binnenkort.</p>';

  return {
    slug,
    content: `---
layout: single
title: "${escapeYaml(title)}"
author_profile: false
---

<div class="certification-detail">
  <div class="certification-detail__header">
    ${imageHtml}
    <div class="certification-detail__meta">
      ${levelHtml}
      <h1 class="certification-detail__title">${title}</h1>
    </div>
  </div>

  <div class="certification-detail__body">
    ${descHtml}
  </div>

  <a href="/opleidingen/" class="btn btn--inverse">&larr; Terug naar opleidingen</a>
</div>

<style>
.certification-detail {
  max-width: 800px;
  margin: 0 auto;
}
.certification-detail__header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.certification-detail__image {
  width: 240px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.certification-detail__image--placeholder {
  object-fit: contain;
  padding: 1rem;
  background: #f5f5f5;
}
.certification-detail__meta {
  flex: 1;
}
.certification-detail__level {
  display: inline-block;
  background: #0077b6;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
.certification-detail__title {
  margin-top: 0.5rem;
}
.certification-detail__body p {
  line-height: 1.7;
}
</style>
`,
  };
}
