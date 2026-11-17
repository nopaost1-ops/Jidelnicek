import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { Readable } from 'node:stream';

fs.mkdirSync('catalog', { recursive: true });
const OUT = 'catalog/';
const url = process.env.OFF_DUMP_URL || 'https://static.openfoodfacts.org/data/openfoodfacts-products.jsonl.gz';
const id = process.env.SNAPSHOT_ID || new Date().toISOString().replace(/[-:.]/g, '');
const lim = +(process.env.MAX_UNCOMPRESSED_CHUNK || 6291456);
const each = +(process.env.LOG_EVERY || 100000);
const ua = process.env.USER_AGENT || 'JidelnicekPlus/2.2';

for (const f of fs.readdirSync('catalog')) {
  if (/^catalog-chunk-\d+\.json\.gz$/.test(f) || f === 'catalog-manifest.json') fs.rmSync(OUT + f);
}

const firstHttpUrl = value => {
  if (typeof value === 'string') return /^https?:\/\//i.test(value) ? value : null;
  if (!value || typeof value !== 'object') return null;
  for (const child of Object.values(value)) {
    const found = firstHttpUrl(child);
    if (found) return found;
  }
  return null;
};

const imageSourceOf = p =>
  p.image_front_url ||
  p.image_front_small_url ||
  p.image_url ||
  firstHttpUrl(p.selected_images?.front) ||
  firstHttpUrl(p.selected_images) ||
  firstHttpUrl(p.images) ||
  null;

const r = await fetch(url, { headers: { 'User-Agent': ua } });
if (!r.ok || !r.body) throw Error(`OFF HTTP ${r.status}`);
const lines = readline.createInterface({
  input: Readable.fromWeb(r.body).pipe(zlib.createGunzip()),
  crlfDelay: Infinity
});
const map = new Map();
let scanned = 0, rejected = 0, cz = 0, productsWithImageSource = 0;
const num = v => Number.isFinite(+v) ? +v : null;

for await (const line of lines) {
  scanned++;
  try {
    const p = JSON.parse(line);
    const ean = String(p.code || '').replace(/\D/g, '');
    const name = String(p.product_name_cs || p.product_name || '').trim();
    const countries = p.countries_tags || [];
    if (!(ean.startsWith('859') || countries.includes('en:czech-republic')) || !/^\d{8,14}$/.test(ean) || !name) {
      rejected++;
      continue;
    }
    cz++;
    const n = p.nutriments || {};
    const imageSource = imageSourceOf(p);
    const x = {
      ean,
      name,
      brand: p.brands || '',
      quantity: p.quantity || '',
      servingSize: p.serving_size || '',
      categories: p.categories_tags || [],
      kcal: num(n['energy-kcal_100g']),
      kj: num(n['energy-kj_100g']),
      protein: num(n.proteins_100g),
      fat: num(n.fat_100g),
      saturatedFat: num(n['saturated-fat_100g']),
      carbs: num(n.carbohydrates_100g),
      sugars: num(n.sugars_100g),
      fiber: num(n.fiber_100g),
      salt: num(n.salt_100g),
      allergens: p.allergens_tags || [],
      traces: p.traces_tags || [],
      additives: p.additives_tags || [],
      labels: p.labels_tags || [],
      nutriScoreGrade: p.nutriscore_grade || null,
      novaGroup: num(p.nova_group),
      ingredients: String(p.ingredients_text_cs || p.ingredients_text || '').slice(0, 4000),
      imageSource,
      modified: num(p.last_modified_t)
    };
    const old = map.get(ean);
    if (!old || (x.modified || 0) > (old.modified || 0)) map.set(ean, x);
  } catch {
    rejected++;
  }
  if (scanned % each === 0) console.log(`Scanned ${scanned.toLocaleString()} | CZ ${cz.toLocaleString()} | unique ${map.size.toLocaleString()}`);
}

const rows = [...map.values()].sort((a, b) => a.ean.localeCompare(b.ean));
productsWithImageSource = rows.filter(x => x.imageSource).length;
if (rows.length && productsWithImageSource === 0) {
  throw new Error('IMAGE SOURCE CHECK FAILED: catalog contains products but no usable imageSource URLs');
}
console.log(`Image sources: ${productsWithImageSource.toLocaleString()} / ${rows.length.toLocaleString()}`);

const chunks = [];
let batch = [], bytes = 0, i = 1;
function flush() {
  if (!batch.length) return;
  const file = `catalog-chunk-${String(i++).padStart(4, '0')}.json.gz`;
  const raw = Buffer.from(JSON.stringify(batch));
  const gz = zlib.gzipSync(raw, { level: 9 });
  fs.writeFileSync(OUT + file, gz);
  chunks.push({
    file,
    products: batch.length,
    size: gz.length,
    uncompressedSize: raw.length,
    sha256: crypto.createHash('sha256').update(gz).digest('hex')
  });
  batch = [];
  bytes = 0;
}
for (const x of rows) {
  const b = Buffer.byteLength(JSON.stringify(x)) + 1;
  if (batch.length && bytes + b > lim) flush();
  batch.push(x);
  bytes += b;
}
flush();
fs.writeFileSync(OUT + 'catalog-manifest.json', JSON.stringify({
  schemaVersion: 2,
  snapshotId: id,
  generatedAt: new Date().toISOString(),
  source: 'Open Food Facts',
  license: 'ODbL-1.0',
  products: rows.length,
  productsWithImageSource,
  scanned,
  rejected,
  czechCandidates: cz,
  totalCompressedBytes: chunks.reduce((n, x) => n + x.size, 0),
  chunks
}, null, 2));
console.log(`DONE ${rows.length} products, ${productsWithImageSource} image sources, ${chunks.length} chunks`);
