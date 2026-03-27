// _scripts/fetch_sanity.js
import fs from 'fs';
import { toHTML } from '@portabletext/to-html';
import fetch from 'node-fetch';
import { renderDivelogDetail } from './templates/divelog-detail.js';
import { renderCertificationDetail } from './templates/certification-detail.js';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_TOKEN;

// helper to convert Sanity images to URL
function getImageUrl(image) {
  if (!image || !image.asset || !image.asset._ref) return null;
  const ref = image.asset._ref;
  const parts = ref.split('-');
  const id = parts[1];
  const dims = parts[2];
  const format = parts[3];
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${format}`;
}

// Shared Portable Text → HTML renderer with block-image support
function portableTextToHTML(blocks) {
  return toHTML(blocks, {
    components: {
      types: {
        image: ({ value }) => {
          const url = getImageUrl(value);
          if (!url) return '';
          const alt = value.alt || '';
          const caption = value.caption || '';
          const alignment = value.alignment || 'center';
          const cls = `body-image body-image--${alignment}`;
          return `<figure class="${cls}">
  <img src="${url}" alt="${alt}" loading="lazy">
  ${caption ? `<figcaption>${caption}</figcaption>` : ''}
</figure>`;
        },
      },
      block: {
        normal: ({ children }) => `<p>${children}</p>`,
        h1: ({ children }) => `<h1>${children}</h1>`,
        h2: ({ children }) => `<h2>${children}</h2>`,
        h3: ({ children }) => `<h3>${children}</h3>`,
        h4: ({ children }) => `<h4>${children}</h4>`,
        blockquote: ({ children }) => `<blockquote>${children}</blockquote>`,
      },
      marks: {
        strong: ({ children }) => `<strong>${children}</strong>`,
        em: ({ children }) => `<em>${children}</em>`,
        code: ({ children }) => `<code>${children}</code>`,
        underline: ({ children }) => `<u>${children}</u>`,
        link: ({ value, children }) => `<a href="${value?.href}">${children}</a>`,
      },
    },
  });
}

async function fetchType(type) {
  const query = `*[_type=="${type}"]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();

  return json.result.map(item => {
    // convert description Portable Text to HTML
    if (item.description) {
      item.descriptionHTML = portableTextToHTML(item.description);
    }

    // convert images
    if (item.photos) {
      item.photos = item.photos.map(p => ({
        url: getImageUrl(p),
        caption: p.caption || "",
        alt: p.alt || ""
      }));
    }
    if (item.mainImage) {
      item.mainImage = {
        url: getImageUrl(item.mainImage),
        alt: item.mainImage.alt || "",
        caption: item.mainImage.caption || ""
      };
    }

    return item;
  });
}

async function fetchDivelogsOverview() {
  const query = `*[_id == "divelogsOverview"][0]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  const item = json.result;
  if (!item) {
    console.log('⚠️  No divelogsOverview document found in Sanity');
    return null;
  }
  if (item.body) {
    item.bodyHTML = portableTextToHTML(item.body);
  }
  return item;
}

async function fetchDives() {
  const query = `*[_type == "dive"] | order(date desc)`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();

  return json.result.map(item => {
    if (item.description) {
      item.descriptionHTML = portableTextToHTML(item.description);
    }
    if (item.photos) {
      item.photos = item.photos.map(p => ({
        url: getImageUrl(p),
        caption: p.caption || "",
        alt: p.alt || ""
      }));
    }
    return item;
  });
}

async function fetchHomePage() {
  const query = `*[_id == "homePage"][0]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();

  const item = json.result;
  if (!item) {
    console.log('⚠️  No homePage document found in Sanity');
    return null;
  }

  // Convert heroImage to URL
  if (item.heroImage) {
    item.heroImageUrl = getImageUrl(item.heroImage);
  }

  // Convert body Portable Text to HTML
  if (item.body) {
    item.bodyHTML = portableTextToHTML(item.body);
  }

  return item;
}

async function fetchAboutUs() {
  const query = `*[_id == "about-us"][0]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  const item = json.result;
  if (!item) {
    console.log('⚠️  No about-us document found in Sanity');
    return null;
  }
  if (item.heroImage) {
    item.heroImageUrl = getImageUrl(item.heroImage);
  }
  if (item.body) {
    item.bodyHTML = portableTextToHTML(item.body);
  }
  return item;
}

async function fetchCertificationsOverview() {
  const query = `*[_id == "certifications"][0]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  const item = json.result;
  if (!item) {
    console.log('⚠️  No certifications overview document found in Sanity');
    return null;
  }
  if (item.body) {
    item.bodyHTML = portableTextToHTML(item.body);
  }
  return item;
}

async function fetchCertifications() {
  const query = `*[_type == "certification"] | order(level asc)`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  return json.result.map(item => {
    if (item.description) {
      item.descriptionHTML = portableTextToHTML(item.description);
    }
    if (item.image) {
      item.imageUrl = getImageUrl(item.image);
    }
    return item;
  });
}

async function main() {
  const divelogsOverview = await fetchDivelogsOverview();
  if (divelogsOverview) {
    fs.writeFileSync('_data/divelogs_overview.json', JSON.stringify(divelogsOverview, null, 2));
    console.log('✅ Fetched divelogsOverview singleton from Sanity!');
  }

  const dives = await fetchDives();
  fs.writeFileSync('_data/dives.json', JSON.stringify(dives, null, 2));
  console.log(`✅ Fetched ${dives.length} dives from Sanity!`);

  // Generate individual dive log detail pages
  fs.mkdirSync('_divelogs', { recursive: true });
  for (const dive of dives) {
    const { slug, content } = renderDivelogDetail(dive);
    fs.writeFileSync(`_divelogs/${slug}.html`, content);
  }
  console.log(`✅ Generated ${dives.length} dive log detail pages in _divelogs/`);

  const homePage = await fetchHomePage();
  if (homePage) {
    fs.writeFileSync('_data/home_page.json', JSON.stringify(homePage, null, 2));
    console.log('✅ Fetched homePage singleton from Sanity!');
  }

  const aboutUs = await fetchAboutUs();
  if (aboutUs) {
    fs.writeFileSync('_data/about_us.json', JSON.stringify(aboutUs, null, 2));
    console.log('✅ Fetched about-us singleton from Sanity!');
  }

  const certificationsOverview = await fetchCertificationsOverview();
  if (certificationsOverview) {
    fs.writeFileSync('_data/certifications_overview.json', JSON.stringify(certificationsOverview, null, 2));
    console.log('✅ Fetched certifications overview from Sanity!');
  }

  const certifications = await fetchCertifications();
  fs.writeFileSync('_data/certifications.json', JSON.stringify(certifications, null, 2));
  console.log(`✅ Fetched ${certifications.length} certifications from Sanity!`);

  // Generate individual certification detail pages
  fs.mkdirSync('_certifications', { recursive: true });
  for (const cert of certifications) {
    const { slug, content } = renderCertificationDetail(cert);
    fs.writeFileSync(`_certifications/${slug}.html`, content);
  }
  console.log(`✅ Generated ${certifications.length} certification detail pages in _certifications/`);
}

main();