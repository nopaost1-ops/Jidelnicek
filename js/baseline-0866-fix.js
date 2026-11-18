'use strict';
(() => {
  function activeFoods0866(){
    const foods=document.getElementById('foods');
    return foods && foods.classList.contains('active') ? foods : null;
  }
  function stabilizeFoods0866(){
    const foods=activeFoods0866();
    const root=document.documentElement;
    if(!foods){
      root.classList.remove('foodsLock0866');
      document.body.classList.remove('foodsLock0866');
      document.getElementById('foods')?.classList.remove('foodsViewport0866');
      return;
    }
    const header=document.querySelector('header');
    const nav=document.querySelector('nav');
    const top=Math.max(0,Math.round(header?.getBoundingClientRect().bottom||0));
    const bottom=Math.max(0,Math.round(innerHeight-(nav?.getBoundingClientRect().top||innerHeight)));
    root.style.setProperty('--foods-top-0866',top+'px');
    root.style.setProperty('--foods-bottom-0866',bottom+'px');
    root.classList.add('foodsLock0866');
    document.body.classList.add('foodsLock0866');
    foods.classList.add('foodsViewport0866');
    window.scrollTo(0,0);
    if(document.scrollingElement)document.scrollingElement.scrollTop=0;
    const viewport=foods.querySelector('.foodScrollViewport0859,.foodScrollViewport0858,.foodScrollViewport0854,.foodScrollViewport0853,.foodScrollViewport0851,.foodScrollViewport0850');
    if(viewport) viewport.style.overflowY='auto';
  }
  document.addEventListener('click',()=>requestAnimationFrame(stabilizeFoods0866),true);
  window.addEventListener('resize',stabilizeFoods0866,{passive:true});
  document.addEventListener('DOMContentLoaded',stabilizeFoods0866);
  new MutationObserver(stabilizeFoods0866).observe(document.documentElement,{subtree:true,attributeFilter:['class']});
})();
