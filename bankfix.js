/* ============================================================
   EICT · MCQ bank corrections
   The bank itself is static files (mcq-bank*.js, pp/*.js). The fixes
   sir makes — a corrected answer, edited wording, a question taken out,
   a new question — live in Firestore bank/{id} and are laid over the
   files wherever the bank is used: the Power-Up, the quiz maker and
   Admin. Nothing in the files changes, so a fix can always be undone.

   bank/{id}  {ans, alt, text, opts, why, u, t}  any of them, to change
              {removed:true}                      left out everywhere
              {added:true, med, u, t, text, opts, ans, why}   a new question
   id is the question's id in one medium: 'en-2020-04', 'si-uva22-03',
   'g-en-beginner-3' (EICT's own), or 'x-en-…' for one sir added.
   ============================================================ */
(function(){
  if(window.EICT_FIX) return;
  const FIELDS=['ans','alt','text','opts','why','u','t'];
  const UNITS={1:'Concept of ICT',2:'Introduction to Computer',3:'Data Representation',4:'Digital Circuits',5:'Operating Systems',
    6:'Data Communication & Networking',7:'Systems Analysis & Design',8:'Database Management',9:'Programming (Python)',
    10:'Web Development',11:'Internet of Things',12:'ICT in Business',13:'New Trends in ICT'};
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let FIXES={};

  /* every question of the bank by its id, with its medium; EICT's own get their id here */
  function index(){
    const out={},P=window.EICT_PP||{};
    for(const med of ['si','en']) (P[med]||[]).forEach(q=>{out[q.id]={q,med};});
    for(const [med,G] of [['en',window.EICT_MCQ],['si',window.EICT_MCQ_SI]]) if(G&&G.levels)
      for(const lv of Object.keys(G.levels)) (G.levels[lv].questions||[]).forEach((q,i)=>{if(!q.id) q.id='g-'+med+'-'+lv+'-'+i;out[q.id]={q,med};});
    return out;
  }
  /* lay the fixes over the loaded files (safe to run again) */
  function apply(fixes){
    if(fixes) FIXES=fixes;
    const P=window.EICT_PP=window.EICT_PP||{si:[],en:[]},I=index();
    for(const id in FIXES){const f=FIXES[id];
      if(f.added){const med=f.med==='en'?'en':'si';P[med]=P[med]||[];
        let q=I[id]&&I[id].q;
        if(!q){q={id,y:'EICT',n:'',sch:'eict',src:'Added by sir',added:true};P[med].push(q);}
        FIELDS.forEach(k=>{if(f[k]!==undefined) q[k]=f[k];});
        q.removed=!!f.removed;continue;}
      const hit=I[id];if(!hit) continue;const q=hit.q;
      if(!q._orig){q._orig={chk:q.chk};FIELDS.forEach(k=>q._orig[k]=q[k]);}
      FIELDS.forEach(k=>{q[k]=f[k]!==undefined?f[k]:q._orig[k];});
      q.chk=f.ans!==undefined?false:q._orig.chk;           /* an answer sir set is checked */
      q.fixed_by_sir=true;q.removed=!!f.removed;}
    /* a fix that was deleted goes back to the file's version */
    for(const id in I){const q=I[id].q;if(q._orig&&!FIXES[id]){FIELDS.forEach(k=>q[k]=q._orig[k]);q.chk=q._orig.chk;delete q._orig;q.removed=false;q.fixed_by_sir=false;}}
    return FIXES;
  }
  async function load(FB,db){
    const s=await FB.getDocs(FB.collection(db,'bank'));const f={};s.forEach(d=>{f[d.id]=d.data();});return apply(f);
  }
  async function save(FB,db,id,fields){
    const v={...fields,at:new Date().toISOString()};
    await FB.setDoc(FB.doc(db,'bank',id),v);FIXES[id]=v;apply();return v;
  }
  async function undo(FB,db,id){await FB.deleteDoc(FB.doc(db,'bank',id));delete FIXES[id];apply();}
  const get=id=>{const h=index()[id];return h?h.q:null;};
  const medOf=id=>{const h=index()[id];return h?h.med:/^(en|g-en|x-en)/.test(id)?'en':'si';};
  /* the same question in the other medium, when the papers pair up */
  function twin(id){
    const m=/^(si|en)-(.+)$/.exec(id);if(m) return (m[1]==='si'?'en-':'si-')+m[2];
    const g=/^g-(si|en)-(.+)$/.exec(id);if(g) return 'g-'+(g[1]==='si'?'en':'si')+'-'+g[2];
    return null;
  }

  /* ---------- the editor ---------- */
  const CSS=`.bfx-ov{position:fixed;inset:0;background:#030616cc;z-index:9999;display:grid;place-items:center;padding:14px;font:15px/1.5 'Nunito','Noto Sans Sinhala',system-ui,sans-serif}
.bfx{background:#0e1640;color:#e9edff;border:1px solid #8ea4ff55;border-radius:16px;padding:18px;width:min(720px,100%);max-height:92vh;overflow:auto;box-shadow:0 30px 80px #000c}
.bfx h3{margin:0 0 4px;font-size:19px}.bfx .m{color:#9aa3d6;font-size:13px}
.bfx label{display:block;font-size:12.5px;font-weight:800;color:#9aa3d6;margin:12px 0 4px}
.bfx input,.bfx select,.bfx textarea{font:inherit;width:100%;background:#0a1029;color:#e9edff;border:1px solid #8ea4ff40;border-radius:9px;padding:8px 10px;box-sizing:border-box}
.bfx textarea{min-height:60px}.bfx .op{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;margin:6px 0}
.bfx .op input[type=radio]{width:20px;height:20px;accent-color:#35e08f}.bfx .op.ok textarea{border-color:#35e08f;background:#0d2a22}
.bfx .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}
.bfx button{font:inherit;font-weight:800;border:1px solid #8ea4ff40;background:#18245a;color:#fff;border-radius:10px;padding:9px 14px;cursor:pointer}
.bfx button:active{transform:scale(.96)}.bfx .g{background:linear-gradient(#ffe18a,#ffb52e);color:#3d2600}.bfx .r{background:#5e1430}
.bfx .x{background:none;border:0;color:#9aa3d6;padding:4px 8px}.bfx .er{color:#ff8da1;font-weight:800;min-height:20px;margin-top:8px}
.bfx img{max-width:100%;background:#fff;border-radius:8px;margin-top:8px}.bfx .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bfx .chk{display:flex;gap:8px;align-items:center;font-weight:700;color:#e9edff;font-size:14px}.bfx .chk input{width:18px;height:18px}`;
  function ensureCss(){if(document.getElementById('bfx-css')) return;const s=document.createElement('style');s.id='bfx-css';s.textContent=CSS;document.head.appendChild(s);}
  /* opens the editor; resolves with what was done ('saved' | 'removed' | 'restored' | null) */
  function edit({FB,db,id,med,topics}){
    ensureCss();
    return new Promise(done=>{
      const isNew=!id;
      if(isNew){med=med==='en'?'en':'si';id='x-'+med+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
      const q=get(id)||{u:1,t:'',text:'',opts:['','','','',''],ans:1,why:''};med=med||medOf(id);
      const fx=FIXES[id],tw=twin(id),twq=tw&&get(tw);
      const opts=(q.opts||[]).slice();while(opts.length<4) opts.push('');
      const ov=document.createElement('div');ov.className='bfx-ov';
      const tops=(topics&&topics[q.u])||[];
      ov.innerHTML=`<div class="bfx" role="dialog" aria-modal="true">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div>
          <h3>${isNew?'➕ New question':'✏️ Fix this question'}</h3>
          <div class="m">${isNew?(med==='en'?'English':'Sinhala')+' medium · added by you':esc(id)+' · '+(med==='en'?'English':'Sinhala')+' medium'+(q.src?' · '+esc(q.src):'')+(fx?' · <b style="color:#ffe28f">already fixed by you</b>':'')}</div></div>
          <button class="x" data-c>✕</button></div>
        ${q.ctx?`<label>Shared passage (from the paper, not editable)</label><div class="m" style="white-space:pre-line">${esc(q.ctx.text||'')}</div>`:''}
        <div class="two"><div><label>Lesson</label><select data-u>${Object.keys(UNITS).map(u=>`<option value="${u}" ${+u===+q.u?'selected':''}>${u}. ${esc(UNITS[u])}</option>`).join('')}</select></div>
          <div><label>Topic</label><input data-t value="${esc(q.t||'')}" list="bfx-tops"><datalist id="bfx-tops">${tops.map(t=>`<option value="${esc(t)}">`).join('')}</datalist></div></div>
        <label>Question</label><textarea data-q rows="3">${esc(q.text||'')}</textarea>
        ${q.img?`<img src="${esc((location.pathname.includes('/quest/')||location.pathname.includes('/pp/')?'../':'')+q.img)}" alt="">`:''}${q.code?`<pre class="m" style="white-space:pre-wrap">${esc(q.code)}</pre>`:''}
        <label>Answers — tick the correct one</label><div data-ops></div>
        <button data-add style="margin-top:4px">+ Add an answer</button>
        <label>Why this is the answer (shown to students afterwards)</label><textarea data-w rows="2">${esc(q.why||'')}</textarea>
        ${twq?`<label class="chk"><input type="checkbox" data-tw checked> Also correct the answer in the ${med==='en'?'Sinhala':'English'} version of this question</label>`:''}
        <div class="er" data-er></div>
        <div class="row"><button class="g" data-s>💾 Save</button><button data-c>Cancel</button>
          ${isNew?'':`<span style="flex:1"></span>${fx&&!fx.added?'<button data-orig title="Go back to the question as it is in the paper">↺ Back to original</button>':''}
          ${q.removed?'<button data-back>↩ Put it back in the bank</button>':'<button class="r" data-rm>🗑 Remove from the bank</button>'}`}</div></div>`;
      document.body.appendChild(ov);
      let ans=(q.ans||1)-1;
      const opsBox=ov.querySelector('[data-ops]');
      const drawOps=()=>{opsBox.innerHTML=opts.map((o,i)=>`<div class="op ${i===ans?'ok':''}"><input type="radio" name="bfx-a" value="${i}" ${i===ans?'checked':''} title="Correct answer">
        <textarea rows="1" data-o="${i}">${esc(o)}</textarea>${opts.length>2?`<button class="x" data-del="${i}" title="Remove this answer">✕</button>`:'<span></span>'}</div>`).join('');};
      drawOps();
      const close=r=>{ov.remove();done(r);};
      const err=t=>{ov.querySelector('[data-er]').textContent=t;};
      ov.addEventListener('input',e=>{const o=e.target.dataset.o;if(o!==undefined) opts[+o]=e.target.value;});
      ov.addEventListener('change',e=>{if(e.target.name==='bfx-a'){ans=+e.target.value;drawOps();}});
      ov.addEventListener('click',async e=>{const t=e.target;
        if(t===ov||t.closest('[data-c]')) return close(null);
        if(t.closest('[data-add]')){if(opts.length<6){opts.push('');drawOps();}return;}
        const d=t.closest('[data-del]');if(d){const i=+d.dataset.del;opts.splice(i,1);if(ans>=opts.length) ans=opts.length-1;else if(i<ans) ans--;drawOps();return;}
        const busy=async(fn,what)=>{t.disabled=true;const h=t.innerHTML;t.textContent='Saving…';try{await fn();close(what);}catch(x){t.disabled=false;t.innerHTML=h;err('Could not save: '+(x.code||x.message)+(/permission/.test(x.code||'')?' — publish firestore-rules.txt in the Firebase console.':''));}};
        if(t.closest('[data-rm]')){if(!confirm('Take this question out of the bank? It will no longer be picked for Power-Ups or new quizzes. Quizzes already made keep it.')) return;
          return busy(()=>save(FB,db,id,{...(FIXES[id]||{}),removed:true}),'removed');}
        if(t.closest('[data-back]')) return busy(()=>FIXES[id]&&!FIXES[id].added&&Object.keys(FIXES[id]).filter(k=>FIELDS.includes(k)).length===0?undo(FB,db,id):save(FB,db,id,{...FIXES[id],removed:false}),'restored');
        if(t.closest('[data-orig]')){if(!confirm('Undo every change you made to this question?')) return;return busy(()=>undo(FB,db,id),'restored');}
        if(t.closest('[data-s]')){
          const text=ov.querySelector('[data-q]').value.trim(),clean=opts.map(o=>o.trim());
          if(!text) return err('Write the question.');
          if(clean.length<2||clean.some(o=>!o)) return err('Every answer needs some text (or remove the empty one).');
          const f={u:+ov.querySelector('[data-u]').value,t:ov.querySelector('[data-t]').value.trim()||'Other',text,opts:clean,ans:ans+1,why:ov.querySelector('[data-w]').value.trim()};
          if(isNew) return busy(()=>save(FB,db,id,{...f,added:true,med}),'saved');
          /* keep only what differs from the paper, so the paper's own later corrections still come through */
          const base=q._orig||q,v={};
          for(const k of ['u','t','text','why']) if(f[k]!==(base[k]==null?'':base[k])&&!(k==='t'&&f[k]==='Other'&&!base[k])) v[k]=f[k];
          if(JSON.stringify(f.opts)!==JSON.stringify(base.opts)) v.opts=f.opts;
          if(f.ans!==base.ans||v.opts) v.ans=f.ans;
          if(fx&&fx.added) Object.assign(v,f,{added:true,med});
          if(fx&&fx.removed) v.removed=true;
          return busy(async()=>{
            if(!Object.keys(v).length) await undo(FB,db,id); else await save(FB,db,id,v);
            const box=ov.querySelector('[data-tw]');
            if(box&&box.checked&&f.ans!==(twq._orig||twq).ans) await save(FB,db,tw,{...(FIXES[tw]||{}),ans:f.ans});
          },'saved');
        }
      });
    });
  }
  window.EICT_FIX={load,apply,save,undo,get,twin,edit,index,UNITS,all:()=>FIXES};
})();
