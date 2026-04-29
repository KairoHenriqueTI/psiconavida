#!/usr/bin/env node
/*
 Fetch public tables from Supabase using the publishable key and write SQL INSERTs.
 Also download images referenced by `image` fields into ../public/uploads

 Usage: node export_via_anon.js
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// lightweight env loader (avoid adding dotenv dependency)
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// try to load env from project root then server/.env
const rootEnv = path.resolve(__dirname, '..', '..', '.env');
const serverEnv = path.resolve(__dirname, '..', '.env');
function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  const content = fs.readFileSync(file, 'utf8');
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2];
    // strip surrounding quotes
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const env = Object.assign({}, process.env, loadEnv(rootEnv), loadEnv(serverEnv));
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !PUBLISHABLE_KEY) {
  console.error('VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not set in env');
  process.exit(1);
}

const outDir = path.resolve(__dirname, '..', 'dumps');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const uploadsDir = path.resolve(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const tables = ['categories', 'posts', 'site_content', 'user_roles'];

function escapeSql(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'object') {
    // JSON object -> store as JSON literal
    return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  }
  // Date detection
  if (typeof v === 'string' && /^(\d{4}-\d{2}-\d{2}T|\d{4}-\d{2}-\d{2} )/.test(v)) {
    return `'${v.replace(/'/g, "''")}'`;
  }
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function fetchTable(table) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?select=*`;
  const res = await fetch(url, {
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed fetching ${table}: ${res.status} ${txt}`);
  }
  return res.json();
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}`));
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Fetching tables from', SUPABASE_URL);
  const sqlLines = [];
  for (const t of tables) {
    try {
      const rows = await fetchTable(t);
      fs.writeFileSync(path.join(outDir, `${t}.json`), JSON.stringify(rows, null, 2));
      if (!rows || rows.length === 0) {
        console.log(`Table ${t}: empty`);
        continue;
      }
      for (const r of rows) {
        const cols = Object.keys(r);
        const vals = cols.map((c) => escapeSql(r[c]));
        sqlLines.push(`INSERT INTO public.${t} (${cols.join(',')}) VALUES (${vals.join(',')});`);

        // If there's an image field with a path, download it
        if (r.image && typeof r.image === 'string') {
          let imagePath = r.image.trim();
          let url = null;
          // If the field already contains an absolute URL, use it directly
          if (/^https?:\/\//i.test(imagePath)) {
            url = imagePath;
          } else {
            // remove any leading slash
            imagePath = imagePath.replace(/^\//, '');
            // sometimes the value already contains the full storage url duplicated; avoid double-prefix
            if (imagePath.includes(SUPABASE_URL)) {
              // extract the path after the storage base if present
              const idx = imagePath.indexOf('/storage/v1/object/public/');
              if (idx !== -1) {
                url = imagePath.slice(idx);
                url = SUPABASE_URL.replace(/\/$/, '') + url;
              } else {
                url = SUPABASE_URL.replace(/\/$/, '') + '/storage/v1/object/public/cms-images/' + imagePath;
              }
            } else {
              url = SUPABASE_URL.replace(/\/$/, '') + '/storage/v1/object/public/cms-images/' + imagePath;
            }
          }
          const filename = path.basename(url.split('?')[0]);
          const dest = path.join(uploadsDir, filename);
          try {
            // skip if already exists
            if (!fs.existsSync(dest)) {
              console.log('Downloading image', url);
              // eslint-disable-next-line no-await-in-loop
              await downloadFile(url, dest);
            }
          } catch (e) {
            console.warn('Failed to download image', url, e.message);
          }
        }
      }
      console.log(`Fetched ${rows.length} rows from ${t}`);
    } catch (e) {
      console.error(`Error fetching ${t}:`, e.message);
    }
  }

  const outSql = path.join(outDir, 'export_from_supabase.sql');
  fs.writeFileSync(outSql, sqlLines.join('\n'));
  console.log('Wrote SQL to', outSql);
  console.log('JSON copies saved to', outDir);
  console.log('Images saved (when available) to', uploadsDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
