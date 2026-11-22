/* Jidelnicek+ v0.8.77 - larger images, fallbacks and scanner category focus */
(()=>{
  const PAGE_SIZE=50;
  let visibleLimit=PAGE_SIZE;
  let currentRows=[];
  let scannedEan0877="";
  const $i=id=>document.getElementById(id);
  const foodName=x=>String(x?.name||'').trim();
  const foodBrand=x=>String(x?.brand||'').trim();
  const foodEan=x=>String(x?.ean||'').trim();
  const foodCategory=x=>String(x?.category||'Ostatní');
  const energy=x=>Number.isFinite(Number(x?.kcal))?Math.round(Number(x.kcal)):null;
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs');
  function html(s){return typeof esc==='function'?esc(s):String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function localRows(){return (db.foods||[]).map(x=>({...x,_source:'local',_custom:!x.ean,_key:String(x.id)}))}
  async function mergedRows(){
    const locals=localRows(),byEan=new Set(locals.map(foodEan).filter(Boolean));
    let remote=[];try{remote=await catalogAll0825()}catch(e){console.warn('Catalog load failed',e)}
    remote=remote.filter(x=>!byEan.has(foodEan(x))).map(x=>({...x,_source:'off',_custom:false,_key:'off:'+foodEan(x)}));
    return locals.concat(remote)
  }
  function sortRows(rows,mode){
    const cmp=(a,b)=>foodName(a).localeCompare(foodName(b),'cs',{sensitivity:'base'});
    if(mode==='za')return rows.sort((a,b)=>-cmp(a,b));
    if(mode==='custom')return rows.sort((a,b)=>(Number(b._custom)-Number(a._custom))||cmp(a,b));
    return rows.sort(cmp)
  }
  async function filterRows(){
    const q=normalize($i('search')?.value||''),cat=window.selectedFoodCategory0859||'',sort='az';
    let rows=await mergedRows();
    rows=rows.filter(x=>(!cat||foodCategory(x)===cat)&&(!q||normalize(foodName(x)).includes(q)||normalize(foodBrand(x)).includes(q)||foodEan(x).includes(q)));
    rows=sortRows(rows,sort);
    if(scannedEan0877)rows.sort((a,b)=>Number(foodEan(b)===scannedEan0877)-Number(foodEan(a)===scannedEan0877));
    return rows
  }
  const PRODUCT_IMAGE_INDEX_URL='./catalog/image-index.json.gz';
  const productImageIndex0877=new Map(),productImageUrls0877=new Map(),productImageChunks0877=new Map();let productImageIndexPromise0877=null;
  async function decompress0877(blob,format){if(!('DecompressionStream'in window))throw new Error('DecompressionStream není podporován');return new Response(blob.stream().pipeThrough(new DecompressionStream(format))).arrayBuffer()}
  async function ensureProductImageIndex0877(){if(productImageIndexPromise0877)return productImageIndexPromise0877;productImageIndexPromise0877=(async()=>{const r=await fetch(PRODUCT_IMAGE_INDEX_URL,{cache:'force-cache'});if(!r.ok)throw new Error(`Image index HTTP ${r.status}`);const rows=JSON.parse(new TextDecoder().decode(await decompress0877(await r.blob(),'gzip')));rows.forEach(row=>{const e=String(row?.ean||'').replace(/\D/g,'');if(e&&row?.chunk&&row?.file)productImageIndex0877.set(e,{chunk:String(row.chunk),file:String(row.file)})});return productImageIndex0877})().catch(e=>{console.warn('Product image index',e);return productImageIndex0877});return productImageIndexPromise0877}
  const zipU160877=(v,o)=>v.getUint16(o,true),zipU320877=(v,o)=>v.getUint32(o,true);
  async function loadImageChunk0877(chunk){if(productImageChunks0877.has(chunk))return productImageChunks0877.get(chunk);const promise=(async()=>{const r=await fetch(`./catalog/${chunk}`,{cache:'force-cache'});if(!r.ok)throw new Error(`${chunk} HTTP ${r.status}`);const b=await r.arrayBuffer(),v=new DataView(b),bytes=new Uint8Array(b),entries=new Map();let eocd=-1;for(let i=b.byteLength-22;i>=Math.max(0,b.byteLength-65557);i--){if(zipU320877(v,i)===0x06054b50){eocd=i;break}}if(eocd<0)throw new Error('ZIP EOCD missing');const count=zipU160877(v,eocd+10);let pos=zipU320877(v,eocd+16);for(let i=0;i<count;i++){if(zipU320877(v,pos)!==0x02014b50)break;const method=zipU160877(v,pos+10),size=zipU320877(v,pos+20),nl=zipU160877(v,pos+28),xl=zipU160877(v,pos+30),cl=zipU160877(v,pos+32),lo=zipU320877(v,pos+42),name=new TextDecoder().decode(bytes.slice(pos+46,pos+46+nl)),ln=zipU160877(v,lo+26),le=zipU160877(v,lo+28),start=lo+30+ln+le;entries.set(name,{method,data:bytes.slice(start,start+size)});pos+=46+nl+xl+cl}return entries})();productImageChunks0877.set(chunk,promise);return promise}
  async function productImageUrl0877(ean){const code=String(ean||'').replace(/\D/g,'');if(!code)return'';if(productImageUrls0877.has(code))return productImageUrls0877.get(code);const promise=(async()=>{await ensureProductImageIndex0877();const h=productImageIndex0877.get(code);if(!h)return'';const e=(await loadImageChunk0877(h.chunk)).get(h.file);if(!e)return'';let data=e.data;if(e.method===8)data=new Uint8Array(await decompress0877(new Blob([e.data]),'deflate-raw'));else if(e.method!==0)return'';return URL.createObjectURL(new Blob([data],{type:'image/webp'}))})().catch(e=>{console.warn('Product image',code,e);return''});productImageUrls0877.set(code,promise);return promise}
  async function hydrateProductImages0877(root){await Promise.all([...root.querySelectorAll('img.foodThumb0877[data-ean]')].map(async img=>{const url=await productImageUrl0877(img.dataset.ean);if(url&&img.isConnected){img.src=url;img.hidden=false;img.closest('.foodThumbSlot0877')?.classList.add('hasImage0877')}}))}
  function rowCard(x){
    const rawName=foodName(x)||'Bez názvu',name=html(rawName),brand=foodBrand(x),ean=foodEan(x),kcal=energy(x),category=foodCategory(x);
    const energyText=kcal==null?'energie neuvedena':`${kcal} kcal / 100 g`,third=x._custom?'Vlastní potravina':(brand||'');
    const fallback=(window.categoryImage0859?.(category))||'assets/categories/cat-other.webp',scanned=ean&&ean===scannedEan0877;
    const action=x._source==='off'?`showFoodInfo0832('off','${ean}')`:`showFoodInfo0832('local','${String(x.id).replace(/'/g,"\\'")}')`;
    return `<div class="foodRow0832${scanned?' foodScanned0877':''}" data-ean="${html(ean)}"><span class="foodThumbSlot0877" aria-hidden="true"><img class="foodFallback0877" src="${html(fallback)}" alt="">${ean?`<img class="foodThumb0877" data-ean="${html(ean)}" alt="" hidden>`:''}<span class="foodFallbackMark0877">?</span></span><div class="foodMain0832"><b title="${name}">${name}</b><small>${html(energyText)}</small><small class="foodBrand0877">${html(third)}</small></div><button type="button" class="foodInfo0832" aria-label="Informace o ${name}" onclick="event.stopPropagation();${action}">i</button></div>`
  }
  window.renderFoods0832=async function(reset=false){
    const list=$i('foodList');if(!list)return;
    if(!window.selectedFoodCategory0859){list.innerHTML='';return;}
    if(reset)visibleLimit=PAGE_SIZE;
    // Clear stale legacy/Open Food Facts content while the selected category loads.
    list.innerHTML='';
    currentRows=await filterRows();
    const shown=currentRows.slice(0,visibleLimit);
    list.innerHTML=shown.length?shown.map(rowCard).join(''):`<div class="card note">Nenalezena žádná potravina.</div>`;
    hydrateProductImages0877(list);
    if(currentRows.length>shown.length)list.insertAdjacentHTML('beforeend',`<div class="foodsMore0832">Zobrazeno ${shown.length.toLocaleString('cs-CZ')} z ${currentRows.length.toLocaleString('cs-CZ')}<button type="button" onclick="loadMoreFoods0832()">Načíst dalších 50</button></div>`);
    else if(currentRows.length)list.insertAdjacentHTML('beforeend',`<div class="foodsMore0832">Zobrazeno ${shown.length.toLocaleString('cs-CZ')} z ${currentRows.length.toLocaleString('cs-CZ')}</div>`)
  };
  window.loadMoreFoods0832=function(){visibleLimit+=PAGE_SIZE;renderFoods0832(false)};
  function nutritionLine(label,value,unit='g'){return `<div><span>${label}</span><b>${value==null?'–':`${Number(value).toLocaleString('cs-CZ',{maximumFractionDigits:2})} ${unit}`}</b></div>`}
  async function getInfo(source,key){if(source==='off'){const all=await catalogAll0825();return all.find(x=>foodEan(x)===key)||null}return (db.foods||[]).find(x=>String(x.id)===String(key))||null}
  window.showFoodInfo0832=async function(source,key){
    const x=await getInfo(source,key);if(!x)return;
    const dlg=$i('foodInfoDialog0832'),body=$i('foodInfoBody0832');if(!dlg||!body)return;
    const allergens=(x.allergens||[]).map(a=>String(a).replace(/^..:/,'')).join(', ')||'–';
    const additives=(x.additives||[]).map(a=>a.code||a.tag).filter(Boolean).join(', ')||'–';
    const emuls=(x.emulsifiers||[]).map(a=>a.code||a.tag).filter(Boolean).join(', ')||'–';
    const ingredients=x.ingredientsText||x.ingredients_text||'–';
    body.innerHTML=`<div class="foodInfoHead0832"><h2>${html(foodName(x))}</h2><small>${html(foodBrand(x)|| (source==='off'?'Open Food Facts':'Vlastní potravina'))}</small></div><div class="foodInfoGrid0832">${nutritionLine('Energie',x.kcal,'kcal')}${nutritionLine('kJ',x.kj,'kJ')}${nutritionLine('Bílkoviny',x.p)}${nutritionLine('Sacharidy',x.c)}${nutritionLine('Cukry',x.sugars)}${nutritionLine('Tuky',x.f)}${nutritionLine('Nasycené tuky',x.saturated)}${nutritionLine('Vláknina',x.fiber)}${nutritionLine('Sůl',x.salt)}</div><h3>Složení</h3><p>${html(ingredients)}</p><h3>Alergeny</h3><p>${html(allergens)}</p><h3>Aditiva</h3><p>${html(additives)}</p><h3>Emulgátory</h3><p>${html(emuls)}</p><div class="foodMeta0832">${foodEan(x)?`EAN ${html(foodEan(x))} · `:''}${source==='off'?'Zdroj: Open Food Facts (ODbL)':'Zdroj: vlastní položka'}</div>${source==='off'?'<p class="foodDisclaimer0832">Údaje Open Food Facts jsou komunitně spravované a mohou být neúplné nebo nepřesné.</p>':''}`;
    dlg.showModal()
  };
  window.editFoodFromInfo0832=async function(){return};
  window.ensureCatalogShell0833=function(){const body=$i('catalogBody0825'),title=$i('catalogTitle0825');if(!body)return;if(title)title.textContent='Katalog potravin';if($i('catalogShell0833'))return;body.innerHTML=`<div id="catalogShell0833"><div class="catalogStats0825 catalogSimple0847"><span>Množství potravin v katalogu</span><b id="catalogLocalCount0833">0</b><span>Přibližná velikost katalogu</span><b id="catalogSize0847">–</b><span>Poslední aktualizace</span><b id="catalogCompleted0833">–</b><span>Stav poslední aktualizace</span><b id="catalogStatus0833" class="catalogStatus0847">Neaktualizováno</b></div><p id="catalogMessage0833" class="catalogNotice0825" hidden></p><div class="catalogActions0832"><button type="button" onclick="catalogDialog0825.close()">Zavřít</button><button id="catalogStart0833" class="primary" type="button" onclick="startCatalogRefresh0826()">Aktualizovat</button><button id="catalogStop0833" class="catalogCancel0825" type="button" onclick="cancelCatalogRefresh0825()" hidden>Zastavit</button></div></div>`};
  window.openCatalogManager0832=async function(){
    try{
      if(typeof ensureCatalogUi0825==='function')ensureCatalogUi0825();
      ensureCatalogShell0833();
      if(typeof updateCatalogMeta0825==='function')await updateCatalogMeta0825();
      const dlg=$i('catalogDialog0825');
      if(!dlg)throw new Error('Dialog katalogu se nepodařilo vytvořit.');
      dlg.showModal();
    }catch(e){console.error(e);alert('Katalog nelze otevřít: '+String(e.message||e))}
  };
  window.foodSearchChanged0833=function(){scannedEan0877='';const clear=$i('foodSearchClear0833');if(clear)clear.hidden=!($i('search')?.value);renderFoods0832(true)};
  window.clearFoodSearch0833=function(){scannedEan0877='';const input=$i('search');if(input){input.value='';input.focus()}const clear=$i('foodSearchClear0833');if(clear)clear.hidden=true;renderFoods0832(true)};
  let scannerStream0833=null,scannerFrame0833=null;
  async function setScannedEan0833(code){
    const val=String(code||'').replace(/\D/g,'');if(!/^\d{8,14}$/.test(val))return false;await closeEanScanner0833();
    const rows=await mergedRows(),product=rows.find(x=>foodEan(x)===val),input=$i('search');scannedEan0877=val;
    if(product){if(input)input.value='';window.selectedFoodCategory0859=foodCategory(product);window.renderFoodCategoryNavigation0859?.();await window.renderFoods0832(true);const vp=$i('foodScrollViewport0859');if(vp)vp.scrollTop=0;requestAnimationFrame(()=>{$i('foodList')?.querySelector(`[data-ean="${CSS.escape(val)}"]`)?.scrollIntoView({block:'start',behavior:'smooth'})})}
    else{if(input)input.value=val;await window.renderFoods0832(true)}return true
  }
  window.openEanScanner0833=async function(){const dlg=$i('eanScanner0833'),status=$i('eanScannerStatus0833'),video=$i('eanVideo0833');if(!dlg)return;dlg.showModal();if(!('BarcodeDetector'in window)||!navigator.mediaDevices?.getUserMedia){status.textContent='Automatické skenování není v tomto prohlížeči dostupné. Zadej EAN ručně.';video.hidden=true;return}try{scannerStream0833=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});video.srcObject=scannerStream0833;video.hidden=false;await video.play();const detector=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']});status.textContent='Namiř kameru na čárový kód.';const scan=async()=>{if(!scannerStream0833)return;try{const codes=await detector.detect(video);if(codes.length&&await setScannedEan0833(codes[0].rawValue))return}catch(e){console.warn(e)}scannerFrame0833=requestAnimationFrame(scan)};scan()}catch(e){status.textContent='Kameru se nepodařilo spustit. Zadej EAN ručně.';video.hidden=true}};
  window.closeEanScanner0833=async function(){if(scannerFrame0833)cancelAnimationFrame(scannerFrame0833);scannerFrame0833=null;if(scannerStream0833)scannerStream0833.getTracks().forEach(t=>t.stop());scannerStream0833=null;const dlg=$i('eanScanner0833');if(dlg?.open)dlg.close()};
  window.useManualEan0833=async function(){const v=$i('eanManual0833')?.value;if(!(await setScannedEan0833(v)))alert('Zadej platný EAN o délce 8 až 14 číslic.')};
  // Replace old renderer so search/category changes use only the new list.
  window.renderFoods=function(){renderFoods0832(true)};
  document.addEventListener('DOMContentLoaded',()=>renderFoods0832(true));
  // If app is already loaded, render now as well.
  if(document.readyState!=='loading')setTimeout(()=>renderFoods0832(true),0);
})();
