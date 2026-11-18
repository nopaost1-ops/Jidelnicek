'use strict';
(()=>{
 function health(){
   const b=document.getElementById('lockHealthBtn');if(!b)return;
   const c=document.getElementById('lockCountdown');
   const body=(document.getElementById('healthSummary')?.textContent||'').toLocaleLowerCase('cs');
   const locked=body.includes('zamkn')||body.includes('uzam')||body.includes('odemknout')||(!c&&b.textContent.toLocaleLowerCase('cs').includes('zamknout'));
   if(locked){b.hidden=true;b.style.setProperty('display','none','important')}
 }
 function lab(){
   document.querySelectorAll('.labRow0840').forEach(row=>{
     const v=row.querySelector('.labValues0840');
     const info=row.querySelector('.labInfo0840');
     if(v&&info&&info.parentElement!==v)v.appendChild(info);
   });
 }
 function catalogSafety(){
   const d=document.getElementById('catalogDialog0853');
   if(!d)return;
   const close=()=>{try{if(d.open)d.close()}catch{};document.body.style.overflow=''};
   d.querySelector('#catalogClose0853')?.addEventListener('click',close,{once:false});
   d.querySelector('#catalogCancel0853')?.addEventListener('click',close,{once:false});
   d.addEventListener('cancel',e=>{e.preventDefault();close()},{once:false});
 }
 function tick(){health();lab();catalogSafety()}
 document.addEventListener('DOMContentLoaded',tick);document.addEventListener('click',()=>requestAnimationFrame(tick),true);
 new MutationObserver(tick).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();
