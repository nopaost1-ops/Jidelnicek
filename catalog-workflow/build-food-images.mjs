import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { ZipArchive } from 'archiver';

fs.mkdirSync('catalog', { recursive: true });
const OUT = 'catalog/';
const W = +(process.env.IMAGE_WIDTH || 100);
const H = +(process.env.IMAGE_HEIGHT || 100);
const Q = +(process.env.WEBP_QUALITY || 68);
const START = Math.max(0, +(process.env.IMAGE_BATCH_START || 0));
const SIZE = Math.max(1, +(process.env.IMAGE_BATCH_SIZE || 1000));
const C = Math.max(1, +(process.env.IMAGE_CONCURRENCY || 24));
const TIMEOUT = Math.max(1000, +(process.env.IMAGE_TIMEOUT_MS || 8000));
const ua = process.env.USER_AGENT || 'JidelnicekPlus-ImageBuilder/3.0 (GitHub Actions)';
const cat = JSON.parse(fs.readFileSync(OUT + 'catalog-manifest.json'));
const products = cat.chunks.flatMap(x => JSON.parse(zlib.gunzipSync(fs.readFileSync(OUT + x.file))));
const batch = products.slice(START, Math.min(products.length, START + SIZE));
if (!batch.length) throw new Error(`Empty image batch: start=${START}, size=${SIZE}, products=${products.length}`);

fs.rmSync('.image-work', { recursive: true, force: true });
fs.mkdirSync('.image-work');

let prior = [];
if (fs.existsSync(OUT + 'image-index.json.gz')) {
  prior = JSON.parse(zlib.gunzipSync(fs.readFileSync(OUT + 'image-index.json.gz')));
}
const byEan = new Map(prior.map(x => [String(x.ean), x]));
const pending = batch.filter(p => !byEan.has(String(p.ean)));

function barcodePath(ean) {
  const code = String(ean || '').replace(/\D/g, '');
  if (code.length < 9) return code;
  return `${code.slice(0,3)}/${code.slice(3,6)}/${code.slice(6,9)}/${code.slice(9)}`;
}
function candidates(p) {
  const base = `https://images.openfoodfacts.org/images/products/${barcodePath(p.ean)}`;
  return [...new Set([
    p.imageSource,
    `${base}/front_cs.400.jpg`,
    `${base}/front_en.400.jpg`,
    `${base}/front.400.jpg`,
    `${base}/1.400.jpg`
  ].filter(Boolean))];
}
async function fetchImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': ua, Accept: 'image/*' }, signal: controller.signal });
    if (!r.ok || !String(r.headers.get('content-type') || '').startsWith('image/')) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch { return null; }
  finally { clearTimeout(timer); }
}

const added = [];
let done = 0, unavailable = 0, failed = 0;
async function one(p) {
  try {
    let source = null, raw = null;
    for (const url of candidates(p)) {
      raw = await fetchImage(url);
      if (raw) { source = url; break; }
    }
    if (!raw) { unavailable++; return; }
    const image = await sharp(raw).rotate().resize(W, H, { fit: 'contain', background: '#F2F6F3' }).webp({ quality: Q, effort: 4 }).toBuffer();
    const file = `${p.ean}.webp`;
    fs.writeFileSync(path.join('.image-work', file), image);
    added.push({ ean: String(p.ean), file, sourceHash: crypto.createHash('sha256').update(source).digest('hex'), bytes: image.length });
  } catch { failed++; }
  finally {
    done++;
    if (done % 100 === 0 || done === pending.length) console.log(`Batch ${START}-${START + batch.length - 1} | ${done}/${pending.length} | added ${added.length} | unavailable ${unavailable} | failed ${failed}`);
  }
}
for (let i = 0; i < pending.length; i += C) await Promise.all(pending.slice(i, i + C).map(one));

const existingChunks = fs.readdirSync('catalog').filter(f => /^image-chunk-\d+\.zip$/.test(f)).sort();
let newChunk = null;
if (added.length) {
  const next = existingChunks.reduce((m, f) => Math.max(m, +(f.match(/(\d+)/)?.[1] || 0)), 0) + 1;
  const file = `image-chunk-${String(next).padStart(4, '0')}.zip`;
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(OUT + file);
    const archive = new ZipArchive({ zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    for (const x of added) archive.file(path.join('.image-work', x.file), { name: x.file });
    archive.finalize();
  });
  const b = fs.readFileSync(OUT + file);
  newChunk = { file, images: added.length, size: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') };
  for (const x of added) byEan.set(x.ean, { ...x, chunk: file });
}

const records = [...byEan.values()].sort((a,b) => String(a.ean).localeCompare(String(b.ean)));
const ib = zlib.gzipSync(Buffer.from(JSON.stringify(records)), { level: 9 });
fs.writeFileSync(OUT + 'image-index.json.gz', ib);
const chunks = [...existingChunks, ...(newChunk ? [newChunk.file] : [])].map(file => {
  const b = fs.readFileSync(OUT + file);
  const count = records.filter(x => x.chunk === file).length;
  return { file, images: count, size: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') };
});
const index = { file:'image-index.json.gz', size:ib.length, sha256:crypto.createHash('sha256').update(ib).digest('hex') };
fs.writeFileSync(OUT + 'image-manifest.json', JSON.stringify({
  schemaVersion:3, snapshotId:cat.snapshotId, generatedAt:new Date().toISOString(), width:W, height:H,
  format:'webp', quality:Q, strategy:'incremental-ean-batches', products:products.length,
  processedThrough: Math.min(products.length, START + batch.length), batchStart:START, batchSize:batch.length,
  availableImages:records.length, missingImages:products.length-records.length,
  lastBatchAdded:added.length, lastBatchUnavailable:unavailable, lastBatchFailed:failed,
  index, totalCompressedBytes:chunks.reduce((n,x)=>n+x.size,ib.length), chunks
}, null, 2));
fs.rmSync('.image-work', { recursive:true, force:true });
console.log(`DONE batch ${START}-${START + batch.length - 1}; added ${added.length}; total images ${records.length}/${products.length}; next start ${Math.min(products.length, START + batch.length)}`);
