// _scripts/fetch_sanity.js
import fs from 'fs';
import { toHTML } from '@portabletext/to-html';
import fetch from 'node-fetch';
import { renderDivelogDetail } from './templates/divelog-detail.js';
import { renderCertificationDetail } from './templates/certification-detail.js';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_TOKEN;

// Convert a UTC datetime string to Europe/Amsterdam local time (no UTC offset suffix)
// so that Jekyll's Liquid date filter displays the correct local time.
function toAmsterdamTime(dateStr) {
  if (!dateStr) return dateStr;
  const date = new Date(dateStr);
  // sv-SE locale produces an ISO-like string: "YYYY-MM-DD HH:MM:SS"
  const local = date.toLocaleString('sv-SE', { timeZone: 'Europe/Amsterdam' });
  return local.replace(' ', 'T');
}

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

function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function buildSearchDoc({ title, sourceUrl, body }) {
  return `---\nlayout: single\ntitle: ${JSON.stringify(title || '')}\nsearch: true\n---\n\nBron: ${sourceUrl || ''}\n\n${body || ''}\n`;
}

function writeSanitySearchDocs({
  homePage,
  aboutUs,
  membershipPage,
  certificationsOverview,
  divelogsOverview,
  contactPage,
  activities,
  dives,
  certifications,
}) {
  const outDir = '_sanity_search';
  fs.mkdirSync(outDir, { recursive: true });

  const singletonDocs = [
    {
      file: 'home-page.md',
      title: homePage?.title || 'Home',
      sourceUrl: '/',
      body: htmlToText(homePage?.bodyHTML),
    },
    {
      file: 'over-ons.md',
      title: aboutUs?.title || 'Over ons',
      sourceUrl: '/over-ons/',
      body: htmlToText(aboutUs?.bodyHTML),
    },
    {
      file: 'lid-worden.md',
      title: membershipPage?.title || 'Lid worden',
      sourceUrl: '/lid-worden/',
      body: htmlToText(membershipPage?.bodyHTML),
    },
    {
      file: 'opleidingen-overzicht.md',
      title: certificationsOverview?.title || 'Opleidingen',
      sourceUrl: '/opleidingen/',
      body: htmlToText(certificationsOverview?.bodyHTML),
    },
    {
      file: 'duiklogs-overzicht.md',
      title: divelogsOverview?.title || 'Duiklogs',
      sourceUrl: '/duiklogs/',
      body: htmlToText(divelogsOverview?.bodyHTML),
    },
    {
      file: 'contact.md',
      title: contactPage?.title || 'Contact',
      sourceUrl: '/contact/',
      body: htmlToText(contactPage?.bodyHTML),
    },
  ];

  for (const doc of singletonDocs) {
    if (!doc.body) continue;
    fs.writeFileSync(`${outDir}/${doc.file}`, buildSearchDoc(doc));
  }

  for (const activity of activities || []) {
    const title = activity.title || activity.name || 'Activiteit';
    const body = [
      activity.subtitle,
      activity.location,
      activity.date,
      htmlToText(activity.descriptionHTML || ''),
      htmlToText(activity.bodyHTML || ''),
    ].filter(Boolean).join('\n\n');
    if (!body) continue;
    const slug = slugify(activity.slug?.current || activity._id || title);
    fs.writeFileSync(
      `${outDir}/activity-${slug}.md`,
      buildSearchDoc({ title, sourceUrl: '/activiteiten/', body })
    );
  }

  for (const dive of dives || []) {
    const title = dive.title || dive.name || 'Duik';
    const body = [
      dive.location,
      dive.date,
      htmlToText(dive.descriptionHTML || ''),
    ].filter(Boolean).join('\n\n');
    if (!body) continue;
    const slug = slugify(dive.slug?.current || dive._id || title);
    fs.writeFileSync(
      `${outDir}/dive-${slug}.md`,
      buildSearchDoc({ title, sourceUrl: `/duiklogs/${slug}/`, body })
    );
  }

  for (const cert of certifications || []) {
    const title = cert.title || 'Opleiding';
    const body = [
      cert.level,
      htmlToText(cert.descriptionHTML || ''),
    ].filter(Boolean).join('\n\n');
    if (!body) continue;
    const slug = slugify(cert.slug?.current || cert._id || title);
    fs.writeFileSync(
      `${outDir}/certification-${slug}.md`,
      buildSearchDoc({ title, sourceUrl: `/opleidingen/${slug}/`, body })
    );
  }
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

async function fetchMembershipPage() {
  const query = `*[_id == "membership-page"][0]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  const item = json.result;
  if (!item) {
    console.log('⚠️  No membership-page document found in Sanity');
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
  if (item.heroImage) {
    item.heroImageUrl = getImageUrl(item.heroImage);
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

async function fetchContactPage() {
  const query = `*[_id == "contact-page"][0]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  const item = json.result;
  if (!item) {
    console.log('⚠️  No contact-page document found in Sanity');
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

async function fetchActivities() {
  const query = `*[_type == "activity"] | order(date asc)`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();

  return json.result.map(item => {
    if (item.date) {
      item.date = toAmsterdamTime(item.date);
    }
    if (item.featuredImage) {
      item.featuredImage = {
        url: getImageUrl(item.featuredImage),
        alt: item.featuredImage.alt || '',
        caption: item.featuredImage.caption || '',
      };
    }
    if (item.gallery) {
      item.gallery = item.gallery.map(img => ({
        url: getImageUrl(img),
        alt: img.alt || '',
        caption: img.caption || '',
      }));
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

  const membershipPage = await fetchMembershipPage();
  if (membershipPage) {
    fs.writeFileSync('_data/membership_page.json', JSON.stringify(membershipPage, null, 2));
    console.log('✅ Fetched membership-page singleton from Sanity!');
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

  const contactPage = await fetchContactPage();
  if (contactPage) {
    fs.writeFileSync('_data/contact_page.json', JSON.stringify(contactPage, null, 2));
    console.log('✅ Fetched contact-page singleton from Sanity!');
  }

  const activities = await fetchActivities();
  fs.writeFileSync('_data/activities.json', JSON.stringify(activities, null, 2));
  console.log(`✅ Fetched ${activities.length} activities from Sanity!`);

  writeSanitySearchDocs({
    homePage,
    aboutUs,
    membershipPage,
    certificationsOverview,
    divelogsOverview,
    contactPage,
    activities,
    dives,
    certifications,
  });
  console.log('✅ Generated hidden search index documents in _sanity_search/');
}

main();