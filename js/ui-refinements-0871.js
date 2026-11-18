'use strict';
(()=>{
  let foodsWasActive=false;
  function catalogButton(){
    const b=document.getElementById('catalogUpdate0853');
    if(!b)return;
    const running=typeof catalogRunning0825!=='undefined'&&!!catalogRunning0825;
    b.disabled=running;
    b.setAttribute('aria-busy',running?'true':'false');
  }
  function foodsLock(){
    const f=document.getElementById('foods'),active=!!f?.classList.contains('active');
    document.body.classList.toggle('foods-page-lock0871',active);
    if(active&&!foodsWasActive){window.scrollTo(0,0);if(document.scrollingElement)document.scrollingElement.scrollTop=0}
    foodsWasActive=active;
  }
  function healthLockButton(){
    const b=document.getElementById('lockHealthBtn'),c=document.getElementById('lockCountdown');
    if(!b||!c)return;
    const t=(c.textContent||'').trim();
    if(/^0(?::00)?$/.test(t)||/^00:00$/.test(t)){b.hidden=true;b.style.display='none'}
  }
  function labOrder(){
    document.querySelectorAll('.labRow0840').forEach(row=>{
      const values=row.querySelector('.labValues0840'),info=row.querySelector('.labInfo0840');
      if(values&&info&&info.parentElement!==values)values.appendChild(info);
    });
    const h=document.querySelector('.labHeader0840');
    if(h&&!h.dataset.order0871){h.dataset.order0871='1';const labels=['Min','Hodnota','Max','Jednotka','Stav','Info'];h.replaceChildren(...labels.map(x=>{const s=document.createElement('span');s.textContent=x;return s}))}
  }
  function tick(){catalogButton();foodsLock();healthLockButton();labOrder()}
  new MutationObserver(tick).observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});
  document.addEventListener('click',()=>requestAnimationFrame(tick),true);
  document.addEventListener('DOMContentLoaded',tick);
  setInterval(catalogButton,400);
})();
