'use strict';
window.CATEGORY_IMAGE_0857={'Ovoce':'cat-fruit.webp','Zelenina':'cat-vegetables.webp','Maso a ryby':'cat-meat-fish.webp','Mléčné výrobky':'cat-dairy.webp','Vejce':'cat-eggs.webp','Obiloviny a přílohy':'cat-grains.webp','Luštěniny':'cat-legumes.webp','Ořechy a semena':'cat-nuts-seeds.webp','Tuky a oleje':'cat-fats-oils.webp','Nápoje':'cat-drinks.webp','Ostatní':'cat-other.webp'};
window.selectedFoodCategory0857='';
window.categoryImage0857=c=>CATEGORY_IMAGE_0857[c]||CATEGORY_IMAGE_0857.Ostatní;
window.selectFoodCategory0857=function(c){selectedFoodCategory0857=c||'';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0857();window.renderFoods0832?.(true)};
window.backToFoodCategories0857=function(){selectedFoodCategory0857='';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0857();window.renderFoods0832?.(true)};
window.renderFoodCategoryNavigation0857=function(){const host=document.getElementById('foodCategoryNav0857');if(!host)return;if(selectedFoodCategory0857){host.className='';host.innerHTML=`<div class="selectedCategory0850"><button type="button" class="categoryBack0850" onclick="backToFoodCategories0857()"><img src="icon-back-groups.svg" alt="Zpět"></button><img class="selectedCategoryImage0850" src="${categoryImage0857(selectedFoodCategory0857)}" alt=""><b>${selectedFoodCategory0857}</b></div>`;return}host.className='foodCategoryViewport0857';host.innerHTML=`<div class="categoryGrid0857">${Object.entries(CATEGORY_IMAGE_0857).map(([c,img])=>`<button type="button" class="categoryCard0857" data-category="${c}"><img src="${img}" alt=""><span>${c}</span></button>`).join('')}</div>`;host.querySelectorAll('button').forEach(b=>b.onclick=()=>selectFoodCategory0857(b.dataset.category))};
function setup0857(){const list=document.getElementById('foodList');if(!list)return;const old=document.getElementById('foodCategoryNav0850');if(old)old.remove();const oldvp=document.getElementById('foodScrollViewport0850');if(oldvp&&oldvp.contains(list)){oldvp.before(list);oldvp.remove()}let host=document.getElementById('foodCategoryNav0857');if(!host){host=document.createElement('div');host.id='foodCategoryNav0857';list.before(host)}let viewport=document.getElementById('foodScrollViewport0857');if(!viewport){viewport=document.createElement('div');viewport.id='foodScrollViewport0857';viewport.className='foodScrollViewport0857';list.before(viewport);viewport.appendChild(list)}renderFoodCategoryNavigation0857()}
document.addEventListener('DOMContentLoaded',setup0857);

// v0.8.52 switch between category viewport and product viewport without page scrolling


// v0.8.54 selected header stays visible; category overview itself does not scroll.
const renderNav0857Base=window.renderFoodCategoryNavigation0857;
window.renderFoodCategoryNavigation0857=function(){
  renderNav0857Base();
  const nav=document.getElementById('foodCategoryNav0857'),vp=document.getElementById('foodScrollViewport0857');
  if(nav){nav.style.display='block';nav.className=selectedFoodCategory0857?'selectedCategoryHost0857':'foodCategoryViewport0857'}
  if(vp)vp.style.display=selectedFoodCategory0857?'block':'none';
};
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>renderFoodCategoryNavigation0857(),0));
