/* ============================================================
   EICT — visitor counter.

   Add to a page with:  <script src="track.js" defer></script>

   Each visit adds one to a counter in Firestore:
     pageStats/{page}_{YYYY-MM-DD}   (Sri Lanka date)
   No names, no IP addresses, no cookies — only counts. A browser
   is remembered in localStorage so a person who reloads is one
   visitor, not ten. Stats.html reads the counters back.

   To stop counting your own visits: open Stats.html on that
   browser and switch "Count this browser" off.
   ============================================================ */
(function(){
  try{
    var cfg=window.FIREBASE_CONFIG;
    if(!cfg||!cfg.projectId||!cfg.apiKey||/PASTE/i.test(cfg.projectId)) return;
    if(navigator.webdriver||/bot|crawl|spider|slurp|preview/i.test(navigator.userAgent)) return;
    if(location.protocol!=='https:') return;             // local copies do not count
    var ls=window.localStorage;
    if(ls.getItem('eict-notrack')==='1') return;

    var page=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/i,'')||'index';
    page=page.replace(/[^A-Za-z0-9-]/g,'').slice(0,40);
    if(!page) return;

    // Date and hour in Sri Lanka, whatever the visitor's clock says.
    var parts={};
    new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'})
      .formatToParts(new Date()).forEach(function(p){ parts[p.type]=p.value; });
    var date=parts.year+'-'+parts.month+'-'+parts.day, hour=parts.hour;

    var bump=['views','h'+hour];
    var seenKey='eict-seen-'+page, seen=ls.getItem(seenKey);
    if(seen!==date){                                      // first visit today from this browser
      bump.push('visitors');
      if(!seen) bump.push('newVisitors');
      bump.push(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)?'mobile':'desktop');
      bump.push('src_'+source());
      ls.setItem(seenKey,date);
    }

    var id=page+'_'+date;
    var name='projects/'+cfg.projectId+'/databases/(default)/documents/pageStats/'+id;
    var body={writes:[{
      update:{name:name,fields:{page:{stringValue:page},date:{stringValue:date}}},
      updateMask:{fieldPaths:['page','date']},
      updateTransforms:bump.map(function(f){ return {fieldPath:f,increment:{integerValue:'1'}}; })
    }]};
    fetch('https://firestore.googleapis.com/v1/projects/'+cfg.projectId+'/databases/(default)/documents:commit?key='+cfg.apiKey,
      {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true})
      .catch(function(){});
  }catch(e){}

  // Where the visitor came from. Link-in-app browsers often send no
  // referrer, so the user agent is checked too.
  function source(){
    var r=(document.referrer||'').toLowerCase(), ua=navigator.userAgent;
    try{ if(r && new URL(r).host===location.host) return 'site'; }catch(e){}
    if(/whatsapp/.test(r)||/WhatsApp/i.test(ua)) return 'whatsapp';
    if(/facebook|fb\.|messenger/.test(r)||/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook';
    if(/youtube|youtu\.be/.test(r)) return 'youtube';
    if(/google\./.test(r)) return 'google';
    if(/tiktok/.test(r)||/musical_ly|TikTok/i.test(ua)) return 'tiktok';
    if(/instagram/.test(r)||/Instagram/i.test(ua)) return 'instagram';
    return r?'other':'direct';
  }
})();
