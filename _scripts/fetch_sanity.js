import fetch from 'node-fetch'; // or require('node-fetch') if using CommonJS
import fs from 'fs';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_TOKEN;

function getImageUrl(image) {
  if (!image || !image.asset || !image.asset._ref) return null;
  const ref = image.asset._ref;
  const parts = ref.split('-');
  const id = parts[1];
  const dims = parts[2];
  const format = parts[3];
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${format}`;
}

async function fetchType(type) {
  const query = `*[_type=="${type}"]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  return json.result.map(item => {
    if (type === 'dive' && item.photos) {
      item.photos = item.photos.map(p => ({
        url: getImageUrl(p),
        caption: p.caption || "",
        alt: p.alt || ""
      }));
    }
    if (type === 'page' && item.mainImage) {
      item.mainImage = {
        url: getImageUrl(item.mainImage),
        alt: item.mainImage.alt || "",
        caption: item.mainImage.caption || ""
      };
    }
    return item;
  });
}

async function main() {
  const pages = await fetchType('page');
  const dives = await fetchType('dive');

  fs.writeFileSync('_data/pages.json', JSON.stringify(pages, null, 2));
  fs.writeFileSync('_data/dives.json', JSON.stringify(dives, null, 2));
}

main();