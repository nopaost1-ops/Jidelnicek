'use strict';
window.CATEGORY_IMAGE_0853={'Ovoce':'cat-fruit.webp','Zelenina':'cat-vegetables.webp','Maso a ryby':'cat-meat-fish.webp','Mléčné výrobky':'cat-dairy.webp','Vejce':'cat-eggs.webp','Obiloviny a přílohy':'cat-grains.webp','Luštěniny':'cat-legumes.webp','Ořechy a semena':'cat-nuts-seeds.webp','Tuky a oleje':'cat-fats-oils.webp','Nápoje':'cat-drinks.webp','Ostatní':'cat-other.webp'};
window.selectedFoodCategory0853='';
window.categoryImage0853=c=>CATEGORY_IMAGE_0853[c]||CATEGORY_IMAGE_0853.Ostatní;
window.selectFoodCategory0853=function(c){selectedFoodCategory0853=c||'';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0853();window.renderFoods0832?.(true)};
window.backToFoodCategories0853=function(){selectedFoodCategory0853='';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0853();window.renderFoods0832?.(true)};
window.renderFoodCategoryNavigation0853=function(){const host=document.getElementById('foodCategoryNav0853');if(!host)return;if(selectedFoodCategory0853){host.className='';host.innerHTML=`<div class="selectedCategory0850"><button type="button" class="categoryBack0850" onclick="backToFoodCategories0853()"><img src="icon-back-groups.svg" alt="Zpět"></button><img class="selectedCategoryImage0850" src="${categoryImage0853(selectedFoodCategory0853)}" alt=""><b>${selectedFoodCategory0853}</b></div>`;return}host.className='foodCategoryViewport0853';host.innerHTML=`<div class="categoryGrid0853">${Object.entries(CATEGORY_IMAGE_0853).map(([c,img])=>`<button type="button" class="categoryCard0853" data-category="${c}"><img src="${img}" alt=""><span>${c}</span></button>`).join('')}</div>`;host.querySelectorAll('button').forEach(b=>b.onclick=()=>selectFoodCategory0853(b.dataset.category))};
function setup0853(){const list=document.getElementById('foodList');if(!list)return;const old=document.getElementById('foodCategoryNav0850');if(old)old.remove();const oldvp=document.getElementById('foodScrollViewport0850');if(oldvp&&oldvp.contains(list)){oldvp.before(list);oldvp.remove()}let host=document.getElementById('foodCategoryNav0853');if(!host){host=document.createElement('div');host.id='foodCategoryNav0853';list.before(host)}let viewport=document.getElementById('foodScrollViewport0853');if(!viewport){viewport=document.createElement('div');viewport.id='foodScrollViewport0853';viewport.className='foodScrollViewport0853';list.before(viewport);viewport.appendChild(list)}renderFoodCategoryNavigation0853()}
document.addEventListener('DOMContentLoaded',setup0853);

// v0.8.52 switch between category viewport and product viewport without page scrolling

// v0.8.53: selected category header stays visible while product list scrolls.
const renderNav0853Base=window.renderFoodCategoryNavigation0853;
window.renderFoodCategoryNavigation0853=function(){
  renderNav0853Base();
  const nav=document.getElementById('foodCategoryNav0853'),vp=document.getElementById('foodScrollViewport0853');
  if(nav)nav.style.display='block';
  if(vp)vp.style.display=selectedFoodCategory0853?'block':'none';
  if(nav)nav.className=selectedFoodCategory0853?'selectedCategoryHost0853':'foodCategoryViewport0853';
};
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>renderFoodCategoryNavigation0853(),0));
