'use strict';
window.CATEGORY_IMAGE_0859={'Ovoce':'cat-fruit.webp','Zelenina':'cat-vegetables.webp','Maso a ryby':'cat-meat-fish.webp','Mléčné výrobky':'cat-dairy.webp','Vejce':'cat-eggs.webp','Obiloviny a přílohy':'cat-grains.webp','Luštěniny':'cat-legumes.webp','Ořechy a semena':'cat-nuts-seeds.webp','Tuky a oleje':'cat-fats-oils.webp','Nápoje':'cat-drinks.webp','Ostatní':'cat-other.webp'};
window.selectedFoodCategory0859='';
window.categoryImage0859=c=>CATEGORY_IMAGE_0859[c]||CATEGORY_IMAGE_0859.Ostatní;
window.selectFoodCategory0859=function(c){selectedFoodCategory0859=c||'';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0859();window.renderFoods0832?.(true)};
window.backToFoodCategories0859=function(){selectedFoodCategory0859='';const s=document.getElementById('search');if(s)s.value='';renderFoodCategoryNavigation0859();window.renderFoods0832?.(true)};
window.renderFoodCategoryNavigation0859=function(){const host=document.getElementById('foodCategoryNav0859');if(!host)return;if(selectedFoodCategory0859){host.className='';host.innerHTML=`<div class="selectedCategory0850"><button type="button" class="categoryBack0850" onclick="backToFoodCategories0859()"><img src="icon-back-groups.svg" alt="Zpět"></button><img class="selectedCategoryImage0850" src="${categoryImage0859(selectedFoodCategory0859)}" alt=""><b>${selectedFoodCategory0859}</b></div>`;return}host.className='foodCategoryViewport0859';host.innerHTML=`<div class="categoryGrid0859">${Object.entries(CATEGORY_IMAGE_0859).map(([c,img])=>`<button type="button" class="categoryCard0859" data-category="${c}"><img src="${img}" alt=""><span>${c}</span></button>`).join('')}</div>`;host.querySelectorAll('button').forEach(b=>b.onclick=()=>selectFoodCategory0859(b.dataset.category))};
function setup0859(){const list=document.getElementById('foodList');if(!list)return;const old=document.getElementById('foodCategoryNav0850');if(old)old.remove();const oldvp=document.getElementById('foodScrollViewport0850');if(oldvp&&oldvp.contains(list)){oldvp.before(list);oldvp.remove()}let host=document.getElementById('foodCategoryNav0859');if(!host){host=document.createElement('div');host.id='foodCategoryNav0859';list.before(host)}let viewport=document.getElementById('foodScrollViewport0859');if(!viewport){viewport=document.createElement('div');viewport.id='foodScrollViewport0859';viewport.className='foodScrollViewport0859';list.before(viewport);viewport.appendChild(list)}renderFoodCategoryNavigation0859()}
document.addEventListener('DOMContentLoaded',setup0859);

// v0.8.52 switch between category viewport and product viewport without page scrolling


// v0.8.54 selected header stays visible; category overview itself does not scroll.
const renderNav0859Base=window.renderFoodCategoryNavigation0859;
window.renderFoodCategoryNavigation0859=function(){
  renderNav0859Base();
  const nav=document.getElementById('foodCategoryNav0859'),vp=document.getElementById('foodScrollViewport0859');
  if(nav){nav.style.display='block';nav.className=selectedFoodCategory0859?'selectedCategoryHost0859':'foodCategoryViewport0859'}
  if(vp)vp.style.display=selectedFoodCategory0859?'block':'none';
};
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>renderFoodCategoryNavigation0859(),0));

// v0.8.58 measure the actual space between the food panel and bottom navigation.
window.resizeFoodViewport0859=function(){
  const nav=document.querySelector('body>nav')||document.querySelector('nav');
  const panel=selectedFoodCategory0859?document.getElementById('foodScrollViewport0859'):document.getElementById('foodCategoryNav0859');
  if(!nav||!panel||!document.getElementById('foods')?.classList.contains('active'))return;
  const top=panel.getBoundingClientRect().top;
  const navTop=nav.getBoundingClientRect().top;
  const available=Math.max(140,Math.floor(navTop-top-8));
  panel.style.height=available+'px';
  panel.style.maxHeight=available+'px';
};
const renderFoodCategoryNavigation0859Measured=window.renderFoodCategoryNavigation0859;
window.renderFoodCategoryNavigation0859=function(){renderFoodCategoryNavigation0859Measured();requestAnimationFrame(resizeFoodViewport0859)};
window.addEventListener('resize',resizeFoodViewport0859,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(resizeFoodViewport0859,150),{passive:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(resizeFoodViewport0859,0));
document.querySelectorAll('nav button[data-p="foods"]').forEach(b=>b.addEventListener('click',()=>setTimeout(resizeFoodViewport0859,0)));
