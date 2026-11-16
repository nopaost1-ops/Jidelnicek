import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { Readable } from 'node:stream';

const SOURCE_URL=process.env.OFF_DUMP_URL||'https://static.openfoodfacts.org/data/openfoodfacts-products.jsonl.gz';
const MAX_UNCOMPRESSED_CHUNK=Number(process.env.MAX_UNCOMPRESSED_CHUNK||6291456);
const LOG_EVERY=Number(process.env.LOG_EVERY||100000);
const SNAPSHOT_ID=process.env.SNAPSHOT_ID||new Date().toISOString().replace(/[-:.]/g,'').replace('Z','Z');
const USER_AGENT=process.env.USER_AGENT||'JidelnicekPlus-CatalogBuilder/2.0 (GitHub Actions)';
const MANIFEST='catalog-manifest.json';
const CHUNK_RE=/^catalog-chunk-\d+\.json\.gz$/;
const now=()=>new Date().toISOString().slice(11,19);
const mb=n=>(Number(n||0)/1048576).toFixed(1);
const num=v=>Number.isFinite(Number(v))?Number(v):null;

console.log(`[${now()}] Snapshot ${SNAPSHOT_ID}: product build started`);
for(const n of fs.readdirSync('.')) if(CHUNK_RE.test(n)||n===MANIFEST) fs.rmSync(n);
const response=await fetch(SOURCE_URL,{headers:{'User-Agent':USER_AGENT}});
if(!response.ok||!response.body) throw new Error(`Open Food Facts dump HTTP ${response.status}`);
const contentLength=Number(response.headers.get('content-length')||0);
console.log(`[${now()}] OFF stream opened${contentLength?` (${mb(contentLength)} MiB gzip)`:''}`);
const rl=readline.createInterface({input:Readable.fromWeb(response.body).pipe(zlib.createGunzip()),crlfDelay:Infinity});
const byEan=new Map(); let scanned=0,rejected=0,czechCandidates=0,last=Date.now();
for await(const line of rl){
 if(!line.trim()) continue; scanned++;
 try{
  const p=JSON.parse(line),ean=String(p.code||'').replace(/\D/g,''),countries=Array.isArray(p.countries_tags)?p.countries_tags:[],name=String(p.product_name_cs||p.product_name||'').trim();
  if(!(ean.startsWith('859')||countries.includes('en:czech-republic'))||!/^\d{8,14}$/.test(ean)||!name){rejected++;}
  else{
   czechCandidates++; const n=p.nutriments||{};
   const imageSource=p.image_front_url||p.image_front_small_url||p.image_url||null;
   const item={ean,name,brand:String(p.brands||'').trim(),quantity:String(p.quantity||''),servingSize:String(p.serving_size||''),categories:Array.isArray(p.categories_tags)?p.categories_tags.slice(0,20):[],kcal:num(n['energy-kcal_100g']),kj:num(n['energy-kj_100g']),protein:num(n.proteins_100g),fat:num(n.fat_100g),saturatedFat:num(n['saturated-fat_100g']),carbs:num(n.carbohydrates_100g),sugars:num(n.sugars_100g),fiber:num(n.fiber_100g),salt:num(n.salt_100g),allergens:Array.isArray(p.allergens_tags)?p.allergens_tags:[],traces:Array.isArray(p.traces_tags)?p.traces_tags:[],additives:Array.isArray(p.additives_tags)?p.additives_tags:[],labels:Array.isArray(p.labels_tags)?p.labels_tags.slice(0,20):[],nutriScoreGrade:p.nutriscore_grade||null,novaGroup:num(p.nova_group),ingredients:String(p.ingredients_text_cs||p.ingredients_text||'').slice(0,4000),imageSource,modified:num(p.last_modified_t)};
   const old=byEan.get(ean); if(!old||(item.modified||0)>(old.modified||0)) byEan.set(ean,item);
  }
 }catch{rejected++;}
 if(scanned%LOG_EVERY===0){const secs=((Date.now()-last)/1000).toFixed(1);last=Date.now();console.log(`[${now()}] Scanned ${scanned.toLocaleString('en-US')} | CZ ${czechCandidates.toLocaleString('en-US')} | unique ${byEan.size.toLocaleString('en-US')} | rejected ${rejected.toLocaleString('en-US')} | ${secs}s/100k`)}
}
const selected=[...byEan.values()].sort((a,b)=>a.ean.localeCompare(b.ean));
console.log(`[${now()}] Scan finished. Exporting all ${selected.length.toLocaleString('en-US')} unique Czech products`);
const chunks=[];let batch=[],bytes=0,index=1;
function flush(){if(!batch.length)return;const file=`catalog-chunk-${String(index++).padStart(4,'0')}.json.gz`,raw=Buffer.from(JSON.stringify(batch)),gz=zlib.gzipSync(raw,{level:9});fs.writeFileSync(file,gz);const info={file,products:batch.length,size:gz.length,uncompressedSize:raw.length,sha256:crypto.createHash('sha256').update(gz).digest('hex')};chunks.push(info);console.log(`[${now()}] ${file}: ${info.products} products, ${mb(info.size)} MiB`);batch=[];bytes=0}
for(const item of selected){const b=Buffer.byteLength(JSON.stringify(item))+1;if(batch.length&&bytes+b>MAX_UNCOMPRESSED_CHUNK)flush();batch.push(item);bytes+=b}flush();
const manifest={schemaVersion:2,snapshotId:SNAPSHOT_ID,generatedAt:new Date().toISOString(),source:'Open Food Facts',license:'ODbL-1.0',products:selected.length,scanned,rejected,czechCandidates,uniqueCzechEan:byEan.size,totalCompressedBytes:chunks.reduce((n,c)=>n+c.size,0),chunks};
fs.writeFileSync(MANIFEST,JSON.stringify(manifest,null,2)+'\n');
console.log(`[${now()}] Product build DONE: ${selected.length} products, ${chunks.length} chunks`);
