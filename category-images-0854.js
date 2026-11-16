'use strict';
window.CATEGORY_IMAGE_0854={'Ovoce':'cat-fruit.webp','Zelenina':'cat-vegetables.webp','Maso a ryby':'cat-meat-fish.webp','Mléčné výrobky':'cat-dairy.webp','Vejce':'cat-eggs.webp','Obiloviny a přílohy':'cat-grains.webp','Luštěniny':'cat-legumes.webp','Ořechy a semena':'cat-nuts-seeds.webp','Tuky a oleje':'cat-fats-oils.webp','Nápoje':'cat-drinks.webp','Ostatní':'cat-other.webp'};
window.selectedFoodCategory0854='';
window.categoryImage0854=c=>CATEGORY_IMAGE_0854[c]||CATEGORY_IMAGE_0854.Ostatní;
window.selectFoodCategory0854=function(c){selectedFoodCategory0854=c||'';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0854();window.renderFoods0832?.(true)};
window.backToFoodCategories0854=function(){selectedFoodCategory0854='';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0854();window.renderFoods0832?.(true)};
window.renderFoodCategoryNavigation0854=function(){const host=document.getElementById('foodCategoryNav0854');if(!host)return;if(selectedFoodCategory0854){host.className='';host.innerHTML=`<div class="selectedCategory0850"><button type="button" class="categoryBack0850" onclick="backToFoodCategories0854()"><img src="icon-back-groups.svg" alt="Zpět"></button><img class="selectedCategoryImage0850" src="${categoryImage0854(selectedFoodCategory0854)}" alt=""><b>${selectedFoodCategory0854}</b></div>`;return}host.className='foodCategoryViewport0854';host.innerHTML=`<div class="categoryGrid0854">${Object.entries(CATEGORY_IMAGE_0854).map(([c,img])=>`<button type="button" class="categoryCard0854" data-category="${c}"><img src="${img}" alt=""><span>${c}</span></button>`).join('')}</div>`;host.querySelectorAll('button').forEach(b=>b.onclick=()=>selectFoodCategory0854(b.dataset.category))};
function setup0854(){const list=document.getElementById('foodList');if(!list)return;const old=document.getElementById('foodCategoryNav0850');if(old)old.remove();const oldvp=document.getElementById('foodScrollViewport0850');if(oldvp&&oldvp.contains(list)){oldvp.before(list);oldvp.remove()}let host=document.getElementById('foodCategoryNav0854');if(!host){host=document.createElement('div');host.id='foodCategoryNav0854';list.before(host)}let viewport=document.getElementById('foodScrollViewport0854');if(!viewport){viewport=document.createElement('div');viewport.id='foodScrollViewport0854';viewport.className='foodScrollViewport0854';list.before(viewport);viewport.appendChild(list)}renderFoodCategoryNavigation0854()}
document.addEventListener('DOMContentLoaded',setup0854);

// v0.8.52 switch between category viewport and product viewport without page scrolling


// v0.8.54 selected header stays visible; category overview itself does not scroll.
const renderNav0854Base=window.renderFoodCategoryNavigation0854;
window.renderFoodCategoryNavigation0854=function(){
  renderNav0854Base();
  const nav=document.getElementById('foodCategoryNav0854'),vp=document.getElementById('foodScrollViewport0854');
  if(nav){nav.style.display='block';nav.className=selectedFoodCategory0854?'selectedCategoryHost0854':'foodCategoryViewport0854'}
  if(vp)vp.style.display=selectedFoodCategory0854?'block':'none';
};
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>renderFoodCategoryNavigation0854(),0));
