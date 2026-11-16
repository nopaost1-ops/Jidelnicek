'use strict';
window.CATEGORY_IMAGE_0855={'Ovoce':'cat-fruit.webp','Zelenina':'cat-vegetables.webp','Maso a ryby':'cat-meat-fish.webp','Mléčné výrobky':'cat-dairy.webp','Vejce':'cat-eggs.webp','Obiloviny a přílohy':'cat-grains.webp','Luštěniny':'cat-legumes.webp','Ořechy a semena':'cat-nuts-seeds.webp','Tuky a oleje':'cat-fats-oils.webp','Nápoje':'cat-drinks.webp','Ostatní':'cat-other.webp'};
window.selectedFoodCategory0855='';
window.categoryImage0855=c=>CATEGORY_IMAGE_0855[c]||CATEGORY_IMAGE_0855.Ostatní;
window.selectFoodCategory0855=function(c){selectedFoodCategory0855=c||'';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0855();window.renderFoods0832?.(true)};
window.backToFoodCategories0855=function(){selectedFoodCategory0855='';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0855();window.renderFoods0832?.(true)};
window.renderFoodCategoryNavigation0855=function(){const host=document.getElementById('foodCategoryNav0855');if(!host)return;if(selectedFoodCategory0855){host.className='';host.innerHTML=`<div class="selectedCategory0850"><button type="button" class="categoryBack0850" onclick="backToFoodCategories0855()"><img src="icon-back-groups.svg" alt="Zpět"></button><img class="selectedCategoryImage0850" src="${categoryImage0855(selectedFoodCategory0855)}" alt=""><b>${selectedFoodCategory0855}</b></div>`;return}host.className='foodCategoryViewport0855';host.innerHTML=`<div class="categoryGrid0855">${Object.entries(CATEGORY_IMAGE_0855).map(([c,img])=>`<button type="button" class="categoryCard0855" data-category="${c}"><img src="${img}" alt=""><span>${c}</span></button>`).join('')}</div>`;host.querySelectorAll('button').forEach(b=>b.onclick=()=>selectFoodCategory0855(b.dataset.category))};
function setup0855(){const list=document.getElementById('foodList');if(!list)return;const old=document.getElementById('foodCategoryNav0850');if(old)old.remove();const oldvp=document.getElementById('foodScrollViewport0850');if(oldvp&&oldvp.contains(list)){oldvp.before(list);oldvp.remove()}let host=document.getElementById('foodCategoryNav0855');if(!host){host=document.createElement('div');host.id='foodCategoryNav0855';list.before(host)}let viewport=document.getElementById('foodScrollViewport0855');if(!viewport){viewport=document.createElement('div');viewport.id='foodScrollViewport0855';viewport.className='foodScrollViewport0855';list.before(viewport);viewport.appendChild(list)}renderFoodCategoryNavigation0855()}
document.addEventListener('DOMContentLoaded',setup0855);

// v0.8.52 switch between category viewport and product viewport without page scrolling


// v0.8.54 selected header stays visible; category overview itself does not scroll.
const renderNav0855Base=window.renderFoodCategoryNavigation0855;
window.renderFoodCategoryNavigation0855=function(){
  renderNav0855Base();
  const nav=document.getElementById('foodCategoryNav0855'),vp=document.getElementById('foodScrollViewport0855');
  if(nav){nav.style.display='block';nav.className=selectedFoodCategory0855?'selectedCategoryHost0855':'foodCategoryViewport0855'}
  if(vp)vp.style.display=selectedFoodCategory0855?'block':'none';
};
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>renderFoodCategoryNavigation0855(),0));
