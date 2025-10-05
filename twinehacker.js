
// TwineForge — clean build: pins, skinsbar, drag+resize, fixed Open/unpin
(function(){try{if(typeof window.cont!=='function'){window.cont=function(){return document.getElementById('VarStateContainer');};}}catch(e){}})();
function initFailed (msg){ alert("Failed to load TwineForge. Reason: " + msg); }
function getActiveStateVariables(){ var state = SugarCube.State || SugarCube.state; return state.active.variables; }
var updateDOMValues = true; var updateDOMValuesInterval = 0;

function trackChanges(oldVariablesJson){
  var newVariables = getActiveStateVariables();
  var newVariablesJson = JSON.stringify(newVariables);
  if(typeof oldVariablesJson !== "undefined") {
    if(oldVariablesJson !== newVariablesJson) {
      var diffs = findObjDiff(JSON.parse(oldVariablesJson), JSON.parse(newVariablesJson));
      var diffKeys = Object.keys(diffs);
      if(diffKeys.length > 0){
        var allInputs = document.querySelectorAll('.var-input');
        for(var i = 0; i < allInputs.length; i++) { allInputs[i].classList.remove('value-changed'); }
        for(var i = 0; i < diffKeys.length; i++) {
          var diffKey = diffKeys[i]; var diffVal = diffs[diffKey];
          if(updateDOMValues) {
            var inputElement = document.querySelector('.Gamestate.' + diffKey);
            if(inputElement) { inputElement.value = diffVal.newVal; inputElement.classList.add('value-changed'); }
          }
        }
      }
    }
  }
  setTimeout(function(){ trackChanges(newVariablesJson); }, 250);
}

var objectToDOM = (function(){
  function objectToDOM(obj, key, ref){
    var _parent = document.createElement('div'); _parent.classList.add('var-type-object');
    var _title = document.createElement('span'); _title.classList.add('var-title'); _title.innerText = key;
    var _propertyContainer = document.createElement('div'); _propertyContainer.classList.add('var-properties');
    _propertyContainer.addEventListener('click', function(e){ e.stopPropagation(); });
    _parent.appendChild(_title); _parent.appendChild(_propertyContainer);
    function childPropertyChangeHandler(e){ e.stopPropagation(); var value = e.detail.value; var childKey = key + "." + e.detail.key; var event = new CustomEvent('propertyChange', { detail: {key: childKey, value: value }}); _parent.dispatchEvent(event); }
    for(var propKey in obj){ var property = obj[propKey]; var propRef = ref + "." + propKey; var _child = propertyToDOM(property, propKey, propRef);
      if(typeof _child !== "undefined") { _propertyContainer.appendChild(_child); _child.addEventListener('propertyChange', childPropertyChangeHandler); } }
    return _parent;
  }
  function numberToDOM(num, key, ref){
    var _parent = document.createElement('div'); _parent.classList.add('var-field','var-type-number');
    var _title = document.createElement('span'); _title.classList.add('var-title'); _title.innerText = key;
    var _input = document.createElement('input'); _input.classList.add('var-input'); _input.setAttribute('type', 'number'); _input.value = num;
    var refArr = ref.split("."); for(var k in refArr){ _input.classList.add(refArr[k]); }
    _parent.appendChild(_title); _parent.appendChild(_input);
    function inputHandler(e){ e.stopPropagation(); var value = parseFloat(_input.value); var event = new CustomEvent('propertyChange', { detail: {key: key, value: value }, bubbles: true}); _input.dispatchEvent(event); }
    _input.addEventListener('keyup', inputHandler); _input.addEventListener('change', inputHandler); return _parent;
  }
  function stringToDOM(str, key, ref){
    var _parent = document.createElement('div'); _parent.classList.add('var-field','var-type-text');
    var _title = document.createElement('span'); _title.classList.add('var-title'); _title.innerText = key;
    var _input = document.createElement('input'); _input.classList.add('var-input'); _input.setAttribute('type', 'text'); _input.value = str;
    var refArr = ref.split("."); for(var k in refArr){ _input.classList.add(refArr[k]); }
    _parent.appendChild(_title); _parent.appendChild(_input);
    function inputHandler(e){ e.stopPropagation(); var event = new CustomEvent('propertyChange', { detail: {key: key, value: _input.value }}); _input.dispatchEvent(event); }
    _input.addEventListener('keyup', inputHandler); _input.addEventListener('change', inputHandler); return _parent;
  }
  function propertyToDOM(property, key, ref){
    if(typeof property === "object") return objectToDOM(property, key, ref);
    else if(typeof property === "number") return numberToDOM(property, key, ref);
    else if(typeof property === "string") return stringToDOM(property, key, ref);
  }
  return objectToDOM;
})();

function findObjDiff(oldObj, newObj, prefix){
  var changes = {}; if(typeof prefix !== "string") prefix = "";
  for(var k in newObj) {
    var key = prefix + k;
    if(typeof oldObj[k] === "undefined") { changes[key] = { newVal: newObj[k] }; }
    else {
      var newVal = newObj[k]; var t = typeof(newVal);
      if(t === "object") {
        var childChanges = findObjDiff(oldObj[k], newObj[k], prefix + k + "."); for(var ck in childChanges) { changes[ck] = childChanges[ck]; }
      } else { var oldVal = oldObj[k]; if(oldVal !== newVal) { changes[key] = { oldVal: oldVal, newVal: newVal }; } }
    }
  }
  return changes;
}

if(typeof SugarCube === "undefined") initFailed("SugarCube not found");
else {
  var state = SugarCube.state || SugarCube.State;
  if(typeof state === "undefined") initFailed("State not found");
  else {
    trackChanges();
    var _stateContainer = document.createElement('div'); _stateContainer.setAttribute('id', 'VarStateContainer');
    var gameStateDOM = objectToDOM(state.active.variables, "Gamestate", "Gamestate");
    _stateContainer.appendChild(gameStateDOM);
    gameStateDOM.addEventListener('propertyChange', function(e){
      var parentObj = getActiveStateVariables();
      var keyArr = e.detail.key.split('.');
      for(var i = 1; i < (keyArr.length - 1); i++) { parentObj = parentObj[keyArr[i]]; }
      updateDOMValues = false; clearTimeout(updateDOMValuesInterval); updateDOMValuesInterval = setTimeout(function(){ updateDOMValues = true; }, 250);
      parentObj[keyArr[keyArr.length - 1]] = e.detail.value;
    });
    document.querySelector('body').appendChild(_stateContainer);
  }
}

(function(){
  const PINS_KEY='th-pins', SKIN_KEY='th-skin';
  const MIN_W=300, MIN_H=240, MAX_W=900, MAX_H=900, EDGE=8, MARGIN=8;
  const LS_W='th-width', LS_H='th-height', LS_L='th-left', LS_T='th-top';
  const $ = sel => document.querySelector(sel);
  const $$ = (root, sel) => Array.from(root.querySelectorAll(sel));
  function cont(){ return document.getElementById('VarStateContainer'); }
  function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
  function onTop(el){ el.style.zIndex = '2147483647'; }
  function labelOfTitle(titleEl){ if(!titleEl) return ''; let txt=''; titleEl.childNodes.forEach(n=>{ if(n.nodeType===3) txt += n.textContent; }); if(!txt) txt = titleEl.textContent || ''; return (txt||'').trim(); }
  function getPins(){ try{return JSON.parse(localStorage.getItem(PINS_KEY)||'[]');}catch(e){return [];} }
  function setPins(a){ try{ localStorage.setItem(PINS_KEY, JSON.stringify(Array.from(new Set(a)))) }catch(e){} }
  function isPinned(ref){ return getPins().includes(ref); }
  function togglePin(ref){ const p=getPins(); const i=p.indexOf(ref); if(i>=0) p.splice(i,1); else p.push(ref); setPins(p); try{ updatePinButtons(); }catch(e){} try{ renderPinned(); }catch(e){} }
  function getAncestorTitles(el){ const names=[]; let node=el; const root=cont(); while(node && node!==root){ if(node.classList && node.classList.contains('var-type-object')){ const t=node.querySelector(':scope > .var-title'); if(t) names.push(labelOfTitle(t)); } node=node.parentElement; } names.reverse(); return names; }
  function refForField(field){ const names=getAncestorTitles(field); const label=labelOfTitle(field.querySelector('.var-title')); const start=(names[0]==='Gamestate')?[]:['Gamestate']; return start.concat(names,[label]).join('.'); }
  function refForSection(section){ const names=getAncestorTitles(section); const self=labelOfTitle(section.querySelector(':scope > .var-title')); const start=(names[0]==='Gamestate')?[]:['Gamestate']; return start.concat(names,[self]).join('.'); }
  function findFieldByRef(ref){ const root=cont(); if(!root) return null; for(const f of $$(root,'.var-field')){ if(refForField(f)===ref) return f; } return null; }
  function findSectionByRef(ref){ const root=cont(); if(!root) return null; for(const s of $$(root,'.var-type-object')){ if(refForSection(s)===ref) return s; } return null; }

  /* header + skins bar */
  function ensureHeader(){
    const el=cont(); if(!el) return;
    let head=el.querySelector('#th-header');
    if(!head){
      head=document.createElement('div'); head.id='th-header';
      const title=document.createElement('div'); title.id='th-title'; title.textContent='TwineForge';
      const sw=document.createElement('div'); sw.id='th-search-wrap';
      const search=document.createElement('input'); search.id='th-search'; search.type='search'; search.placeholder='Search (name or value)…';
      sw.appendChild(search);
      const findNav=document.createElement('div'); findNav.className='th-find-nav';
      const prevBtn=document.createElement('button'); prevBtn.id='th-prev'; prevBtn.title='Previous result'; prevBtn.textContent='▲';
      const nextBtn=document.createElement('button'); nextBtn.id='th-next'; nextBtn.title='Next result'; nextBtn.textContent='▼';
      findNav.appendChild(prevBtn); findNav.appendChild(nextBtn); sw.appendChild(findNav);
      head.appendChild(title); head.appendChild(sw);
      el.insertBefore(head, el.firstChild);
      wireHeader(head);
    } else if(!head.dataset.wired){ wireHeader(head); }
    ensureSkinsBar(head);
  }
  function wireHeader(head){
    head.dataset.wired='1';
    const el=cont();
    const search=head.querySelector('#th-search');
    const prevBtn=head.querySelector('#th-prev');
    const nextBtn=head.querySelector('#th-next');
    let findState={q:'', list:[], idx:-1};
    function clearCurrent(){ el.querySelectorAll('.th-current').forEach(x=>x.classList.remove('th-current')); }
    function collectMatches(){ const out=[]; el.querySelectorAll('.var-field').forEach(row=>{ if(row.style.display!== 'none' && row.classList.contains('th-match')) out.push(row); }); return out; }
    function openAncestors(node){ let p=node.parentElement; while(p && p!==el){ if(p.classList && p.classList.contains('var-type-object')) p.classList.add('properties-open'); p=p.parentElement; } }
    function focusMatch(step){ if(!findState.list.length) return; if(typeof step==='number' && step!==0){ findState.idx=(findState.idx+step+findState.list.length)%findState.list.length; } if(findState.idx<0) findState.idx=0; clearCurrent(); const row=findState.list[findState.idx]; if(!row) return; openAncestors(row); (row.querySelector('.var-input')||row).scrollIntoView({behavior:'smooth', block:'center'}); row.classList.add('th-current'); }
    function applyFilter(q){
      findState.q=(q||'').trim().toLowerCase();
      const ql=findState.q;
      $$(el,'.var-field').forEach(row=>{
        const key=(row.querySelector('.var-title')?.textContent||'').trim();
        const val=row.querySelector('.var-input')?.value||'';
        const match= ql==='' ? true : (key+' '+val).toLowerCase().includes(ql);
        row.style.display = match ? '' : 'none'; row.classList.toggle('th-match', match && ql!=='');
      });
      if(ql){ $$(el,'.var-type-object').forEach(s=>s.classList.add('properties-open')); }
      clearCurrent(); findState.list = ql ? collectMatches() : []; findState.idx  = findState.list.length ? 0 : -1; if(findState.idx>=0) focusMatch(0);
    }
    search?.addEventListener('input',e=>applyFilter(e.target.value));
    prevBtn?.addEventListener('click',()=>focusMatch(-1));
    nextBtn?.addEventListener('click',()=>focusMatch(+1));
    el.addEventListener('click', (ev)=>{
      const t = ev.target.closest('.var-type-object > .var-title');
      if (!t || !el.contains(t)) return;
      t.parentElement?.classList.toggle('properties-open');
    }, true);
  }
  function ensureSkinsBar(head){
    let bar=document.getElementById('th-skinsbar');
    if(bar) return;
    bar=document.createElement('div'); bar.id='th-skinsbar';
    bar.innerHTML='<span class="label">Skins:</span>';
    const select=document.createElement('select'); select.id='th-skin-select';
    select.appendChild(new Option('None (default)','__none__'));
    const reloadBtn=document.createElement('button'); reloadBtn.id='th-reload-skins'; reloadBtn.textContent='Reload';
    bar.appendChild(select); bar.appendChild(reloadBtn);
    head.appendChild(bar);

    const skinLinkId='th-skin-link';
    function applySkin(id, href, addClass){
      const root=cont();
      Array.from(root.classList).filter(c=>c.startsWith('skin-')).forEach(c=>root.classList.remove(c));
      if(addClass) root.classList.add(addClass);
      let link=document.getElementById(skinLinkId);
      if(id==='__none__' || !href){
        if(link) link.remove();
        localStorage.removeItem(SKIN_KEY);
        return;
      }
      if(!link){
        link=document.createElement('link'); link.id=skinLinkId; link.rel='stylesheet'; link.href=href;
        document.documentElement.appendChild(link);
      } else { link.href=href; }
      localStorage.setItem(SKIN_KEY, JSON.stringify({id, href, addClass}));
    }
    async function loadSkinsList(){
      const base=(document.getElementById('th-style')?.getAttribute('href')||'').replace(/twinehacker\.css.*$/,''); 
      const url=base + 'Skins/skins.json';
      try{
        const res = await fetch(url); if(!res.ok) throw new Error('HTTP '+res.status);
        const data = await res.json();
        select.innerHTML=''; select.appendChild(new Option('None (default)','__none__'));
        (data.skins||[]).forEach(s=>{
          const opt=new Option(s.name, s.id);
          opt.dataset.href = base + 'Skins/' + s.file;
          opt.dataset.cls = 'skin-' + (s.id||'custom');
          select.appendChild(opt);
        });
        try{
          const saved = JSON.parse(localStorage.getItem(SKIN_KEY) || 'null');
          if(saved && saved.id){ select.value = saved.id; applySkin(saved.id, saved.href, saved.addClass); }
          else { select.value='__none__'; }
        }catch(e){}
      }catch(err){ console.warn('[TwineForge] Unable to load skins list:', err); }
    }
    reloadBtn.addEventListener('click', loadSkinsList);
    select.addEventListener('change',()=>{
      const v=select.value; if(v==='__none__'){ applySkin(v, null, null); return; }
      const opt=select.options[select.selectedIndex]; const href=opt.dataset.href; const cls=opt.dataset.cls; applySkin(v, href, cls);
    });
    loadSkinsList();
  }

  /* Pinned system */
  function ensurePinnedSection(){
    const el=cont(); if(!el) return null;
    let sec=document.getElementById('TH-PINNED');
    if(!sec){
      sec=document.createElement('div'); sec.id='TH-PINNED'; sec.className='var-type-object properties-open';
      const title=document.createElement('span'); title.className='var-title'; title.textContent='Pinned';
      const props=document.createElement('div'); props.className='var-properties'; props.id='th-pinned-list';
      sec.appendChild(title); sec.appendChild(props);
      const first = cont().querySelector('.var-type-object');
      if(first) cont().insertBefore(sec, first); else cont().appendChild(sec);
    }
    return sec.querySelector('#th-pinned-list');
  }
  function renderPinned(){
    const list=ensurePinnedSection(); if(!list) return;
    list.innerHTML='';
    const arr=getPins();
    if(!arr.length){
      const empty=document.createElement('div'); empty.style.cssText='color:#9aa3b2;font-style:italic;padding:6px;';
      empty.textContent='No pinned items yet.'; list.appendChild(empty); return;
    }
    arr.forEach(ref=>{
      const field=findFieldByRef(ref);
      if(field){
        const row=document.createElement('div'); row.className='var-field'; row.dataset.ref=ref;
        const k=document.createElement('span'); k.className='var-title'; k.textContent = ref.split('.').pop();
        const vwrap=document.createElement('div'); vwrap.className='var-value';
        const src=field.querySelector('.var-input');
        const inp=document.createElement('input'); inp.className='var-input'; inp.type=src?.type||'text'; inp.value=src?.value||'';
        if(src){
          inp.addEventListener('input',()=>{ if(src.value!==inp.value){ src.value=inp.value; src.dispatchEvent(new Event('input',{bubbles:true})); src.dispatchEvent(new Event('change',{bubbles:true})); }});
          const sync=()=>{ if(inp.value!==src.value) inp.value=src.value; };
          src.addEventListener('input', sync); src.addEventListener('change', sync); src.addEventListener('keyup', sync);
        }
        const unp=document.createElement('button'); unp.className='th-pin active'; unp.title='Unpin'; unp.textContent='📌'; unp.dataset.action='unpin'; unp.dataset.ref=ref; unp.dataset.action='unpin'; unp.dataset.ref=ref;
        unp.addEventListener('click',(e)=>{ e.stopPropagation(); togglePin(ref); });
        vwrap.appendChild(inp); vwrap.appendChild(unp);
        row.appendChild(k); row.appendChild(vwrap); list.appendChild(row);
        return;
      }
      const sec=findSectionByRef(ref);
      if(sec && sec.id!=='TH-PINNED'){
        const row=document.createElement('div'); row.className='var-field'; row.dataset.ref=ref;
        const k=document.createElement('span'); k.className='var-title'; k.textContent=ref.split('.').pop()+' (section)';
        const vwrap=document.createElement('div'); vwrap.className='var-value';
        const open=document.createElement('button'); open.textContent='Open'; open.className='th-pin'; open.title='Scroll to section'; open.dataset.action='open'; open.dataset.ref=ref;
        open.addEventListener('click',()=>{
          const c=cont();
          try{
            if(c){
              sec.classList.add('properties-open');
              const cr=c.getBoundingClientRect(); const er=sec.getBoundingClientRect();
              const top = c.scrollTop + (er.top - cr.top) - 40;
              c.scrollTo({top: Math.max(0, top), behavior:'smooth'});
            } else {
              sec.classList.add('properties-open'); sec.scrollIntoView({behavior:'smooth', block:'center'});
            }
          }catch(e){ sec.scrollIntoView({behavior:'smooth', block:'center'}); }
        });
        const unp=document.createElement('button'); unp.className='th-pin active'; unp.title='Unpin'; unp.textContent='📌'; unp.dataset.action='unpin'; unp.dataset.ref=ref; unp.dataset.action='unpin'; unp.dataset.ref=ref;
        unp.addEventListener('click',(e)=>{ e.stopPropagation(); togglePin(ref); });
        vwrap.appendChild(open); vwrap.appendChild(unp);
        row.appendChild(k); row.appendChild(vwrap); list.appendChild(row);
      } else {
        const row=document.createElement('div'); row.className='var-field'; row.dataset.ref=ref;
        const k=document.createElement('span'); k.className='var-title'; k.textContent=ref;
        const vwrap=document.createElement('div'); vwrap.className='var-value';
        const unp=document.createElement('button'); unp.className='th-pin active'; unp.title='Unpin'; unp.textContent='📌'; unp.dataset.action='unpin'; unp.dataset.ref=ref; unp.dataset.action='unpin'; unp.dataset.ref=ref;
        unp.addEventListener('click',(e)=>{ e.stopPropagation(); togglePin(ref); });
        vwrap.appendChild(unp);
        row.appendChild(k); row.appendChild(vwrap); list.appendChild(row);
      }
    });
  }
  function addPinButtons(){
    const el=cont(); if(!el) return;
    $$(el,'.var-field').forEach(field=>{
      if(field.dataset.thPinInit==='1') return;
      if(field.closest('#TH-PINNED')) { field.dataset.thPinInit='1'; return; }
      const title=field.querySelector('.var-title'); const input=field.querySelector('.var-input');
      if(!title || !input){ field.dataset.thPinInit='1'; return; }
      const ref=refForField(field);
      const btn=document.createElement('button'); btn.className='th-pin'+(isPinned(ref)?' active':''); btn.dataset.kind='field'; btn.dataset.ref=ref; btn.textContent='📌'; btn.title=isPinned(ref)?'Unpin':'Pin';
      btn.addEventListener('click',(e)=>{ e.stopPropagation(); togglePin(ref); });
      title.appendChild(btn);
      field.dataset.thPinInit='1';
    });
    $$(el,'.var-type-object').forEach(sec=>{
      const title=sec.querySelector(':scope > .var-title'); if(!title) return;
      const label=labelOfTitle(title);
      if(label==='Gamestate' || sec.id==='TH-PINNED') return;
      if(title.dataset.thSectionPinInit==='1') return;
      const ref=refForSection(sec);
      const btn=document.createElement('button'); btn.className='th-pin'+(isPinned(ref)?' active':''); btn.dataset.kind='section'; btn.dataset.ref=ref; btn.textContent='📌'; btn.title=isPinned(ref)?'Unpin':'Pin';
      btn.addEventListener('click',(e)=>{ e.stopPropagation(); togglePin(ref); });
      title.appendChild(btn);
      title.dataset.thSectionPinInit='1';
    });
  }
  function updatePinButtons(){
    const el=cont(); if(!el) return;
    $$(el,'.th-pin[data-ref]').forEach(b=>{
      const active=isPinned(b.dataset.ref);
      b.classList.toggle('active', active);
      b.title = active ? 'Unpin' : 'Pin';
    });
  }

  /* resize/drag */
  function restore(){
    const el=cont(); if(!el) return;
    try{
      const w=parseInt(localStorage.getItem(LS_W)||'',10);
      const h=parseInt(localStorage.getItem(LS_H)||'',10);
      const l=parseInt(localStorage.getItem(LS_L)||'',10);
      const t=parseInt(localStorage.getItem(LS_T)||'',10);
      if (w) el.style.width  = clamp(w, MIN_W, Math.min(window.innerWidth-2*MARGIN,  MAX_W)) + 'px';
      if (h) el.style.height = clamp(h, MIN_H, Math.min(window.innerHeight-2*MARGIN, MAX_H)) + 'px';
      if (!isNaN(l) && !isNaN(t)) { el.style.left=l+'px'; el.style.top=t+'px'; el.style.right='auto'; }
      onTop(el);
    }catch(e){} 
  }
  function centerIfNeeded(){
    const el=cont(); if(!el) return;
    const hasL=localStorage.getItem(LS_L), hasT=localStorage.getItem(LS_T);
    const r=el.getBoundingClientRect();
    const vw=window.innerWidth, vh=window.innerHeight;
    const outside = (r.left > vw - MARGIN) || (r.top > vh - MARGIN) || (r.right < MARGIN) || (r.bottom < MARGIN) || (hasL===null || hasT===null);
    if(!outside) return;
    const defW = Math.min(parseInt(el.style.width||'520',10) || 520, vw - 2*MARGIN);
    const defH = Math.min(parseInt(el.style.height||'560',10) || 560, vh - 2*MARGIN);
    el.style.width  = defW + 'px';
    el.style.height = defH + 'px';
    const rr=el.getBoundingClientRect();
    const left=Math.max(MARGIN, Math.round((vw-rr.width)/2));
    const top =Math.max(MARGIN, Math.round((vh-rr.height)/2));
    el.style.left=left+'px'; el.style.top=top+'px'; el.style.right='auto';
    try{
      localStorage.setItem(LS_L,String(left));
      localStorage.setItem(LS_T,String(top));
      localStorage.setItem(LS_W,String(Math.round(rr.width)));
      localStorage.setItem(LS_H,String(Math.round(rr.height)));
    }catch(e){}
    onTop(el);
  }
  function saveGeom(){
    const el=cont(); if(!el) return;
    try{
      const r=el.getBoundingClientRect();
      localStorage.setItem(LS_W,String(Math.round(r.width)));
      localStorage.setItem(LS_H,String(Math.round(r.height)));
      localStorage.setItem(LS_L,String(Math.round(r.left)));
      localStorage.setItem(LS_T,String(Math.round(r.top)));
    }catch(e){}
  }
  function hit(x,y){
    const el=cont(); if(!el) return '';
    const r=el.getBoundingClientRect();
    const L=x-r.left,T=y-r.top,R=r.right-x,B=r.bottom-y;
    const l=L<=EDGE,rgt=R<=EDGE,t=T<=EDGE,b=B<=EDGE;
    if(t&&l) return 'nw'; if(t&&rgt) return 'ne'; if(b&&l) return 'sw'; if(b&&rgt) return 'se';
    if(l) return 'w'; if(rgt) return 'e'; if(t) return 'n'; if(b) return 's'; return '';
  }
  function edgeAndDrag(){
    const el=cont(); if(!el) return;
    ensureHeader();
    restore(); centerIfNeeded();
    const header=el.querySelector('#th-header');
    let dragging=false,sx=0,sy=0,sl=0,st=0;
    if(header){
      header.addEventListener('mousedown',(e)=>{
        if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON'||e.target.tagName==='SELECT') return;
        dragging=true; sx=e.clientX; sy=e.clientY; const r=el.getBoundingClientRect(); sl=r.left; st=r.top;
        el.style.right='auto'; document.body.style.userSelect='none'; onTop(el);
      });
      window.addEventListener('mousemove',(e)=>{
        if(!dragging) return;
        let nx=sl+(e.clientX-sx), ny=st+(e.clientY-sy);
        const w=el.getBoundingClientRect().width, h=el.getBoundingClientRect().height;
        nx=clamp(nx, MARGIN, window.innerWidth - w - MARGIN);
        ny=clamp(ny, MARGIN, window.innerHeight - h - MARGIN);
        el.style.left=nx+'px'; el.style.top=ny+'px';
      });
      window.addEventListener('mouseup',()=>{ if(!dragging) return; dragging=false; document.body.style.userSelect=''; saveGeom(); });
    }
    let rs={on:false,mode:'',sx:0,sy:0,sl:0,st:0,sw:0,sh:0};
    el.addEventListener('mousemove',(e)=>{
      if(rs.on) return;
      const m=hit(e.clientX,e.clientY);
      el.classList.remove('th-resize-e','th-resize-w','th-resize-n','th-resize-s','th-resize-ne','th-resize-nw','th-resize-se','th-resize-sw');
      if(m) el.classList.add('th-resize-'+m);
    });
    el.addEventListener('mousedown',(e)=>{
      const m=hit(e.clientX,e.clientY); if(!m) return;
      rs.on=true; rs.mode=m; rs.sx=e.clientX; rs.sy=e.clientY;
      const r=el.getBoundingClientRect(); rs.sl=r.left; rs.st=r.top; rs.sw=r.width; rs.sh=r.height;
      document.body.style.userSelect='none'; e.preventDefault(); onTop(el);
    });
    window.addEventListener('mousemove',(e)=>{
      if(!rs.on) return;
      const dx=e.clientX-rs.sx, dy=e.clientY-rs.sy;
      let nx=rs.sl, ny=rs.st, nw=rs.sw, nh=rs.sh;
      if (rs.mode.includes('e')) nw = clamp(rs.sw + dx, MIN_W, Math.min(window.innerWidth - rs.sl - MARGIN, MAX_W));
      if (rs.mode.includes('s')) nh = clamp(rs.sh + dy, MIN_H, Math.min(window.innerHeight - rs.st - MARGIN, MAX_H));
      if (rs.mode.includes('w')) { nw = clamp(rs.sw - dx, MIN_W, Math.min(rs.sw + rs.sl - MARGIN, MAX_W)); nx = rs.sl + (rs.sw - nw); }
      if (rs.mode.includes('n')) { nh = clamp(rs.sh - dy, MIN_H, Math.min(rs.sh + rs.st - MARGIN, MAX_H)); ny = rs.st + (rs.sh - nh); }
      el.style.left=nx+'px'; el.style.top=ny+'px'; el.style.width=nw+'px'; el.style.height=nh+'px';
    });
    window.addEventListener('mouseup',()=>{
      if(!rs.on) return; rs.on=false; document.body.style.userSelect=''; saveGeom();
      el.classList.remove('th-resize-e','th-resize-w','th-resize-n','th-resize-s','th-resize-ne','th-resize-nw','th-resize-se','th-resize-sw');
    });
    window.addEventListener('resize',()=>{ centerIfNeeded(); saveGeom(); });
  }

  
  // Delegated click handler to make Open/unpin resilient across re-renders
  (function installDelegatedClicks(){
    const root = cont && cont();
    if (!root) return;
    if (root.dataset.delegatedClicks === '1') return;
    root.dataset.delegatedClicks = '1';
    root.addEventListener('click', function(ev){
      const btn = ev.target.closest('[data-action]');
      if (!btn || !root.contains(btn)) return;
      const action = btn.dataset.action;
      const ref = btn.dataset.ref;
      if (!action) return;
      ev.preventDefault(); ev.stopPropagation();
      if (action === 'unpin' && ref){
        try { togglePin(ref); } catch(e){ console.warn('togglePin failed', e); }
        return;
      }
      if (action === 'open' && ref){
        try {
          const sec = (function(){ return findSectionByRef(ref); })();
          if (sec){
            sec.classList.add('properties-open');
            const cr = root.getBoundingClientRect(), er = sec.getBoundingClientRect();
            const top = root.scrollTop + (er.top - cr.top) - 40;
            root.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
          }
        } catch(e){ console.warn('open failed', e); }
        return;
      }
    }, true);
  })();

  
  // Extra safety: delegated unpin inside Pinned list
  (function installPinnedDelegation(){
    const root = cont && cont();
    if (!root) return;
    const list = document.getElementById('th-pinned-list');
    if (!list || list.dataset.unpinDelegated === '1') return;
    list.dataset.unpinDelegated = '1';
    list.addEventListener('click', function(ev){
      const btn = ev.target.closest('.th-pin,[data-action="unpin"]');
      if (!btn) return;
      const ref = btn.dataset && btn.dataset.ref;
      if (!ref) return;
      ev.preventDefault(); ev.stopPropagation();
      try { togglePin(ref); } catch(e){ console.warn('togglePin failed', e); }
    }, true);
  })();

  
  /* robust unpin/open delegation */
  (function installRobustDelegation(){
    const root = cont && cont();
    if (!root) return;

    function handle(ev){
      const t = ev.target;
      if (!t) return;
      const btn = t.closest('[data-action], .th-pin');
      if (!btn || !root.contains(btn)) return;
      const action = btn.dataset.action || (btn.classList.contains('th-pin') ? (btn.title||'').toLowerCase().includes('unpin') ? 'unpin' : '' : '');
      if (!action) return;
      let ref = btn.dataset.ref;
      if (!ref){
        const row = btn.closest('.var-field');
        if (row && row.dataset && row.dataset.ref) ref = row.dataset.ref;
      }
      if (!ref) return;
      ev.preventDefault(); ev.stopPropagation();

      if (action === 'unpin'){
        try{ togglePin(ref); }catch(e){ console.warn('togglePin failed', e); }
        return;
      }
      if (action === 'open'){
        try{
          const sec = (function(){ return findSectionByRef(ref); })();
          if (sec){
            sec.classList.add('properties-open');
            const cr = root.getBoundingClientRect(), er = sec.getBoundingClientRect();
            const top = root.scrollTop + (er.top - cr.top) - 40;
            root.scrollTo({ top: Math.max(0, top), behavior:'smooth' });
          }
        }catch(e){ console.warn('open failed', e); }
        return;
      }
    }

    // Use pointerup (reliable across slight mouse move) + click as fallback
    ['pointerup','click'].forEach(type=>{
      root.addEventListener(type, handle, true);
    });

    const list = document.getElementById('th-pinned-list');
    if (list){
      ['pointerup','click'].forEach(type=>{
        list.addEventListener(type, handle, true);
      });
    }
  })();

  function observe(){
    const el=cont(); if(!el) return;
    let scheduled=false;
    const run = ()=>{
      scheduled=false;
      ensureHeader();
      if (el.querySelector('.var-type-object')) ensurePinnedSection();
      addPinButtons(); updatePinButtons(); renderPinned();
    };
    const mo=new MutationObserver(()=>{ if(!scheduled){ scheduled=true; requestAnimationFrame(run);} });
    mo.observe(el,{childList:true, subtree:true});
    ensureHeader(); if (el.querySelector('.var-type-object')) ensurePinnedSection();
    addPinButtons(); updatePinButtons(); renderPinned(); edgeAndDrag();
  }
  function boot(){ const tick=()=>{ const el=cont(); if(!el){ setTimeout(tick, 80); return; } observe(); }; tick(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

// Hotkey: Ctrl+Shift+R — reset panel geometry
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
    e.preventDefault();
    try {
      localStorage.removeItem('th-left');
      localStorage.removeItem('th-top');
      localStorage.removeItem('th-width');
      localStorage.removeItem('th-height');
      const evt = new Event('resize'); window.dispatchEvent(evt);
      console.log("TwineForge panel position reset.");
    } catch (err) { console.error("Failed to reset TwineForge position:", err); }
  }
});
