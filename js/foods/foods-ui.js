/* Jidelnicek+ v0.8.32 - unified local food catalog UI */
(()=>{
  const PAGE_SIZE=50;
  let visibleLimit=PAGE_SIZE;
  let currentRows=[];
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
    return sortRows(rows,sort)
  }
  const PRODUCT_IMAGE_INDEX_URL='./catalog/image-index.json.gz';
  const productImageIndex=new Map();
  const productImageUrls=new Map();
  const productImageChunks=new Map();
  let productImageIndexPromise=null;
  async function decompress0875(blob,format){
    if(!('DecompressionStream' in window))throw new Error('DecompressionStream není podporován.');
    return new Response(blob.stream().pipeThrough(new DecompressionStream(format))).arrayBuffer()
  }
  async function ensureProductImageIndex0875(){
    if(productImageIndexPromise)return productImageIndexPromise;
    productImageIndexPromise=(async()=>{
      const response=await fetch(PRODUCT_IMAGE_INDEX_URL,{cache:'force-cache'});
      if(!response.ok)throw new Error(`Index obrázků: HTTP ${response.status}`);
      const buffer=await decompress0875(await response.blob(),'gzip');
      const rows=JSON.parse(new TextDecoder().decode(buffer));
      rows.forEach(row=>{const ean=String(row?.ean||'').replace(/\D/g,'');if(ean&&row?.chunk&&row?.file)productImageIndex.set(ean,{chunk:String(row.chunk),file:String(row.file)})});
      return productImageIndex
    })().catch(error=>{console.warn('Product image index',error);return productImageIndex});
    return productImageIndexPromise
  }
  function zipU160875(view,offset){return view.getUint16(offset,true)}
  function zipU320875(view,offset){return view.getUint32(offset,true)}
  async function loadImageChunk0875(chunk){
    if(productImageChunks.has(chunk))return productImageChunks.get(chunk);
    const promise=(async()=>{
      const response=await fetch(`./catalog/${chunk}`,{cache:'force-cache'});
      if(!response.ok)throw new Error(`${chunk}: HTTP ${response.status}`);
      const buffer=await response.arrayBuffer(),view=new DataView(buffer),bytes=new Uint8Array(buffer),entries=new Map();
      let eocd=-1;
      for(let i=buffer.byteLength-22;i>=Math.max(0,buffer.byteLength-65557);i--){if(zipU320875(view,i)===0x06054b50){eocd=i;break}}
      if(eocd<0)throw new Error(`${chunk}: ZIP konec nenalezen`);
      const count=zipU160875(view,eocd+10),centralOffset=zipU320875(view,eocd+16);let pos=centralOffset;
      for(let i=0;i<count;i++){
        if(zipU320875(view,pos)!==0x02014b50)throw new Error(`${chunk}: neplatný ZIP adresář`);
        const method=zipU160875(view,pos+10),compressedSize=zipU320875(view,pos+20),nameLength=zipU160875(view,pos+28),extraLength=zipU160875(view,pos+30),commentLength=zipU160875(view,pos+32),localOffset=zipU320875(view,pos+42);
        const name=new TextDecoder().decode(bytes.slice(pos+46,pos+46+nameLength));
        const localNameLength=zipU160875(view,localOffset+26),localExtraLength=zipU160875(view,localOffset+28),dataOffset=localOffset+30+localNameLength+localExtraLength;
        entries.set(name,{method,data:bytes.slice(dataOffset,dataOffset+compressedSize)});
        pos+=46+nameLength+extraLength+commentLength
      }
      return entries
    })().catch(error=>{productImageChunks.delete(chunk);throw error});
    productImageChunks.set(chunk,promise);return promise
  }
  async function productImageUrl0875(ean){
    const code=String(ean||'').replace(/\D/g,'');if(!code)return'';
    if(productImageUrls.has(code))return productImageUrls.get(code);
    const promise=(async()=>{
      await ensureProductImageIndex0875();const hit=productImageIndex.get(code);if(!hit)return'';
      const entries=await loadImageChunk0875(hit.chunk),entry=entries.get(hit.file);if(!entry)return'';
      let data;if(entry.method===0)data=entry.data;else if(entry.method===8)data=new Uint8Array(await decompress0875(new Blob([entry.data]),'deflate-raw'));else throw new Error(`Nepodporovaná ZIP metoda ${entry.method}`);
      return URL.createObjectURL(new Blob([data],{type:'image/webp'}))
    })().catch(error=>{console.warn('Product image',code,error);return''});
    productImageUrls.set(code,promise);return promise
  }
  async function hydrateProductImages0875(root){
    const images=[...root.querySelectorAll('img.foodThumb0875[data-ean]')];
    await Promise.all(images.map(async image=>{const url=await productImageUrl0875(image.dataset.ean);if(!url||!image.isConnected)return;image.src=url;image.hidden=false;image.closest('.foodThumbSlot0875')?.classList.add('hasImage0875')}))
  }
  function rowCard(x){
    const rawName=foodName(x)||'Bez názvu',name=html(rawName),ean=foodEan(x),kcal=energy(x);
    const sub=kcal==null?'energie neuvedena':`${kcal} kcal / 100 g`;
    const action=x._source==='off'?`showFoodInfo0832('off','${ean}')`:`showFoodInfo0832('local','${String(x.id).replace(/'/g,"\\'")}')`;
    return `<div class="foodRow0832"><span class="foodThumbSlot0875" aria-hidden="true">${ean?`<img class="foodThumb0875" data-ean="${html(ean)}" alt="" hidden>`:''}</span><div class="foodMain0832"><b title="${name}">${name}</b><small>${html(sub)}</small></div><button type="button" class="foodInfo0832" aria-label="Informace o ${name}" onclick="event.stopPropagation();${action}">i</button></div>`
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
    hydrateProductImages0875(list);
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
  window.foodSearchChanged0833=function(){const clear=$i('foodSearchClear0833');if(clear)clear.hidden=!($i('search')?.value);renderFoods0832(true)};
  window.clearFoodSearch0833=function(){const input=$i('search');if(input){input.value='';input.focus()}const clear=$i('foodSearchClear0833');if(clear)clear.hidden=true;renderFoods0832(true)};
  let scannerStream0833=null,scannerFrame0833=null;
  async function setScannedEan0833(code){const val=String(code||'').replace(/\D/g,'');if(!/^\d{8,14}$/.test(val))return false;await closeEanScanner0833();const input=$i('search');if(input)input.value=val;foodSearchChanged0833();return true}
  window.openEanScanner0833=async function(){const dlg=$i('eanScanner0833'),status=$i('eanScannerStatus0833'),video=$i('eanVideo0833');if(!dlg)return;dlg.showModal();if(!('BarcodeDetector'in window)||!navigator.mediaDevices?.getUserMedia){status.textContent='Automatické skenování není v tomto prohlížeči dostupné. Zadej EAN ručně.';video.hidden=true;return}try{scannerStream0833=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});video.srcObject=scannerStream0833;video.hidden=false;await video.play();const detector=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']});status.textContent='Namiř kameru na čárový kód.';const scan=async()=>{if(!scannerStream0833)return;try{const codes=await detector.detect(video);if(codes.length&&await setScannedEan0833(codes[0].rawValue))return}catch(e){console.warn(e)}scannerFrame0833=requestAnimationFrame(scan)};scan()}catch(e){status.textContent='Kameru se nepodařilo spustit. Zadej EAN ručně.';video.hidden=true}};
  window.closeEanScanner0833=async function(){if(scannerFrame0833)cancelAnimationFrame(scannerFrame0833);scannerFrame0833=null;if(scannerStream0833)scannerStream0833.getTracks().forEach(t=>t.stop());scannerStream0833=null;const dlg=$i('eanScanner0833');if(dlg?.open)dlg.close()};
  window.useManualEan0833=async function(){const v=$i('eanManual0833')?.value;if(!(await setScannedEan0833(v)))alert('Zadej platný EAN o délce 8 až 14 číslic.')};
  // Replace old renderer so search/category changes use only the new list.
  window.renderFoods=function(){renderFoods0832(true)};
  document.addEventListener('DOMContentLoaded',()=>renderFoods0832(true));
  // If app is already loaded, render now as well.
  if(document.readyState!=='loading')setTimeout(()=>renderFoods0832(true),0);
})();
