const C='jidelnicek-v075';
const A=['./?v=075','./index.html?v=075','./style.css?v=075','./app.js?v=075','./manifest.json?v=075','./icon-192.png','./icon-512.png','./maskable-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(x=>x.addAll(A)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>r).catch(()=>caches.match('./index.html?v=075')).then(r=>r||caches.match('./?v=075')));
  return;
 }
 if(['script','style','manifest'].includes(e.request.destination)){
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
  return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
