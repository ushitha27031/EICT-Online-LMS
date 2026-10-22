/* ============================================================
   Click feedback for every button on the page: a ring bursts from
   the spot you pressed and the button flashes, so you can always
   tell a press was taken. Purely visual — it never changes what a
   button does. Include once: <script src="press.js" defer></script>
   ============================================================ */
(function(){
  if(window.__eictPress) return; window.__eictPress=1;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var css='@keyframes eictRing{from{transform:translate(-50%,-50%) scale(.15);opacity:.9}to{transform:translate(-50%,-50%) scale(1);opacity:0}}'+
    '.eict-ring{position:fixed;width:90px;height:90px;border-radius:50%;pointer-events:none;z-index:2147483647;'+
      'border:2.5px solid rgba(56,225,255,.95);box-shadow:0 0 20px rgba(56,225,255,.6),inset 0 0 14px rgba(56,225,255,.35);animation:eictRing .48s ease-out forwards}'+
    '.eict-ring.g{border-color:rgba(255,201,60,.95);box-shadow:0 0 20px rgba(255,201,60,.6),inset 0 0 14px rgba(255,201,60,.35)}'+
    '@keyframes eictFlash{0%{filter:brightness(1)}25%{filter:brightness(1.45) saturate(1.2)}100%{filter:brightness(1)}}'+
    '.eict-flash{animation:eictFlash .38s ease-out}';
  var st=document.createElement('style'); st.textContent=css;
  (document.head||document.documentElement).appendChild(st);
  var SEL='button,.btn,.b,a.b1,a.b2,a.b3,[role=button],input[type=submit],input[type=button],input[type=checkbox],input[type=radio],label.chk,label.pick,summary';
  document.addEventListener('pointerdown',function(e){
    if(e.button>0) return;
    var el=e.target.closest&&e.target.closest(SEL);
    if(!el||el.disabled||el.getAttribute('aria-disabled')==='true') return;
    var r=document.createElement('span');
    r.className='eict-ring'+(/gold|b2|b1|go/.test(el.className||'')?' g':'');
    r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px';
    document.body.appendChild(r);
    setTimeout(function(){ r.remove(); },520);
    el.classList.remove('eict-flash'); void el.offsetWidth; el.classList.add('eict-flash');
    setTimeout(function(){ el.classList.remove('eict-flash'); },400);
  },{passive:true,capture:true});
})();
