import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import archiver from 'archiver';

const WIDTH=Number(process.env.IMAGE_WIDTH||100),HEIGHT=Number(process.env.IMAGE_HEIGHT||100),QUALITY=Number(process.env.WEBP_QUALITY||68),PER_CHUNK=Number(process.env.IMAGES_PER_CHUNK||500),CONCURRENCY=Number(process.env.IMAGE_CONCURRENCY||8),USER_AGENT=process.env.USER_AGENT||'JidelnicekPlus-ImageBuilder/1.0';
const catalog=JSON.parse(fs.readFileSync('catalog-manifest.json','utf8'));const SNAPSHOT_ID=catalog.snapshotId;
const now=()=>new Date().toISOString().slice(11,19),mb=n=>(n/1048576).toFixed(1);let products=[];
for(const ch of catalog.chunks){const data=JSON.parse(zlib.gunzipSync(fs.readFileSync(ch.file)));products.push(...data)}
console.log(`[${now()}] Snapshot ${SNAPSHOT_ID}: image build for ${products.length} products`);
for(const n of fs.readdirSync('.'))if(/^image-chunk-\d+\.zip$/.test(n)||['image-manifest.json','image-index.json.gz'].includes(n))fs.rmSync(n);
fs.rmSync('.image-work',{recursive:true,force:true});fs.mkdirSync('.image-work');
const queue=products.filter(p=>p.imageSource);let done=0,available=0,missing=products.length-queue.length,failed=0;const records=[];
async function convert(p){try{const r=await fetch(p.imageSource,{headers:{'User-Agent':USER_AGENT}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const input=Buffer.from(await r.arrayBuffer());const webp=await sharp(input).rotate().resize(WIDTH,HEIGHT,{fit:'contain',background:'#F2F6F3'}).webp({quality:QUALITY,effort:6}).toBuffer();const file=`${p.ean}.webp`;fs.writeFileSync(path.join('.image-work',file),webp);records.push({ean:p.ean,file,source:p.imageSource,sourceHash:crypto.createHash('sha256').update(p.imageSource).digest('hex'),bytes:webp.length});available++}catch{failed++;missing++}finally{done++;if(done%250===0||done===queue.length)console.log(`[${now()}] Images ${done}/${queue.length} | available ${available} | missing ${missing} | failed ${failed}`)}}
for(let i=0;i<queue.length;i+=CONCURRENCY)await Promise.all(queue.slice(i,i+CONCURRENCY).map(convert));
records.sort((a,b)=>a.ean.localeCompare(b.ean));const chunks=[];
async function zipChunk(items,idx){const file=`image-chunk-${String(idx).padStart(4,'0')}.zip`;await new Promise((resolve,reject)=>{const output=fs.createWriteStream(file),archive=archiver('zip',{zlib:{level:9}});output.on('close',resolve);archive.on('error',reject);archive.pipe(output);for(const x of items)archive.file(path.join('.image-work',x.file),{name:x.file});archive.finalize()});const buf=fs.readFileSync(file),info={file,images:items.length,size:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')};chunks.push(info);console.log(`[${now()}] ${file}: ${info.images} images, ${mb(info.size)} MiB`)}
let idx=1;for(let i=0;i<records.length;i+=PER_CHUNK)await zipChunk(records.slice(i,i+PER_CHUNK),idx++);
const indexBuf=zlib.gzipSync(Buffer.from(JSON.stringify(records.map(({ean,file,sourceHash,bytes})=>({ean,file,sourceHash,bytes})))),{level:9});fs.writeFileSync('image-index.json.gz',indexBuf);
const manifest={schemaVersion:1,snapshotId:SNAPSHOT_ID,generatedAt:new Date().toISOString(),width:WIDTH,height:HEIGHT,format:'webp',quality:QUALITY,products:products.length,availableImages:available,missingImages:missing,failedImages:failed,index:{file:'image-index.json.gz',size:indexBuf.length,sha256:crypto.createHash('sha256').update(indexBuf).digest('hex')},totalCompressedBytes:chunks.reduce((n,c)=>n+c.size,0)+indexBuf.length,chunks};fs.writeFileSync('image-manifest.json',JSON.stringify(manifest,null,2)+'\n');fs.rmSync('.image-work',{recursive:true,force:true});console.log(`[${now()}] Image build DONE: ${available} images, ${chunks.length} chunks, ${mb(manifest.totalCompressedBytes)} MiB`);
