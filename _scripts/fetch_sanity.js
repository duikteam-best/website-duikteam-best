// _scripts/fetch_sanity.js
import fs from 'fs';
import { toHTML } from '@portabletext/to-html';
import fetch from 'node-fetch';

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

async function fetchType(type) {
  const query = `*[_type=="${type}"]`;
  const url = `https://${projectId}.api.sanity.io/v2023-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();

  return json.result.map(item => {
    // convert description Portable Text to HTML
    if (item.description) {
      item.descriptionHTML = toHTML(item.description, {
        block: (props) => `<p>${props.children.join('')}</p>`,
        marks: {
          strong: (text) => `<strong>${text}</strong>`,
          em: (text) => `<em>${text}</em>`,
          code: (text) => `<code>${text}</code>`
        }
      });
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

async function main() {
  const dives = await fetchType('dive');
  fs.writeFileSync('_data/dives.json', JSON.stringify(dives, null, 2));
  console.log('✅ Fetched and processed dives from Sanity!');
}

main();