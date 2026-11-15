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
    const q=normalize($i('search')?.value||''),cat=$i('cat')?.value||'',sort=$i('foodSort0832')?.value||'az';
    let rows=await mergedRows();
    rows=rows.filter(x=>(!cat||foodCategory(x)===cat)&&(!q||normalize(foodName(x)).includes(q)||normalize(foodBrand(x)).includes(q)||foodEan(x).includes(q)));
    return sortRows(rows,sort)
  }
  function rowCard(x){
    const name=html(foodName(x)||'Bez názvu'),brand=foodBrand(x),kcal=energy(x);
    const sub=[x._custom?'Vlastní':brand,kcal==null?'energie neuvedena':`${kcal} kcal / 100 g`].filter(Boolean).join(' · ');
    const action=x._source==='off'?`showFoodInfo0832('off','${foodEan(x)}')`:`showFoodInfo0832('local','${String(x.id).replace(/'/g,"\\'")}')`;
    return `<div class="foodRow0832"><div class="foodMain0832"><b>${name}</b><small>${html(sub)}</small></div><button type="button" class="foodInfo0832" aria-label="Informace o ${name}" onclick="event.stopPropagation();${action}">i</button></div>`
  }
  window.renderFoods0832=async function(reset=false){
    if(reset)visibleLimit=PAGE_SIZE;
    const list=$i('foodList');if(!list)return;
    currentRows=await filterRows();
    const shown=currentRows.slice(0,visibleLimit);
    list.innerHTML=shown.length?shown.map(rowCard).join(''):`<div class="card note">Nenalezena žádná potravina.</div>`;
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
  window.ensureCatalogShell0833=function(){
    const body=$i('catalogBody0825'),title=$i('catalogTitle0825');if(!body)return;if(title)title.textContent='Katalog potravin';
    if($i('catalogShell0833'))return;
    body.innerHTML=`<div id="catalogShell0833"><div class="catalogStats0825"><span>Stav</span><b id="catalogStatus0833">–</b><span>Open Food Facts ČR</span><b id="catalogSourceCount0833">zjišťuje se…</b><span>Lokální katalog</span><b id="catalogLocalCount0833">0</b><span>Pokrytí</span><b id="catalogCoverage0833">–</b><span>Poslední dokončení</span><b id="catalogCompleted0833">–</b></div><progress id="catalogCoverageProgress0833" class="catalogProgress0825" max="100" value="0"></progress><h3>Statistiky běhu</h3><div class="catalogStats0825"><span>Zkontrolováno</span><b id="catalogChecked0833">0</b><span>Nové produkty</span><b id="catalogNew0833">0</b><span>Aktualizováno</span><b id="catalogUpdated0833">0</b><span>Přeskočeno</span><b id="catalogSkipped0833">0</b><span>API stránka</span><b id="catalogPage0833">1</b><span>Data</span><b id="catalogData0833">0,0 / 20 MiB</b></div><progress id="catalogDataProgress0833" class="catalogProgress0825" max="20" value="0"></progress><label>Režim obnovy<select id="catalogMode0826"><option value="fill">Doplnit katalog</option><option value="quick">Rychlá aktualizace</option><option value="full">Úplná kontrola</option></select></label><div class="catalogLimits0833"><b>Limity</b><span>20 MiB na ruční běh · 7 s mezi požadavky · zdroj Open Food Facts (ODbL)</span></div><p id="catalogMessage0833" class="catalogNotice0825" hidden></p><div class="catalogActions0832"><button type="button" onclick="catalogDialog0825.close()">Zavřít</button><button id="catalogStart0833" class="primary" type="button" onclick="startCatalogRefresh0826()">Spustit</button><button id="catalogStop0833" class="catalogCancel0825" type="button" onclick="cancelCatalogRefresh0825()" hidden>Zastavit</button></div></div>`;
  };
  window.openCatalogManager0832=async function(){
    ensureCatalogShell0833();const count=await catalogCount0825(),meta=await catalogMetaGet0825('sync'),dlg=$i('catalogDialog0825');
    const merged={...(meta||{}),accepted:count,catalogCount:count,status:meta?.status||'completed'};
    if(typeof syncView0825==='function')syncView0825(merged);
    const c=$i('catalogCompleted0833');if(c)c.textContent=meta?.completedAt?new Date(meta.completedAt).toLocaleString('cs-CZ'):'–';
    dlg?.showModal();
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
