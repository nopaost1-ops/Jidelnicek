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
  window.openCatalogManager0832=async function(){
    const count=await catalogCount0825(),meta=await catalogMetaGet0825('sync'),dlg=$i('catalogDialog0825'),body=$i('catalogBody0825'),title=$i('catalogTitle0825');if(!dlg||!body)return;
    const status=typeof catalogStatusLabel0829==='function'?catalogStatusLabel0829(meta?.status):({running:'🔄 Probíhá obnova',completed:'✅ Dokončená obnova','paused-data-limit':'⚠️ Pozastaveno: datový limit','paused-user':'⏸ Pozastaveno uživatelem','paused-error':'❌ Přerušeno chybou'})[meta?.status]||'–';
    if(title)title.textContent='Katalog potravin';
    body.innerHTML=`<div class="catalogStats0825"><span>Stav</span><b>${status}</b><span>Produktů v katalogu</span><b>${count.toLocaleString('cs-CZ')} / 5 000</b><span>Poslední dokončení</span><b>${meta?.completedAt?new Date(meta.completedAt).toLocaleString('cs-CZ'):'–'}</b><span>Data posledního běhu</span><b>${typeof mb0826==='function'?mb0826(meta?.downloadedBytes||0):'0,0'} / 20 MiB</b></div><label>Režim obnovy<select id="catalogMode0826"><option value="quick">Rychlá aktualizace</option><option value="fill">Doplnit katalog do 5 000</option><option value="full">Úplná kontrola katalogu</option></select></label><p class="catalogSource0825">Synchronizace se spustí pouze po stisku Spustit. Zdroj: Open Food Facts (ODbL).</p><div class="catalogActions0832"><button type="button" onclick="catalogDialog0825.close()">Zrušit</button><button class="primary" type="button" onclick="startCatalogRefresh0826()">Spustit</button></div>`;
    dlg.showModal()
  };
  // Replace old renderer so search/category changes use only the new list.
  window.renderFoods=function(){renderFoods0832(true)};
  document.addEventListener('DOMContentLoaded',()=>renderFoods0832(true));
  // If app is already loaded, render now as well.
  if(document.readyState!=='loading')setTimeout(()=>renderFoods0832(true),0);
})();
