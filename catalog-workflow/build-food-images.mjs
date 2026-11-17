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
const N = +(process.env.IMAGES_PER_CHUNK || 500);
const C = +(process.env.IMAGE_CONCURRENCY || 24);
const TIMEOUT = +(process.env.IMAGE_TIMEOUT_MS || 12000);
const ua = process.env.USER_AGENT || 'JidelnicekPlus-ImageBuilder/2.0 (GitHub Actions)';
const cat = JSON.parse(fs.readFileSync(OUT + 'catalog-manifest.json'));
const products = cat.chunks.flatMap(x => JSON.parse(zlib.gunzipSync(fs.readFileSync(OUT + x.file))));

for (const f of fs.readdirSync('catalog')) {
  if (/^image-chunk-\d+\.zip$/.test(f) || ['image-manifest.json', 'image-index.json.gz'].includes(f)) fs.rmSync(OUT + f);
}
fs.rmSync('.image-work', { recursive: true, force: true });
fs.mkdirSync('.image-work');

function barcodePath(ean) {
  const code = String(ean || '').replace(/\D/g, '');
  if (code.length < 9) return code;
  return `${code.slice(0,3)}/${code.slice(3,6)}/${code.slice(6,9)}/${code.slice(9)}`;
}
function candidates(p) {
  const out = [];
  if (p.imageSource) out.push(p.imageSource);
  const base = `https://images.openfoodfacts.org/images/products/${barcodePath(p.ean)}`;
  out.push(`${base}/front_cs.400.jpg`, `${base}/front_en.400.jpg`, `${base}/front.400.jpg`, `${base}/1.400.jpg`);
  return [...new Set(out)];
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

const rec = [];
let done = 0, failed = 0, unavailable = 0;
async function one(p) {
  try {
    let source = null, raw = null;
    for (const url of candidates(p)) {
      raw = await fetchImage(url);
      if (raw) { source = url; break; }
    }
    if (!raw) { unavailable++; return; }
    const b = await sharp(raw).rotate().resize(W, H, { fit: 'contain', background: '#F2F6F3' }).webp({ quality: Q, effort: 6 }).toBuffer();
    const file = `${p.ean}.webp`;
    fs.writeFileSync(path.join('.image-work', file), b);
    rec.push({ ean: p.ean, file, sourceHash: crypto.createHash('sha256').update(source).digest('hex'), bytes: b.length });
  } catch { failed++; }
  finally {
    done++;
    if (done % 250 === 0 || done === products.length) console.log(`Images ${done}/${products.length} | ok ${rec.length} | unavailable ${unavailable} | failed ${failed}`);
  }
}
for (let i = 0; i < products.length; i += C) await Promise.all(products.slice(i, i + C).map(one));
rec.sort((a,b) => a.ean.localeCompare(b.ean));
if (products.length && rec.length === 0) throw new Error('IMAGE BUILD FAILED: no Open Food Facts product images were found by EAN');

const chunks = [];
async function zip(items, i) {
  const file = `image-chunk-${String(i).padStart(4,'0')}.zip`;
  await new Promise((ok,no) => {
    const out = fs.createWriteStream(OUT + file);
    const a = new ZipArchive({ zlib: { level: 9 } });
    out.on('close', ok); a.on('error', no); a.pipe(out);
    for (const x of items) a.file(path.join('.image-work', x.file), { name: x.file });
    a.finalize();
  });
  const b = fs.readFileSync(OUT + file);
  chunks.push({ file, images: items.length, size: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') });
}
for (let i=0,j=1; i<rec.length; i+=N) await zip(rec.slice(i,i+N),j++);
const ib = zlib.gzipSync(Buffer.from(JSON.stringify(rec)));
fs.writeFileSync(OUT + 'image-index.json.gz', ib);
const index = { file:'image-index.json.gz', size:ib.length, sha256:crypto.createHash('sha256').update(ib).digest('hex') };
fs.writeFileSync(OUT + 'image-manifest.json', JSON.stringify({
  schemaVersion:2, snapshotId:cat.snapshotId, generatedAt:new Date().toISOString(), width:W, height:H,
  format:'webp', quality:Q, sourceStrategy:'Open Food Facts EAN image paths', products:products.length,
  availableImages:rec.length, missingImages:products.length-rec.length, unavailableImages:unavailable,
  failedImages:failed, index, totalCompressedBytes:chunks.reduce((n,x)=>n+x.size,ib.length), chunks
}, null, 2));
fs.rmSync('.image-work', { recursive:true, force:true });
