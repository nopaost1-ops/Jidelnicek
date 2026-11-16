'use strict';
window.CATEGORY_IMAGE_0848={'Ovoce':'cat-fruit.webp','Zelenina':'cat-vegetables.webp','Maso a ryby':'cat-meat-fish.webp','Mléčné výrobky':'cat-dairy.webp','Vejce':'cat-eggs.webp','Obiloviny a přílohy':'cat-grains.webp','Luštěniny':'cat-legumes.webp','Ořechy a semena':'cat-nuts-seeds.webp','Tuky a oleje':'cat-fats-oils.webp','Nápoje':'cat-drinks.webp','Ostatní':'cat-other.webp'};
window.selectedFoodCategory0848='';
window.categoryImage0848=c=>CATEGORY_IMAGE_0848[c]||CATEGORY_IMAGE_0848.Ostatní;
window.selectFoodCategory0848=function(category){selectedFoodCategory0848=category||'';const search=document.getElementById('search');if(search)search.value='';renderFoodCategoryNavigation0848();window.renderFoods0832?.(true)};
window.backToFoodCategories0848=function(){selectedFoodCategory0848='';const search=document.getElementById('search');if(search)search.value='';renderFoodCategoryNavigation0848();window.renderFoods0832?.(true)};
window.renderFoodCategoryNavigation0848=function(){
 const host=document.getElementById('foodCategoryNav0848');if(!host)return;
 if(selectedFoodCategory0848){host.innerHTML=`<div class="selectedCategory0848"><button type="button" class="categoryBack0848" onclick="backToFoodCategories0848()" aria-label="Zpět na skupiny potravin"><img src="icon-back-groups.svg" alt=""></button><img class="selectedCategoryImage0848" src="${categoryImage0848(selectedFoodCategory0848)}" alt=""><b>${selectedFoodCategory0848}</b></div>`;return}
 host.innerHTML=`<div class="categoryGrid0848">${Object.entries(CATEGORY_IMAGE_0848).map(([c,img])=>`<button type="button" class="categoryCard0848" data-category="${c}"><img src="${img}" alt=""><span>${c}</span></button>`).join('')}</div>`;
 host.querySelectorAll('.categoryCard0848').forEach(b=>b.onclick=()=>selectFoodCategory0848(b.dataset.category));
};
document.addEventListener('DOMContentLoaded',()=>{const list=document.getElementById('foodList');if(list&&!document.getElementById('foodCategoryNav0848')){const host=document.createElement('div');host.id='foodCategoryNav0848';list.before(host);renderFoodCategoryNavigation0848()}});
