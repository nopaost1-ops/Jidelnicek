'use strict';
window.CATEGORY_IMAGE_0856={'Ovoce':'cat-fruit.webp','Zelenina':'cat-vegetables.webp','Maso a ryby':'cat-meat-fish.webp','Mléčné výrobky':'cat-dairy.webp','Vejce':'cat-eggs.webp','Obiloviny a přílohy':'cat-grains.webp','Luštěniny':'cat-legumes.webp','Ořechy a semena':'cat-nuts-seeds.webp','Tuky a oleje':'cat-fats-oils.webp','Nápoje':'cat-drinks.webp','Ostatní':'cat-other.webp'};
window.selectedFoodCategory0856='';
window.categoryImage0856=c=>CATEGORY_IMAGE_0856[c]||CATEGORY_IMAGE_0856.Ostatní;
window.selectFoodCategory0856=function(c){selectedFoodCategory0856=c||'';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0856();window.renderFoods0832?.(true)};
window.backToFoodCategories0856=function(){selectedFoodCategory0856='';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0856();window.renderFoods0832?.(true)};
window.renderFoodCategoryNavigation0856=function(){const host=document.getElementById('foodCategoryNav0856');if(!host)return;if(selectedFoodCategory0856){host.className='';host.innerHTML=`<div class="selectedCategory0850"><button type="button" class="categoryBack0850" onclick="backToFoodCategories0856()"><img src="icon-back-groups.svg" alt="Zpět"></button><img class="selectedCategoryImage0850" src="${categoryImage0856(selectedFoodCategory0856)}" alt=""><b>${selectedFoodCategory0856}</b></div>`;return}host.className='foodCategoryViewport0856';host.innerHTML=`<div class="categoryGrid0856">${Object.entries(CATEGORY_IMAGE_0856).map(([c,img])=>`<button type="button" class="categoryCard0856" data-category="${c}"><img src="${img}" alt=""><span>${c}</span></button>`).join('')}</div>`;host.querySelectorAll('button').forEach(b=>b.onclick=()=>selectFoodCategory0856(b.dataset.category))};
function setup0856(){const list=document.getElementById('foodList');if(!list)return;const old=document.getElementById('foodCategoryNav0850');if(old)old.remove();const oldvp=document.getElementById('foodScrollViewport0850');if(oldvp&&oldvp.contains(list)){oldvp.before(list);oldvp.remove()}let host=document.getElementById('foodCategoryNav0856');if(!host){host=document.createElement('div');host.id='foodCategoryNav0856';list.before(host)}let viewport=document.getElementById('foodScrollViewport0856');if(!viewport){viewport=document.createElement('div');viewport.id='foodScrollViewport0856';viewport.className='foodScrollViewport0856';list.before(viewport);viewport.appendChild(list)}renderFoodCategoryNavigation0856()}
document.addEventListener('DOMContentLoaded',setup0856);

// v0.8.52 switch between category viewport and product viewport without page scrolling


// v0.8.54 selected header stays visible; category overview itself does not scroll.
const renderNav0856Base=window.renderFoodCategoryNavigation0856;
window.renderFoodCategoryNavigation0856=function(){
  renderNav0856Base();
  const nav=document.getElementById('foodCategoryNav0856'),vp=document.getElementById('foodScrollViewport0856');
  if(nav){nav.style.display='block';nav.className=selectedFoodCategory0856?'selectedCategoryHost0856':'foodCategoryViewport0856'}
  if(vp)vp.style.display=selectedFoodCategory0856?'block':'none';
};
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>renderFoodCategoryNavigation0856(),0));
