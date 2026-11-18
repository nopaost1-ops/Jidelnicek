'use strict';
(()=>{
 let scheduled=false,lastFoods=false;
 const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
 function text(e){return (e?.textContent||'').trim()}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
 function catalog(){
   const d=q('#catalogDialog0853');
   if(!d)return;
   document.body.classList.toggle('modal-open0873',!!d.open);
 }
 function health(){
   const b=q('#lockHealthBtn'),c=q('#lockCountdown');if(!b)return;
   const t=text(c);const active=/\d/.test(t)&&!/^0{1,2}(?::0{2})?$/.test(t)&&t!=='00:00';
   const shouldShow=active;
   if(b.hidden===shouldShow)b.hidden=!shouldShow;
   const desired=shouldShow?'':'none';if(b.style.display!==desired)b.style.display=desired;
 }
 function foods(){
   const page=q('#foods');if(!page)return;
   const active=page.classList.contains('active');
   document.body.classList.toggle('foods-page-lock0873',active);
   if(active&&!lastFoods){scrollTo(0,0);if(document.scrollingElement)document.scrollingElement.scrollTop=0}
   lastFoods=active;
   // Hide fleeting data-source labels, including Open Food Facts.
   qa('*',page).forEach(e=>{if(e.children.length===0&&/open\s*food\s*facts/i.test(text(e))&&e.style.display!=='none')e.style.display='none'});
   const input=q('#search',page)||q('input[type="search"]',page);
   const ean=String(input?.value||'').replace(/\D/g,'');
   const rows=qa('.foodRow0832,.foodRow0859,.foodRow0854,.foodRow0853,[data-food-key]',page).filter(e=>e.offsetParent!==null);
   const found=ean.length>=8&&rows.length>0;
   qa('.categoryGrid0859,.categoryGrid0854,.categoryGrid0853,.foodCategories0859,.foodCategories0832,.categoriesGrid0832',page).forEach(g=>{const v=found?'none':'';if(g.style.display!==v)g.style.display=v});
   if(found){const vp=q('.foodScrollViewport0859,.foodScrollViewport0858,.foodScrollViewport0854,.foodScrollViewport0853,.foodScrollViewport0851,.foodScrollViewport0850',page);if(vp&&vp.scrollTop!==0)vp.scrollTop=0}
 }
 function lab(){
   qa('.labRow0840').forEach(row=>{const v=q('.labValues0840',row),info=q('.labInfo0840',row);if(v&&info&&info.parentElement!==v)v.appendChild(info)});
 }
 function apply(){catalog();health();foods();lab()}
 new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','open','value']});
 document.addEventListener('input',schedule,true);document.addEventListener('change',schedule,true);document.addEventListener('click',schedule,true);document.addEventListener('DOMContentLoaded',schedule);
})();
