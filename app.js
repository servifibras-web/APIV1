/* app.js — logica del tablero (login, storage, reparto, tildado, render, modal).
   Separado del HTML monolitico original. Usa funciones de plantillas.js (clasificar, htmlTiendaNube, etc.). */

/* ========= CONFIG ========= */
const OPERATORS = ["Brenda","Franco","Matías"]; // operadores
const BOSS = "Encargado";
const LOTE_ID = "moldes_jun2026"; // si cargás otro lote, cambiá esto
let P = []; // se completa al cargar productos.json (ver init al final)

/* ========= STORAGE ========= */
// claves: assign:LOTE -> {opName:[ids]} ; done:LOTE -> {id:{by,ts}}
const K_ASSIGN = "assign:"+LOTE_ID;
const K_DONE   = "done:"+LOTE_ID;

async function sGet(key){ try{const r=await window.storage.get(key,true);return r?JSON.parse(r.value):null;}catch(e){return null;} }
async function sSet(key,val){ try{await window.storage.set(key,JSON.stringify(val),true);}catch(e){console.error(e);} }

/* sesión local segura (no rompe si sessionStorage no está disponible) */
const SS={
  get(k){ try{return sessionStorage.getItem(k);}catch(e){return _mem[k]||null;} },
  set(k,v){ try{sessionStorage.setItem(k,v);}catch(e){_mem[k]=v;} },
  del(k){ try{sessionStorage.removeItem(k);}catch(e){delete _mem[k];} }
};
const _mem={};

let ASSIGN=null, DONE=null, ME=null;



/* reparto automático parejo, SEA y AIR mezclados de forma equilibrada */
function autoAssign(){
  const a={}; OPERATORS.forEach(o=>a[o]=[]);
  // intercalar para que cada uno reciba mezcla de sea/air
  P.forEach((p,idx)=>{ a[OPERATORS[idx%OPERATORS.length]].push(p.id); });
  return a;
}

async function ensureData(){
  ASSIGN = await sGet(K_ASSIGN);
  DONE   = await sGet(K_DONE) || {};
  if(!ASSIGN){ ASSIGN = autoAssign(); await sSet(K_ASSIGN,ASSIGN); }
}

/* ========= LOGIN ========= */
function buildGate(){
  const wl=document.getElementById('whoList');
  OPERATORS.forEach(o=>{
    const b=document.createElement('button'); b.textContent=o; b.dataset.who=o;
    b.onclick=()=>selWho(b,o); wl.appendChild(b);
  });
  const bb=document.createElement('button'); bb.textContent="Encargado (vista de control)";
  bb.className="boss"; bb.dataset.who=BOSS; bb.onclick=()=>selWho(bb,BOSS); wl.appendChild(bb);
}
let picked=null;
function selWho(btn,who){
  document.querySelectorAll('.who button').forEach(x=>x.classList.remove('sel'));
  btn.classList.add('sel'); picked=who;
  document.getElementById('enterBtn').disabled=false;
}
document.getElementById('enterBtn').onclick=async()=>{
  ME=picked; SS.set('sf_me',ME);
  await ensureData(); enterApp();
};
document.getElementById('switchBtn').onclick=()=>{
  SS.del('sf_me');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('gate').classList.remove('hidden');
  document.querySelectorAll('.who button').forEach(x=>x.classList.remove('sel'));
  document.getElementById('enterBtn').disabled=true; picked=null;
};

/* ========= RENDER ========= */
let FILTER="todos";
function isBoss(){ return ME===BOSS; }
function myIds(){ return isBoss()? P.map(p=>p.id) : (ASSIGN[ME]||[]); }
function ownerOf(id){ for(const o of OPERATORS){ if((ASSIGN[o]||[]).includes(id)) return o; } return null; }

function enterApp(){
  document.getElementById('gate').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('roleLabel').textContent = isBoss()? "Vista de control · todas las tandas" : "Mi tanda · "+(ASSIGN[ME]||[]).length+" publicaciones";
  buildAssignPanel();
  renderStrip(); renderGrid();
}

function renderStrip(){
  const strip=document.getElementById('strip'); strip.innerHTML="";
  OPERATORS.forEach(o=>{
    const ids=ASSIGN[o]||[]; const total=ids.length;
    const done=ids.filter(id=>DONE[id]).length;
    const pct= total? Math.round(done/total*100):0;
    const card=document.createElement('div');
    card.className="pcard"+(o===ME?" me":"")+(total&&done===total?" full":"");
    card.innerHTML=`<div class="nm">${o}${o===ME?'<i>VOS</i>':''}</div>
      <div class="frac"><b>${done}</b>/${total}</div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="pct">${pct}%${total&&done===total?' ✓ completo':''}</div>`;
    strip.appendChild(card);
  });
}

function renderGrid(){
  const grid=document.getElementById('grid'); grid.innerHTML="";
  let ids=myIds();
  if(FILTER==="pend") ids=ids.filter(id=>!DONE[id]);
  if(FILTER==="done") ids=ids.filter(id=>DONE[id]);
  const total=myIds().length, done=myIds().filter(id=>DONE[id]).length;
  document.getElementById('count').innerHTML = `<b>${done}</b> hechas · <b>${total-done}</b> pendientes`;
  document.getElementById('empty').classList.toggle('hidden', ids.length>0);

  ids.forEach(id=>{
    const p=P[id]; const isDone=!!DONE[id]; const owner=ownerOf(id);
    const card=document.createElement('div');
    card.className="card"+(isDone?" done":"");
    const air=p.ship==='AIR';
    const imgHtml = p.img? `<img loading="lazy" src="${p.img}" alt="${p.code}">` : `<div class="noimg nofoto">⚠ FALTA FOTO<br><small>cargar a mano</small></div>`;
    const desc = p.desc? p.desc : '—';
    const size = p.size? `<div class="size">${p.size}</div>` : '';
    const ownerTag = isBoss()? `<div class="owner">Asignado a: ${owner||'—'}${isDone&&DONE[id].by?' · hecho por '+DONE[id].by:''}</div>`:'';
    const canToggle = isBoss() || owner===ME;
    card.innerHTML=`
      <div class="thumb" data-open="${id}">
        <span class="ship ${air?'air':''}">${air?'AÉREO':'BARCO'}</span>
        <span class="check"><svg viewBox="0 0 24 24" fill="none" stroke="#101820" stroke-width="3.2"><path d="M5 13l4 4L19 7"/></svg></span>
        ${imgHtml}
        <span class="zoom">Ver ficha ›</span>
      </div>
      <div class="meta" data-open="${id}">
        <div class="code">${p.code}</div>
        <div class="desc">${clasificar(p).es}</div>
        ${size}
      </div>
      ${ownerTag}
      ${canToggle? `<button class="toggle" data-id="${id}">${isDone?'✓ Publicada':'Marcar publicada'}</button>` : `<div class="owner" style="padding-bottom:11px">Tanda de ${owner}</div>`}`;
    grid.appendChild(card);
  });
  grid.querySelectorAll('.toggle').forEach(b=>{
    b.onclick=(e)=>{ e.stopPropagation(); toggle(parseInt(b.dataset.id)); };
  });
  grid.querySelectorAll('[data-open]').forEach(el=>{
    el.onclick=()=>openDetail(parseInt(el.dataset.open));
  });
}

async function toggle(id){
  if(DONE[id]){ delete DONE[id]; }
  else { DONE[id]={by:ME, ts:Date.now()}; }
  await sSet(K_DONE,DONE);
  renderStrip(); renderGrid();
}

document.getElementById('segFilter').querySelectorAll('button').forEach(b=>{
  b.onclick=()=>{ document.querySelectorAll('#segFilter button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); FILTER=b.dataset.f; renderGrid(); };
});

/* ========= BOSS: REASIGNAR ========= */
function buildAssignPanel(){
  const el=document.getElementById('assign');
  if(!isBoss()){ el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const counts=OPERATORS.map(o=>`${o}: ${(ASSIGN[o]||[]).length}`).join('  ·  ');
  el.innerHTML=`<h3>Reparto del lote · ${P.length} publicaciones</h3>
    <p>Repartidas en partes iguales automáticamente. Podés reasignar por cantidad si querés cargar más a alguien.</p>
    <div id="arows"></div>
    <div class="assign-actions">
      <button class="btn-pri" id="rebalance">Reparto parejo</button>
      <button class="btn-ghost" id="resetDone">Borrar todo el avance</button>
    </div>
    <div class="note">Conteo actual — ${counts}<br>El reparto reordena por cantidad respetando el orden de la lista. El avance ya marcado no se pierde al reasignar.</div>`;
  document.getElementById('rebalance').onclick=async()=>{
    ASSIGN=autoAssign(); await sSet(K_ASSIGN,ASSIGN); buildAssignPanel(); renderStrip(); renderGrid();
  };
  document.getElementById('resetDone').onclick=async()=>{
    if(confirm('¿Borrar TODO el avance de este lote? No se puede deshacer.')){ DONE={}; await sSet(K_DONE,DONE); renderStrip(); renderGrid(); }
  };
}

/* ========= MODAL DETALLE ========= */
function openDetail(id){
  const p=P[id]; const c=clasificar(p); const owner=ownerOf(id); const isDone=!!DONE[id];
  const html=htmlTiendaNube(p); const txt=txtMercadoLibre(p);
  const back=document.createElement('div'); back.className='modal-back';
  const air=p.ship==='AIR';
  const fotoBox = p.img
    ? `<img src="${p.img}" alt="${p.code}" style="width:100%;border-radius:10px;display:block">`
    : `<div class="modal-nofoto">⚠ FALTA FOTO<br><small>Buscala con los botones de abajo y cargala a mano</small></div>`;
  back.innerHTML=`
  <div class="modal">
    <div class="modal-head">
      <div>
        <div class="modal-code">${p.code} <span class="ship ${air?'air':''}" style="position:static;font-size:10px">${air?'AÉREO':'BARCO'}</span></div>
        <div class="modal-name">${c.es}${p.size?(' · '+p.size):''}</div>
      </div>
      <button class="modal-x" id="mx">✕</button>
    </div>
    <div class="modal-body">
      <div class="modal-left">
        ${fotoBox}
        <div class="modal-search">
          <span>Buscar foto del producto:</span>
          <a href="${linkAlibaba(p)}" target="_blank" rel="noopener" class="srch ali">Alibaba ↗</a>
          <a href="${linkGoogleImg(p)}" target="_blank" rel="noopener" class="srch goo">Google Imágenes ↗</a>
        </div>
      </div>
      <div class="modal-right">
        <div class="tabs">
          <button class="tab on" data-tab="prev">Vista previa</button>
          <button class="tab" data-tab="html">HTML TiendaNube</button>
          <button class="tab" data-tab="txt">Texto MercadoLibre</button>
        </div>
        <div class="tabpane" id="pane-prev">${html}</div>
        <div class="tabpane hidden" id="pane-html">
          <button class="copybtn" data-copy="html">Copiar HTML</button>
          <textarea readonly id="ta-html">${escapeHtml(html)}</textarea>
        </div>
        <div class="tabpane hidden" id="pane-txt">
          <button class="copybtn" data-copy="txt">Copiar texto ML</button>
          <textarea readonly id="ta-txt">${escapeHtml(txt)}</textarea>
        </div>
      </div>
    </div>
  </div>`;
  document.body.appendChild(back);
  back.querySelector('#mx').onclick=()=>back.remove();
  back.onclick=(e)=>{ if(e.target===back) back.remove(); };
  back.querySelectorAll('.tab').forEach(t=>{
    t.onclick=()=>{
      back.querySelectorAll('.tab').forEach(x=>x.classList.remove('on')); t.classList.add('on');
      ['prev','html','txt'].forEach(n=>back.querySelector('#pane-'+n).classList.toggle('hidden', n!==t.dataset.tab));
    };
  });
  back.querySelectorAll('.copybtn').forEach(b=>{
    b.onclick=()=>{
      const txtEl=back.querySelector(b.dataset.copy==='html'?'#ta-html':'#ta-txt');
      navigator.clipboard.writeText(b.dataset.copy==='html'?html:txt).then(()=>{
        const old=b.textContent; b.textContent='✓ Copiado'; b.classList.add('ok');
        setTimeout(()=>{b.textContent=old;b.classList.remove('ok');},1400);
      }).catch(()=>{ txtEl.select(); document.execCommand('copy'); });
    };
  });
}
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }


/* ========= INIT ========= */
// Antes window.PRODUCTS venia inline en el HTML. Ahora se carga desde productos.json.
(async () => {
  try {
    const r = await fetch('productos.json');
    window.PRODUCTS = await r.json();
  } catch (e) {
    console.error('No pude cargar productos.json', e);
    window.PRODUCTS = [];
  }
  P = window.PRODUCTS.map((p, i) => ({ ...p, id: i }));
  buildGate();
  const saved = SS.get('sf_me');
  if (saved) { ME = saved; await ensureData(); enterApp(); }
})();
