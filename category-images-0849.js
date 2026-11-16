'use strict';
window.CATEGORY_IMAGE_0849={'Ovoce':'cat-fruit.webp','Zelenina':'cat-vegetables.webp','Maso a ryby':'cat-meat-fish.webp','Mléčné výrobky':'cat-dairy.webp','Vejce':'cat-eggs.webp','Obiloviny a přílohy':'cat-grains.webp','Luštěniny':'cat-legumes.webp','Ořechy a semena':'cat-nuts-seeds.webp','Tuky a oleje':'cat-fats-oils.webp','Nápoje':'cat-drinks.webp','Ostatní':'cat-other.webp'};
window.selectedFoodCategory0849='';
window.categoryImage0849=c=>CATEGORY_IMAGE_0849[c]||CATEGORY_IMAGE_0849.Ostatní;
window.selectFoodCategory0849=function(category){selectedFoodCategory0849=category||'';const search=document.getElementById('search');if(search)search.value='';renderFoodCategoryNavigation0849();window.renderFoods0832?.(true)};
window.backToFoodCategories0849=function(){selectedFoodCategory0849='';const search=document.getElementById('search');if(search)search.value='';renderFoodCategoryNavigation0849();window.renderFoods0832?.(true)};
window.renderFoodCategoryNavigation0849=function(){
 const host=document.getElementById('foodCategoryNav0849');if(!host)return;
 if(selectedFoodCategory0849){host.innerHTML=`<div class="selectedCategory0849"><button type="button" class="categoryBack0849" onclick="backToFoodCategories0849()" aria-label="Zpět na skupiny potravin"><img src="icon-back-groups.svg" alt=""></button><img class="selectedCategoryImage0849" src="${categoryImage0849(selectedFoodCategory0849)}" alt=""><b>${selectedFoodCategory0849}</b></div>`;return}
 host.innerHTML=`<div class="categoryGrid0849">${Object.entries(CATEGORY_IMAGE_0849).map(([c,img])=>`<button type="button" class="categoryCard0849" data-category="${c}"><img src="${img}" alt=""><span>${c}</span></button>`).join('')}</div>`;
 host.querySelectorAll('.categoryCard0849').forEach(b=>b.onclick=()=>selectFoodCategory0849(b.dataset.category));
};
document.addEventListener('DOMContentLoaded',()=>{const list=document.getElementById('foodList');if(list&&!document.getElementById('foodCategoryNav0849')){const host=document.createElement('div');host.id='foodCategoryNav0849';list.before(host);renderFoodCategoryNavigation0849()}});
