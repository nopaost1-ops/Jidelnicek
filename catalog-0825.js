'use strict';
// Open Food Facts catalog sync for Jidelnicek+ 0.8.25.
const CATALOG_LIMIT_0825=5000, CATALOG_PAGE_SIZE_0825=100, CATALOG_DELAY_0825=7000;
const DOWNLOAD_HARD_LIMIT_0826=20*1024*1024,DOWNLOAD_SOFT_LIMIT_0826=17*1024*1024,REQUEST_RESERVE_0826=3*1024*1024;
const CATALOG_DB_0825='JidelnicekFoodCatalog', CATALOG_STORE_0825='foods', META_STORE_0825='meta', PAGE_LOG_STORE_0834='pageLog';
const CATALOG_CATS_0825=['Ovoce','Zelenina','Maso a ryby','Mléčné výrobky','Vejce','Obiloviny a přílohy','Luštěniny','Ořechy a semena','Tuky a oleje','Nápoje','Ostatní'];
let catalogCancel0825=false,catalogRunning0825=false,catalogTimer0825=null;
const sleep0825=ms=>new Promise(r=>catalogTimer0825=setTimeout(r,ms));
function mb0826(bytes){return (Number(bytes||0)/1024/1024).toLocaleString('cs-CZ',{minimumFractionDigits:1,maximumFractionDigits:1})}
async function fetchJsonMeasured0826(url){const response=await fetch(url,{headers:{Accept:'application/json'}});if(response.status===429)return{response,bytes:0,data:null};const buffer=await response.arrayBuffer(),bytes=buffer.byteLength,text=new TextDecoder().decode(buffer);let data;try{data=JSON.parse(text)}catch{throw new Error('Open Food Facts vrátil neplatná data.')}return{response,bytes,data}}
function catalogDb0825(){return new Promise((ok,no)=>{const r=indexedDB.open(CATALOG_DB_0825,2);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(CATALOG_STORE_0825)){const s=d.createObjectStore(CATALOG_STORE_0825,{keyPath:'ean'});s.createIndex('nameLower','nameLower');s.createIndex('category','category');s.createIndex('updatedAt','updatedAt')}if(!d.objectStoreNames.contains(META_STORE_0825))d.createObjectStore(META_STORE_0825);if(!d.objectStoreNames.contains(PAGE_LOG_STORE_0834)){const p=d.createObjectStore(PAGE_LOG_STORE_0834,{keyPath:'key'});p.createIndex('checkedAt','checkedAt');p.createIndex('mode','mode')} };r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function catalogMetaGet0825(key){const d=await catalogDb0825();return new Promise((ok,no)=>{const r=d.transaction(META_STORE_0825).objectStore(META_STORE_0825).get(key);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function catalogMetaPut0825(key,value){const d=await catalogDb0825();return new Promise((ok,no)=>{const t=d.transaction(META_STORE_0825,'readwrite');t.objectStore(META_STORE_0825).put(value,key);t.oncomplete=ok;t.onerror=()=>no(t.error)})}
const PAGE_LOG_TTL_0834=30*24*60*60*1000;
async function pageLogGet0834(key){const d=await catalogDb0825();return new Promise((ok,no)=>{const r=d.transaction(PAGE_LOG_STORE_0834).objectStore(PAGE_LOG_STORE_0834).get(key);r.onsuccess=()=>ok(r.result||null);r.onerror=()=>no(r.error)})}
async function pageLogPut0834(value){const d=await catalogDb0825();return new Promise((ok,no)=>{const t=d.transaction(PAGE_LOG_STORE_0834,'readwrite');t.objectStore(PAGE_LOG_STORE_0834).put(value);t.oncomplete=ok;t.onerror=()=>no(t.error)})}
async function pageLogCount0834(){const d=await catalogDb0825();return new Promise((ok,no)=>{const r=d.transaction(PAGE_LOG_STORE_0834).objectStore(PAGE_LOG_STORE_0834).count();r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
function pageLogKey0834(page){return `cz:last_modified_t:${CATALOG_PAGE_SIZE_0825}:${page}`}
function pageLogFresh0834(x){return !!x&&Date.now()-new Date(x.checkedAt).getTime()<PAGE_LOG_TTL_0834}
async function catalogCount0825(){const d=await catalogDb0825();return new Promise((ok,no)=>{const r=d.transaction(CATALOG_STORE_0825).objectStore(CATALOG_STORE_0825).count();r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function catalogBatchPut0825(items){if(!items.length)return;const d=await catalogDb0825();return new Promise((ok,no)=>{const t=d.transaction(CATALOG_STORE_0825,'readwrite'),s=t.objectStore(CATALOG_STORE_0825);items.forEach(x=>s.put(x));t.oncomplete=ok;t.onerror=()=>no(t.error)})}
async function catalogAll0825(){const d=await catalogDb0825();return new Promise((ok,no)=>{const r=d.transaction(CATALOG_STORE_0825).objectStore(CATALOG_STORE_0825).getAll();r.onsuccess=()=>ok(r.result||[]);r.onerror=()=>no(r.error)})}
function num0825(v){const n=Number(v);return Number.isFinite(n)?n:null}
function mapCategory0825(p){const tags=(p.categories_tags||[]).join(' ').toLowerCase(),name=((p.product_name_cs||p.product_name||'')+' '+(p.categories||'')).toLowerCase();const x=tags+' '+name;
 if(/fruit|ovoce|apple|banana|citrus|berries/.test(x))return'Ovoce';
 if(/vegetable|zelenin|tomato|cucumber|pepper|carrot/.test(x))return'Zelenina';
 if(/meat|poultry|fish|seafood|maso|ryb|chicken|beef|pork/.test(x))return'Maso a ryby';
 if(/milk|dairy|yogurt|cheese|mlé|mlek|sýr|tvaroh/.test(x))return'Mléčné výrobky';
 if(/egg|vejce/.test(x))return'Vejce';
 if(/legume|pulse|lentil|bean|chickpea|luště/.test(x))return'Luštěniny';
 if(/nut|seed|ořech|orech|semín|semen/.test(x))return'Ořechy a semena';
 if(/oil|fat|butter|olej|tuk/.test(x))return'Tuky a oleje';
 if(/beverage|drink|water|juice|nápoj|napoj|voda/.test(x))return'Nápoje';
 if(/cereal|bread|pasta|rice|grain|flour|pečiv|peciv|chléb|chleb|rýž|ryz|těstovin|testovin|obil/.test(x))return'Obiloviny a přílohy';
 return'Ostatní'}
const EMULSIFIER_CODES_0827=new Set(['e322','e400','e401','e402','e403','e404','e405','e406','e407','e407a','e410','e412','e413','e414','e415','e416','e418','e420','e421','e422','e425','e426','e427','e430','e431','e432','e433','e434','e435','e436','e440','e442','e444','e445','e450','e451','e452','e459','e460','e461','e462','e463','e464','e465','e466','e468','e469','e470a','e470b','e471','e472a','e472b','e472c','e472d','e472e','e472f','e473','e474','e475','e476','e477','e479b','e481','e482','e483','e491','e492','e493','e494','e495']);
function additiveCode0827(tag){return String(tag||'').toLowerCase().replace(/^..:/,'').replace(/[^a-z0-9]/g,'')}
function normalizeAdditives0827(p){const tags=Array.isArray(p.additives_tags)?p.additives_tags:[];return tags.map(tag=>{const code=additiveCode0827(tag);return{code:code.toUpperCase(),tag:String(tag),isEmulsifier:EMULSIFIER_CODES_0827.has(code)}})}
function compactIngredients0827(p){return(Array.isArray(p.ingredients)?p.ingredients:[]).slice(0,100).map(i=>({id:i.id||null,text:i.text||null,percent:num0825(i.percent_estimate??i.percent),vegan:i.vegan||null,vegetarian:i.vegetarian||null}))}
function normalizeProduct0825(p){const n=p.nutriments||{},ean=String(p.code||'').trim(),name=String(p.product_name_cs||p.product_name||'').trim();if(!/^\d{8,14}$/.test(ean)||!name)return null;
 const kcal=num0825(n['energy-kcal_100g']),kj=num0825(n['energy-kj_100g']??n.energy_100g),protein=num0825(n.proteins_100g),fat=num0825(n.fat_100g),carbs=num0825(n.carbohydrates_100g),fiber=num0825(n.fiber_100g),salt=num0825(n.salt_100g);
 if([kcal,kj,protein,fat,carbs,fiber,salt].some(v=>v===null))return null;
 const additives=normalizeAdditives0827(p);return{ean,id:'off-'+ean,name,nameLower:name.toLocaleLowerCase('cs'),brand:String(p.brands||''),category:mapCategory0825(p),offCategories:p.categories_tags||[],kcal,kj,p:protein,f:fat,c:carbs,fiber,salt,sat:num0825(n['saturated-fat_100g']),sugar:num0825(n.sugars_100g),allergens:(p.allergens_tags||[]).map(x=>String(x).replace(/^..:/,'')),additives,additiveTags:p.additives_tags||[],additivesCount:num0825(p.additives_n)??additives.length,emulsifiers:additives.filter(x=>x.isEmulsifier),ingredients:compactIngredients0827(p),ingredientsText:String(p.ingredients_text_cs||p.ingredients_text||''),ingredientTags:p.ingredients_tags||[],stores:p.stores_tags||[],source:'Open Food Facts',sourceUrl:`https://world.openfoodfacts.org/product/${ean}`,updatedAt:new Date().toISOString(),prices:{Penny:null,BILLA:null,Albert:null,Tesco:null},available:{}}}
function catalogUrl0825(page){const fields=['code','product_name','product_name_cs','brands','categories','categories_tags','nutriments','allergens_tags','stores_tags','additives_n','additives_tags','ingredients','ingredients_text','ingredients_text_cs','ingredients_tags'].join(',');return `https://world.openfoodfacts.org/api/v2/search?countries_tags_en=czech-republic&page=${page}&page_size=${CATALOG_PAGE_SIZE_0825}&fields=${encodeURIComponent(fields)}&sort_by=last_modified_t`}
function ensureCatalogUi0825(){if(document.getElementById('refreshCatalog0825'))return;const foods=document.getElementById('foods'),card=foods?.querySelector('.card');if(!card)return;card.insertAdjacentHTML('beforeend',`<div class="catalogActions0825"><button id="refreshCatalog0825" class="primary" type="button" onclick="confirmCatalogRefresh0825()">Obnovit katalog potravin</button><button type="button" onclick="showCatalogStatus0825()">Stav katalogu</button></div><div id="catalogMeta0825" class="catalogMeta0825">Katalog Open Food Facts nebyl načten.</div>`);document.body.insertAdjacentHTML('beforeend',`<dialog id="catalogDialog0825" class="catalogDialog0825"><div class="dialogHead"><h2 id="catalogTitle0825">Obnova katalogu</h2><button type="button" onclick="catalogDialog0825.close()">×</button></div><div id="catalogBody0825"></div></dialog>`);updateCatalogMeta0825()}
async function updateCatalogMeta0825(){const el=document.getElementById('catalogMeta0825');if(!el)return;const count=await catalogCount0825(),meta=await catalogMetaGet0825('sync');el.innerHTML=`Katalog: <b>${count.toLocaleString('cs-CZ')}</b> produktů · Poslední obnova: <b>${meta?.completedAt?new Date(meta.completedAt).toLocaleString('cs-CZ'):'nikdy'}</b><br>Zdroj: Open Food Facts (ODbL), komunitní data mohou být neúplná nebo nepřesná.`}
window.confirmCatalogRefresh0825=async function(){if(catalogRunning0825)return;const count=await catalogCount0825(),state=await catalogMetaGet0825('sync'),paused=['paused-data-limit','paused-user','paused-error'].includes(state?.status);document.getElementById('catalogBody0825').innerHTML=`<p>Synchronizace se spustí pouze po stisku tlačítka <b>Spustit</b>. Nikdy neprobíhá automaticky ani na pozadí.</p><div class="catalogNotice0825">Datový limit jednoho ručně spuštěného běhu je 20 MiB. Při dosažení limitu se průběh uloží a pokračování vyžaduje další ruční spuštění.</div><label>Režim<select id="catalogMode0826"><option value="quick">Rychlá aktualizace</option><option value="fill">Doplnit katalog do 5 000</option><option value="full">Úplná kontrola katalogu</option></select></label><p>Aktuálně uloženo: <b>${count.toLocaleString('cs-CZ')}</b>${paused?` · nedokončená obnova od stránky ${state.page||1}`:''}</p><menu><button type="button" onclick="catalogDialog0825.close()">Zrušit</button><button class="primary" type="button" onclick="startCatalogRefresh0826()">${paused?'Pokračovat ručně':'Spustit'}</button></menu>`;document.getElementById('catalogDialog0825').showModal()}
function syncView0825(s){const dataPct=Math.min(100,Math.round((s.downloadedBytes||0)/DOWNLOAD_HARD_LIMIT_0826*100));document.getElementById('catalogBody0825').innerHTML=`<progress class="catalogProgress0825" max="5000" value="${s.accepted}"></progress><div class="catalogStats0825"><span>Režim</span><b>${s.mode}</b><span>Cíl katalogu</span><b>5 000</b><span>Staženo záznamů</span><b>${s.scanned.toLocaleString('cs-CZ')}</b><span>Produktů v katalogu</span><b>${s.accepted.toLocaleString('cs-CZ')}</b><span>Přeskočeno</span><b>${s.skipped.toLocaleString('cs-CZ')}</b><span>Nové na poslední stránce</span><b>${(s.newOnLastPage||0).toLocaleString('cs-CZ')}</b><span>Stránek v logu</span><b>${s.pagesLogged||0}</b><span>Přeskočeno dle logu</span><b>${s.pagesSkippedFromLog||0}</b><span>Stránek bez nového EAN</span><b>${s.noChangePages||0}</b><span>Data tohoto běhu</span><b>${mb0826(s.downloadedBytes)} / 20 MiB</b></div><progress class="catalogProgress0825" max="100" value="${dataPct}"></progress><p>${s.downloadedBytes>=DOWNLOAD_SOFT_LIMIT_0826?'Blíží se datový limit. Další dávka se již nespustí.':`Stránka API: ${s.page}.`}</p><button class="catalogCancel0825" type="button" onclick="cancelCatalogRefresh0825()">Zrušit obnovu</button>`}
window.startCatalogRefresh0826=async function(){
  if(catalogRunning0825)return;
  if(!navigator.onLine)return alert('Obnova katalogu vyžaduje připojení k internetu.');
  const mode=document.getElementById('catalogMode0826')?.value||'quick';
  catalogRunning0825=true;catalogCancel0825=false;
  const previous=await catalogMetaGet0825('sync');
  const canResume=previous&&['paused-data-limit','paused-user','paused-error'].includes(previous.status)&&previous.mode===mode;
  const actualCount=await catalogCount0825();
  let state=canResume?{...previous}:{page:1,scanned:0,saved:0,skipped:0};
  state.accepted=actualCount; // jediný autoritativní počet = unikátní EAN v IndexedDB
  state.catalogCount=actualCount;
  state.mode=mode;state.trigger='manual';state.startedByUser=true;state.status='running';
  state.downloadedBytes=0;state.downloadLimitBytes=DOWNLOAD_HARD_LIMIT_0826;state.startedAt=new Date().toISOString();state.updatedAt=state.startedAt;
  state.error=null;state.retryReason=null;state.serverRetryCount=0;state.noChangePages=0;state.duplicatePages=0;state.lastPageSignature=null;
  const existingProducts=await catalogAll0825();
  const knownEans=new Set(existingProducts.map(x=>x.ean));
  const startPage=state.page||1;
  const QUICK_MAX_PAGES_0830=10;
  let pagesProcessed=0;
  document.getElementById('catalogTitle0825').textContent='Ruční obnova katalogu';
  syncView0825(state);
  try{
    while(!catalogCancel0825){
      state.accepted=await catalogCount0825();state.catalogCount=state.accepted;
      if(mode==='fill'&&state.accepted>=CATALOG_LIMIT_0825){state.status='completed';break}
      if(mode==='quick'&&pagesProcessed>=QUICK_MAX_PAGES_0830){state.status='completed';break}
      const pageKey0834=pageLogKey0834(state.page),logged0834=await pageLogGet0834(pageKey0834);
      if(mode!=='full'&&pageLogFresh0834(logged0834)){state.pagesSkippedFromLog=(state.pagesSkippedFromLog||0)+1;state.page++;state.updatedAt=new Date().toISOString();await catalogMetaPut0825('sync',state);syncView0825(state);continue}
      const remaining=DOWNLOAD_HARD_LIMIT_0826-state.downloadedBytes;
      if(remaining<REQUEST_RESERVE_0826||state.downloadedBytes>=DOWNLOAD_SOFT_LIMIT_0826){state.status='paused-data-limit';break}

      let result=null,requestOk=false,networkAttempts=0;
      while(!requestOk&&!catalogCancel0825){
        try{result=await fetchJsonMeasured0826(catalogUrl0825(state.page))}
        catch(err){networkAttempts++;state.retryReason='síťová chyba';state.updatedAt=new Date().toISOString();await catalogMetaPut0825('sync',state);syncView0825(state);if(networkAttempts>=3)throw err;await sleep0825(15000);continue}
        if(result.response.status===429){state.retryReason='HTTP 429';state.updatedAt=new Date().toISOString();await catalogMetaPut0825('sync',state);syncView0825(state);await sleep0825(60000);continue}
        if(result.response.status>=500&&result.response.status<600){networkAttempts++;state.retryReason=`HTTP ${result.response.status}`;state.updatedAt=new Date().toISOString();await catalogMetaPut0825('sync',state);syncView0825(state);if(networkAttempts>=3)throw new Error(`Open Food Facts API: HTTP ${result.response.status}`);await sleep0825(15000);continue}
        if(!result.response.ok)throw new Error(`Open Food Facts API: HTTP ${result.response.status}`);
        requestOk=true;
      }
      if(catalogCancel0825)break;
      state.retryReason=null;
      state.downloadedBytes+=result.bytes;
      if(state.downloadedBytes>DOWNLOAD_HARD_LIMIT_0826){state.status='paused-data-limit';break}
      const products=Array.isArray(result.data?.products)?result.data.products:[];
      if(!products.length){state.status='completed';state.completionReason='end-of-results';break}
      const pageCodes=products.map(p=>String(p?.code||'')).filter(Boolean);
      const pageSignature=pageCodes.join('|');
      if(pageSignature&&pageSignature===state.lastPageSignature){state.duplicatePages=(state.duplicatePages||0)+1}else state.duplicatePages=0;
      state.lastPageSignature=pageSignature;
      if(state.duplicatePages>=2){state.status='completed';state.completionReason='duplicate-pages';break}

      const normalized=[];
      for(const rawProduct of products){
        state.scanned++;
        const x=normalizeProduct0825(rawProduct);
        if(!x){state.skipped++;continue}
        const exists=knownEans.has(x.ean);
        if(!exists&&state.accepted>=CATALOG_LIMIT_0825){state.skipped++;continue}
        if(!exists){knownEans.add(x.ean);state.accepted++}
        normalized.push(x)
      }
      const beforeCount=state.accepted;
      await catalogBatchPut0825(normalized);
      mergeMaterialized0825(normalized);
      state.saved+=normalized.length;
      state.accepted=await catalogCount0825();state.catalogCount=state.accepted;
      const newOnPage=Math.max(0,state.accepted-beforeCount);
      state.newOnLastPage=newOnPage;
      state.noChangePages=newOnPage===0?(state.noChangePages||0)+1:0;
      await pageLogPut0834({key:pageKey0834,page:state.page,mode,checkedAt:new Date().toISOString(),signature:pageSignature,apiCount:products.length,accepted:normalized.length,newProducts:newOnPage,bytes:result.bytes});state.pagesLogged=await pageLogCount0834();
      state.page++;pagesProcessed++;state.updatedAt=new Date().toISOString();
      await catalogMetaPut0825('sync',state);syncView0825(state);await updateCatalogMeta0825();
      if(mode==='fill'&&state.accepted>=CATALOG_LIMIT_0825){state.status='completed';state.completionReason='catalog-limit';break}
      if(mode==='fill'&&state.noChangePages>=20){state.status='completed';state.completionReason='no-new-products';break}
      await sleep0825(CATALOG_DELAY_0825)
    }
    if(catalogCancel0825){state.status='paused-user';state.cancelledAt=new Date().toISOString()}
    else if(state.status==='running')state.status='completed';
    if(state.status==='completed'){state.completedAt=new Date().toISOString()}
    state.accepted=await catalogCount0825();state.catalogCount=state.accepted;state.updatedAt=new Date().toISOString();
    await catalogMetaPut0825('sync',state);
    const reason=state.status==='paused-data-limit'?`Aktualizace byla pozastavena před překročením limitu. Staženo ${mb0826(state.downloadedBytes)} MiB z 20 MiB. Pokračování vyžaduje další ruční spuštění.`:state.status==='paused-user'?'Obnova byla zrušena. Pokračování vyžaduje další ruční spuštění.':state.completionReason==='duplicate-pages'?'Open Food Facts opakovaně vrátil stejnou stránku. Obnova byla bezpečně ukončena bez ztráty uložených dat.':state.completionReason==='no-new-products'?'Ve 20 po sobě jdoucích stránkách nebyl nalezen nový EAN. Režim Doplnit byl korektně ukončen.':mode==='fill'&&state.accepted>=CATALOG_LIMIT_0825?'Katalog dosáhl limitu 5 000 produktů.':mode==='quick'?'Rychlá aktualizace dokončila svou dávku.':'Synchronizace byla dokončena.';
    document.getElementById('catalogBody0825').innerHTML=`<div class="card catalogResult0825"><h3>${state.status==='completed'?'Obnova dokončena':'Obnova pozastavena'}</h3><p>${reason}</p><p>Produktů v katalogu: <b>${state.accepted.toLocaleString('cs-CZ')}</b> · Zkontrolováno v běhu: <b>${state.scanned.toLocaleString('cs-CZ')}</b> · Data běhu: <b>${mb0826(state.downloadedBytes)} MiB</b></p></div><button class="primary" type="button" onclick="catalogDialog0825.close()">Zavřít</button>`;
    await updateCatalogMeta0825();renderCatalogFoods0825()
  }catch(e){
    state.status='paused-error';state.error=String(e.message||e);state.accepted=await catalogCount0825();state.catalogCount=state.accepted;state.updatedAt=new Date().toISOString();await catalogMetaPut0825('sync',state);
    document.getElementById('catalogBody0825').innerHTML=`<div class="catalogNotice0825"><b>Obnovu se nepodařilo dokončit.</b><br>${String(e.message||e)}<br>Uložené produkty zůstaly zachované. Pokračování se spustí pouze dalším ručním stiskem tlačítka.</div><button type="button" onclick="catalogDialog0825.close()">Zavřít</button>`
  }finally{catalogRunning0825=false}
};
window.cancelCatalogRefresh0825=function(){catalogCancel0825=true};
function catalogStatusLabel0829(status){return({running:'🔄 Probíhá obnova',completed:'✅ Dokončená obnova','paused-data-limit':'⚠️ Pozastaveno: datový limit','paused-user':'⏸ Pozastaveno uživatelem','paused-error':'❌ Přerušeno chybou'})[status]||'–'}
  window.showCatalogStatus0825=async function(){const count=await catalogCount0825(),meta=await catalogMetaGet0825('sync');document.getElementById('catalogBody0825').innerHTML=`<h3>Lokální katalog</h3><div class="catalogStats0825"><span>Stav</span><b>${catalogStatusLabel0829(meta?.status)}</b><span>Produkty</span><b>${count.toLocaleString('cs-CZ')}</b><span>Poslední dokončení</span><b>${meta?.completedAt?new Date(meta.completedAt).toLocaleString('cs-CZ'):'–'}</b><span>Data posledního běhu</span><b>${mb0826(meta?.downloadedBytes||0)} / 20 MiB</b><span>Další stránka</span><b>${meta?.page||1}</b></div><p class="catalogSource0825">Open Food Facts · ODbL · data mohou být neúplná nebo nepřesná.</p><button class="primary" type="button" onclick="catalogDialog0825.close()">Zavřít</button>`;document.getElementById('catalogDialog0825').showModal()};
function availability0825(stores){const text=(stores||[]).join(' ').toLowerCase();return{Penny:text.includes('penny'),BILLA:text.includes('billa'),Albert:text.includes('albert'),Tesco:text.includes('tesco'),Lidl:text.includes('lidl'),Kaufland:text.includes('kaufland'),'Rohlik.cz':text.includes('rohlik')}}function catalogToLocal0825(x){return{id:x.id,name:x.name,category:x.category,kcal:x.kcal,kj:x.kj,p:x.p,c:x.c,f:x.f,sat:x.sat,sugar:x.sugar,fiber:x.fiber,salt:x.salt,allergens:(x.allergens||[]).join(', '),additives:x.additives||[],additiveTags:x.additiveTags||[],additivesCount:x.additivesCount??0,emulsifiers:x.emulsifiers||[],ingredients:x.ingredients||[],ingredientsText:x.ingredientsText||'',ingredientTags:x.ingredientTags||[],prices:{Penny:null,BILLA:null,Albert:null,Tesco:null},available:availability0825(x.stores),ean:x.ean,source:x.source,sourceUrl:x.sourceUrl,offUpdatedAt:x.updatedAt}}function mergeMaterialized0825(batch){let changed=false;for(const x of batch){const i=(db.foods||[]).findIndex(f=>f.ean===x.ean||f.id===x.id);if(i<0)continue;const old=db.foods[i],prices=old.prices||{Penny:null,BILLA:null,Albert:null,Tesco:null};db.foods[i]={...old,name:x.name,category:x.category,kcal:x.kcal,kj:x.kj,p:x.p,c:x.c,f:x.f,sat:x.sat,sugar:x.sugar,fiber:x.fiber,salt:x.salt,allergens:(x.allergens||[]).join(', '),additives:x.additives||[],additiveTags:x.additiveTags||[],additivesCount:x.additivesCount??0,emulsifiers:x.emulsifiers||[],ingredients:x.ingredients||[],ingredientsText:x.ingredientsText||'',ingredientTags:x.ingredientTags||[],available:{...availability0825(x.stores),...(old.available||{})},ean:x.ean,source:x.source,sourceUrl:x.sourceUrl,offUpdatedAt:x.updatedAt,prices};changed=true}if(changed)raw()}
window.materializeCatalogFood0825=function(ean,action){catalogAll0825().then(items=>{const x=items.find(i=>i.ean===ean);if(!x)return;let f=db.foods.find(i=>i.ean===ean||i.id===x.id);if(!f){f=catalogToLocal0825(x);db.foods.push(f);raw()}if(action==='edit')editFood(f.id);else{choose(f.id)}})};
async function renderCatalogFoods0825(){const list=document.getElementById('foodList');if(!list)return;const all=await catalogAll0825(),q=(document.getElementById('search')?.value||'').toLocaleLowerCase('cs'),cat=document.getElementById('cat')?.value||'',store=document.getElementById('foodStoreFilter')?.value||'';const localEans=new Set((db.foods||[]).map(x=>x.ean).filter(Boolean));const rows=all.filter(x=>!localEans.has(x.ean)&&(!q||x.nameLower.includes(q))&&(!cat||x.category===cat)&&(!store||(x.stores||[]).some(s=>String(s).toLowerCase().includes(store.toLowerCase())))).sort((a,b)=>a.category.localeCompare(b.category,'cs')||a.name.localeCompare(b.name,'cs')).slice(0,250);if(!rows.length)return;const wrap=document.createElement('div');wrap.id='catalogResults0825';wrap.innerHTML=`<h2 class="cat">Open Food Facts <span class="catalogOffBadge0825">${rows.length} zobrazeno</span></h2>`+rows.map(x=>`<div class="card catalogFood0825" onclick="materializeCatalogFood0825('${x.ean}','edit')"><b>${esc(x.name)}</b><small>${x.kcal} kcal · B ${fmt(x.p)} · S ${fmt(x.c)} · T ${fmt(x.f)} · EAN ${x.ean}</small><div class="catalogSource0825">Aditiva: ${x.additivesCount||0} · Emulgátory: ${(x.emulsifiers||[]).length}</div><div class="catalogSource0825">${esc(x.brand||'')} · ${esc(x.category)} · Open Food Facts</div></div>`).join('');document.getElementById('catalogResults0825')?.remove();list.appendChild(wrap)}
const baseRenderFoods0825=window.renderFoods;window.renderFoods=function(){baseRenderFoods0825();renderCatalogFoods0825()};
const baseRenderPicker0825=window.renderPicker;window.renderPicker=function(){baseRenderPicker0825();catalogAll0825().then(all=>{const body=document.getElementById('pickBody');if(!body)return;const q=(document.getElementById('pickSearch')?.value||'').toLocaleLowerCase('cs'),localEans=new Set((db.foods||[]).map(x=>x.ean).filter(Boolean));const rows=all.filter(x=>!localEans.has(x.ean)&&(!pCat||x.category===pCat)&&(!q||x.nameLower.includes(q))).slice(0,80);body.insertAdjacentHTML('beforeend',rows.map(x=>`<button onclick="materializeCatalogFood0825('${x.ean}','choose')"><b>${esc(x.name)}</b><small>${x.kcal} kcal/100 g · EAN ${x.ean}</small><div class="catalogSource0825">Aditiva: ${x.additivesCount||0} · Emulgátory: ${(x.emulsifiers||[]).length}</div><span class="catalogOffBadge0825">OFF</span></button>`).join(''))})};
function addCatalogCategories0825(){for(const id of ['cat','fCat']){const el=document.getElementById(id);if(!el)continue;for(const c of CATALOG_CATS_0825)if(![...el.options].some(o=>o.value===c||o.text===c))el.add(new Option(c,c))}const sf=document.getElementById('foodStoreFilter');if(sf)for(const store of ['Lidl','Kaufland','Rohlik.cz'])if(![...sf.options].some(o=>o.value===store||o.text===store))sf.add(new Option(store,store))}
document.addEventListener('DOMContentLoaded',()=>{ensureCatalogUi0825();addCatalogCategories0825();renderCatalogFoods0825()});
