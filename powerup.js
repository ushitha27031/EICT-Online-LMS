/* ============================================================
   EICT · Weekly Power-Up
   Five quick MCQs for every study-plan week, picked by the computer
   from the MCQ bank for that week's lesson, in the student's medium.
   Nothing to set up per week: the lesson comes from the week's unit.

   Coins (worked out here, so the study plan and Admin agree):
     +5   each right answer on the first go
     +15  all five right
     +10, +20 … +50  streak: Power-Ups done in back-to-back weeks
   Answers are kept in journey/{code}.pu[week] = {q:[ids], a:[picks], ok:[…], at, med}.
   ============================================================ */
(function(){
  const UNITNAMES=['Basic Concepts of ICT','Evolution of Computers','Data Representation','Digital Circuits',
    'Operating Systems','Data Communication & Networking','System Analysis & Design','Database Management',
    'Programming','Web Development','Internet of Things','ICT in Business','New Trends','Papers & revision'];
  const BASE=(document.currentScript&&document.currentScript.src||'').replace(/powerup\.js.*$/,'');
  const FILES={
    en:['mcq-bank.js','pp/pp-en-2020.js','pp/pp-en-2021.js','pp/pp-en-2022.js','pp/pp-en-2023.js','pp/pp-en-2024.js','pp/pp-en-2025.js',
        'pp/sp-devi21.js','pp/sp-model19.js','pp/sp-royal22.js','pp/sp-sbv19.js','pp/sp-sbv22.js','pp/sp-sp22.js','pp/sp-vis16.js'],
    si:['mcq-bank-si.js','pp/pp-si-2020.js','pp/pp-si-2021.js','pp/pp-si-2022.js','pp/pp-si-2023.js','pp/pp-si-2024.js','pp/pp-si-2025.js',
        'pp/pp-si-2026.js','pp/sp-sp22.js','pp/sp-uva22.js']};
  const PER=5;

  /* ---------- the bank, loaded once and only when a week is opened ---------- */
  const got={},POOL={};
  function addScript(f){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=BASE+f;s.onload=ok;s.onerror=()=>no(new Error(f));document.head.appendChild(s);});}
  function load(med){
    if(!got[med]) got[med]=Promise.all(FILES[med].map(addScript)).then(()=>{POOL[med]=build(med);return POOL[med];})
      .catch(e=>{got[med]=null;throw e;});
    return got[med];
  }
  const good=q=>q&&!q.chk&&Array.isArray(q.opts)&&q.opts.length>=2&&q.ans>=1&&q.ans<=q.opts.length&&q.u>=1&&q.u<=13;
  function build(med){
    const out=[],P=(window.EICT_PP||{})[med]||[],G=med==='si'?window.EICT_MCQ_SI:window.EICT_MCQ,seen=new Set();
    P.forEach(q=>{if(good(q)&&!seen.has(q.id)){seen.add(q.id);out.push(q);}});
    if(G&&G.levels) Object.keys(G.levels).forEach(lv=>(G.levels[lv].questions||[]).forEach((q,i)=>{
      if(good(q)) out.push(Object.assign({},q,{id:'g-'+med+'-'+lv+'-'+i}));}));
    return out;
  }

  /* ---------- which questions a week gets ---------- */
  function unitOf(w){
    if(!w) return 0;
    const u=String(w.unit||'').trim().toLowerCase(),t=String(w.title||'').toLowerCase();
    let i=UNITNAMES.findIndex(n=>n.toLowerCase()===u);
    if(i<0) i=UNITNAMES.findIndex(n=>u&&(u.includes(n.toLowerCase())||n.toLowerCase().includes(u)));
    if(i<0) i=UNITNAMES.findIndex(n=>t.startsWith(n.toLowerCase()));
    if(i<0){const m=/unit\s*0?(\d{1,2})/i.exec(u+' '+t);if(m) i=+m[1]-1;}
    return i>=0&&i<13?i+1:0;                         /* 0: revision — the whole syllabus */
  }
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function shuffled(a,seed){let x=hash(seed)||1;const r=()=>{x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x/4294967296;};
    a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  /* parts of the same lesson (week 1 and 2 of Networking …) get different questions */
  function pick(weeks,i,med){
    const all=POOL[med]||[],u=unitOf(weeks[i]);
    let off=0;for(let j=0;j<i;j++) if(unitOf(weeks[j])===u) off++;
    const from=u?all.filter(q=>q.u===u):all, order=shuffled(from,'pu|'+med+'|'+u+(u?'':'|'+i)), out=[];
    for(let k=0;k<order.length&&out.length<PER;k++){const q=order[(off*PER+k)%order.length];if(!out.includes(q)) out.push(q);}
    if(out.length<PER) for(const q of shuffled(all,'pu-fill|'+med+'|'+i)){if(out.length>=PER) break;if(!out.includes(q)) out.push(q);}
    return out;
  }
  const byId=(med,id)=>(POOL[med]||[]).find(q=>q.id===id);
  const right=(q,j)=>j===q.ans-1||!!(q.alt&&q.alt.includes(j+1));

  /* ---------- coins ---------- */
  const finished=r=>!!(r&&r.a&&r.a.length>=PER);
  function coins(pu){
    pu=pu||{};let total=0;const per={};
    for(const k in pu){const r=pu[k];if(!r||!r.ok) continue;
      const c=r.ok.slice(0,PER).filter(Boolean).length,perfect=finished(r)&&c===PER?15:0;
      let run=0;if(finished(r)){run=1;while(finished(pu[+k-run])) run++;}
      const streak=run>1?Math.min(50,10*(run-1)):0;
      per[k]={right:c,base:5*c,perfect,streak,run};total+=5*c+perfect+streak;}
    return {total,per};
  }

  window.EICT_PU={PER,UNITNAMES,load,unitOf,pick,byId,right,coins,finished};
})();
