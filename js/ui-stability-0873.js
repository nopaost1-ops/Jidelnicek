'use strict';
(()=>{
 let lastFoods=false;
 const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
 const tx=e=>(e?.textContent||'').trim();
 function foodsBase(){const p=q('#foods');if(!p)return;const a=p.classList.contains('active');document.body.classList.toggle('foods-page-lock0873',a);if(a&&!lastFoods){scrollTo(0,0);if(document.scrollingElement)document.scrollingElement.scrollTop=0}lastFoods=a}
 function hideSource(){const p=q('#foods');if(!p)return;qa('*',p).forEach(e=>{if(e.children.length===0&&/open\s*food\s*facts/i.test(tx(e)))e.style.display='none'})}
 function categoryHosts(p){return qa('.categoryGrid0859,.categoryGrid0854,.categoryGrid0853,.foodCategories0859,.foodCategories0832,.categoriesGrid0832,.categoryGrid0832',p)}
 function scannerResult(){const p=q('#foods');if(!p)return;const input=q('#search',p)||q('input[type="search"]',p);const raw=String(input?.value||'');const ean=raw.replace(/\D/g,'');const rows=qa('.foodRow0832,.foodRow0859,.foodRow0854,.foodRow0853,[data-food-key]',p).filter(e=>e.offsetParent!==null);const found=ean.length>=8&&rows.length>0;categoryHosts(p).forEach(g=>g.hidden=found);if(found){const v=q('.foodScrollViewport0859,.foodScrollViewport0858,.foodScrollViewport0854,.foodScrollViewport0853,.foodScrollViewport0851,.foodScrollViewport0850',p);if(v)v.scrollTop=0}}
 function health(){const b=q('#lockHealthBtn');if(!b)return;const c=q('#lockCountdown');const countdown=tx(c);const summary=(tx(q('#healthSummary'))+' '+tx(q('#healthDialog'))).toLocaleLowerCase('cs');const explicitlyUnlocked=/odemknuto|nezamknuto|unlocked/.test(summary);const countdownActive=/\d/.test(countdown)&&!/^0{1,2}(?::0{2})?$/.test(countdown)&&countdown!=='00:00';const show=countdownActive||explicitlyUnlocked;b.hidden=!show;b.style.display=show?'':'none'}
 function lab(){qa('.labRow0840').forEach(r=>{const v=q('.labValues0840',r),i=q('.labInfo0840',r);if(v&&i&&i.parentElement!==v)v.appendChild(i)})}
 function run(){foodsBase();hideSource();scannerResult();health();lab()}
 document.addEventListener('DOMContentLoaded',run);document.addEventListener('input',run,true);document.addEventListener('change',run,true);document.addEventListener('click',()=>requestAnimationFrame(run),true);
 // Scanner and async search change the list without an input event. Observe Foods only, not the whole app.
 const start=()=>{const p=q('#foods');if(p)new MutationObserver(()=>requestAnimationFrame(()=>{hideSource();scannerResult()})).observe(p,{subtree:true,childList:true})};
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
