/* ============================================================
   EICT · Weekly Power-Up
   Five quick MCQs for every study-plan week, picked by the computer
   from the MCQ bank for that week's lesson, in the student's medium.
   The lesson is the one sir chose for the week in Admin (week.pu), or
   else is read from the week's unit and title, in English or Sinhala.
   Sir's fixes to the bank (bankfix.js) are laid over it first.

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
  const got={},POOL={},EVERY={},files={};
  function addScript(f){
    if(!files[f]) files[f]=new Promise((ok,no)=>{const s=document.createElement('script');s.src=BASE+f;s.onload=ok;s.onerror=()=>{delete files[f];no(new Error(f));};document.head.appendChild(s);});
    return files[f];                                   /* a file both media use is loaded once */
  }
  /* fixes: a function that loads sir's fixes to the bank (and lays them over it), or nothing */
  function load(med,fixes){
    if(!got[med]) got[med]=Promise.all(FILES[med].map(addScript))
      .then(()=>fixes?Promise.resolve(fixes()).catch(()=>null):null)
      .then(()=>rebuild(med)).catch(e=>{got[med]=null;throw e;});
    return got[med];
  }
  const good=q=>q&&!q.chk&&!q.removed&&Array.isArray(q.opts)&&q.opts.length>=2&&q.ans>=1&&q.ans<=q.opts.length&&q.u>=1&&q.u<=13;
  /* POOL: what can be picked. EVERY: every question, removed ones too, so a
     Power-Up already started keeps its own five */
  function rebuild(med){
    const pick=[],every={},P=(window.EICT_PP||{})[med]||[],G=med==='si'?window.EICT_MCQ_SI:window.EICT_MCQ;
    const add=q=>{if(every[q.id]) return;every[q.id]=q;if(good(q)) pick.push(q);};
    P.forEach(add);
    if(G&&G.levels) Object.keys(G.levels).forEach(lv=>(G.levels[lv].questions||[]).forEach((q,i)=>{
      if(!q.id) q.id='g-'+med+'-'+lv+'-'+i;add(q);}));
    /* the files load in whatever order the network brings them, so sort: every
       phone and Admin must shuffle the same list to pick the same five */
    pick.sort((x,y)=>x.id<y.id?-1:x.id>y.id?1:0);
    POOL[med]=pick;EVERY[med]=every;return pick;
  }

  /* ---------- which lesson a week is ---------- */
  /* words that name each lesson, in English and Sinhala, tried in this order:
     "basic concepts" first, then the specific lessons, so "ICT in Business" is
     not read as lesson 1 nor "Information and Communication …" as networking */
  const WORDS=[
    [1,['basic concept','concepts of ict','concept of ict','information and communication','මූලික සංකල්ප','තොරතුරු හා සන්නිවේදන']],
    [8,['database','dbms','sql','normali','e-r diagram','er diagram','දත්ත සමුදා','දත්ත ගබඩා']],
    [9,['programming','python','algorithm','pseudo','flow chart','flowchart','ක්‍රමලේඛ','පයිතන්','ඇල්ගොරිතම']],
    [10,['web','html','css','php','javascript','වෙබ්']],
    [11,['internet of things','iot','embedded','arduino','වස්තුන්ගේ අන්තර්ජාල','සියල්ලෙහි අන්තර්ජාල']],
    [12,['business','e-commerce','ecommerce','ව්‍යාපාර']],
    [13,['new trend','emerging','artificial intelligence','නව ප්‍රවණතා','නව නැඹුරු']],
    [7,['system analysis','systems analysis','analysis & design','analysis and design','sdlc','පද්ධති විශ්ලේෂණ']],
    [6,['communication','network','දත්ත සන්නිවේදන','ජාලකරණ','පරිගණක ජාල']],
    [5,['operating system','මෙහෙයුම් පද්ධති']],
    [4,['logic gate','logic','boolean','digital circuit','gates','තාර්කික','බූලියානු','අංකිත පරිපථ','සංඛ්‍යාංක පරිපථ']],
    [3,['data representation','number system','representation','දත්ත නිරූපණ','සංඛ්‍යා පද්ධති']],
    [2,['evolution of computer','evaluation of computer','introduction to computer','history of computer','computer system','evolution','පරිගණකයේ විකාශ','පරිගණක ඉතිහාස','පරිගණකය හැඳින්වීම','පරිගණක පද්ධති']]];
  /* 1–13: a lesson · 0: the whole syllabus (revision) · null: not known — sir chooses it in Admin */
  function unitOf(w){
    if(!w) return null;
    if(w.pu!==undefined&&w.pu!==null&&w.pu!=='') return +w.pu>=0&&+w.pu<=13?+w.pu:null;
    const u=String(w.unit||'').trim().toLowerCase(),t=String(w.title||'').toLowerCase(),both=u+' | '+t;
    const i=UNITNAMES.findIndex(n=>n.toLowerCase()===u);
    if(i>=0&&i<13) return i+1;
    for(const [n,ws] of WORDS) if(ws.some(x=>both.includes(x))) return n;
    if(/revision|past paper|papers|පුනරීක්ෂණ/.test(both)) return 0;
    const m=/unit\s*0?(\d{1,2})/i.exec(both);if(m&&+m[1]>=1&&+m[1]<=13) return +m[1];
    return null;
  }
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function shuffled(a,seed){let x=hash(seed)||1;const r=()=>{x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x/4294967296;};
    a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  /* parts of the same lesson (week 1 and 2 of Networking …) get different questions */
  function pick(weeks,i,med){
    const all=POOL[med]||[],u=unitOf(weeks[i]);
    if(u===null) return [];
    let off=0;for(let j=0;j<i;j++) if(unitOf(weeks[j])===u) off++;
    const from=u?all.filter(q=>q.u===u):all, order=shuffled(from,'pu|'+med+'|'+u+(u?'':'|'+i)), out=[];
    for(let k=0;k<order.length&&out.length<PER;k++){const q=order[(off*PER+k)%order.length];if(!out.includes(q)) out.push(q);}
    if(out.length<PER) for(const q of shuffled(all,'pu-fill|'+med+'|'+i)){if(out.length>=PER) break;if(!out.includes(q)) out.push(q);}
    return out;
  }
  const byId=(med,id)=>(EVERY[med]||{})[id];
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

  window.EICT_PU={PER,UNITNAMES,load,rebuild,unitOf,pick,byId,right,coins,finished};
})();
