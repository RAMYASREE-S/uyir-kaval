const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DEMO=[13.0827,80.2707];
let db=null;try{db=JSON.parse(localStorage.getItem('uk'))}catch(e){}
if(!db||!db.vols)db={vols:[
{id:1,name:'Arun Kumar',phone:'9840000001',skill:'First aid',lat:13.0900,lng:80.2800,ok:true},
{id:2,name:'Meena S',phone:'9840000002',skill:'Blood donor',lat:13.0650,lng:80.2500,ok:true},
{id:3,name:'Karthik R',phone:'9840000003',skill:'Transport',lat:13.1100,lng:80.3100,ok:true},
{id:4,name:'Divya L',phone:'9840000004',skill:'Food and supplies',lat:13.0300,lng:80.2200,ok:true}],reqs:[]};
const save=()=>{try{localStorage.setItem('uk',JSON.stringify(db))}catch(e){}};
const hav=(a,b,c,d)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 12742*Math.asin(Math.sqrt(h))};
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),3500)};
const locate=cb=>{if(!navigator.geolocation)return toast('This browser has no GPS. Use the demo location.');
navigator.geolocation.getCurrentPosition(p=>cb(p.coords.latitude,p.coords.longitude),()=>toast('Location is blocked. Allow location access or use the demo location.'),{enableHighAccuracy:true,timeout:10000})};

/* tabs */
$$('nav button').forEach(b=>b.onclick=()=>{$$('nav button').forEach(x=>x.setAttribute('aria-selected',x===b));$$('section').forEach(s=>s.classList.toggle('on',s.id===b.dataset.tab));if(b.dataset.tab==='admin')renderAdmin()});

/* user interface */
let me=null,watchId=null;
function setMe(lat,lng){me={lat,lng};$('#ucoord').textContent='Your location: '+lat.toFixed(4)+', '+lng.toFixed(4);renderNear()}
$('#locMe').onclick=()=>locate(setMe);
$('#demoMe').onclick=()=>setMe(...DEMO);
$('#track').onclick=e=>{
  if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null;e.target.textContent='Track live: off';return}
  if(!navigator.geolocation)return toast('This browser has no GPS.');
  watchId=navigator.geolocation.watchPosition(p=>setMe(p.coords.latitude,p.coords.longitude),()=>toast('Could not track your location.'),{enableHighAccuracy:true});
  e.target.textContent='Track live: on'};
function renderNear(){
  const box=$('#near'),plot=$('#plot');
  if(!me){plot.innerHTML='';box.innerHTML='<li class="empty">Share your location to see verified volunteers near you.</li>';return}
  const list=db.vols.filter(v=>v.ok).map(v=>({...v,d:hav(me.lat,me.lng,v.lat,v.lng)})).sort((a,b)=>a.d-b.d);
  if(!list.length){plot.innerHTML='';box.innerHTML='<li class="empty">No verified volunteers yet. Ask an admin to verify one.</li>';return}
  const mx=Math.max(1,...list.map(v=>v.d)),S=150,sc=(S-16)/mx,k=Math.cos(me.lat*Math.PI/180);
  const dots=list.map((v,i)=>`<circle class="${i?'dv':'dn'}" r="${i?5:8}" cx="${S+(v.lng-me.lng)*k*111*sc}" cy="${S-(v.lat-me.lat)*111*sc}"><title>${esc(v.name)}</title></circle>`).join('');
  plot.innerHTML=`<svg viewBox="0 0 300 300" role="img" aria-label="Volunteers around you"><circle class="ring" cx="150" cy="150" r="${(S-16)/3}"/><circle class="ring" cx="150" cy="150" r="${(S-16)*2/3}"/><circle class="ring" cx="150" cy="150" r="${S-16}"/>${dots}<circle class="me" cx="150" cy="150" r="6"/><text x="150" y="296" text-anchor="middle" font-size="11" fill="currentColor">Outer ring: ${mx.toFixed(1)} km. Red dot is you.</text></svg>`;
  box.innerHTML=list.map((v,i)=>`<li class="v"><div><b>${esc(v.name)}</b>${i?'':' <span class="tag ok">Nearest</span>'}<small>${esc(v.skill)}</small></div><div class="km">${v.d.toFixed(1)} km</div><div></div><button class="btn sos" data-req="${v.id}">Request help</button></li>`).join('')}
$('#near').onclick=e=>{
  const id=e.target.dataset.req;if(!id)return;
  const n=$('#un').value.trim(),p=$('#up').value.trim();
  if(!n||!p)return toast('Enter your name and phone number first.');
  const v=db.vols.find(x=>x.id==id);
  db.reqs.unshift({id:Date.now(),name:n,phone:p,need:$('#un2').value,desc:$('#ud').value.trim(),lat:me.lat,lng:me.lng,vid:v.id,status:'Open',t:new Date().toLocaleString()});
  save();toast('Request sent to '+v.name+'. They will call '+p+'.')};

/* volunteer interface */
$('#vloc').onclick=()=>locate((a,b)=>{$('#vlat').value=a.toFixed(5);$('#vlng').value=b.toFixed(5)});
$('#vdemo').onclick=()=>{$('#vlat').value=(DEMO[0]+(Math.random()-.5)*.08).toFixed(5);$('#vlng').value=(DEMO[1]+(Math.random()-.5)*.08).toFixed(5)};
$('#vf').onsubmit=e=>{e.preventDefault();
  const lat=parseFloat($('#vlat').value),lng=parseFloat($('#vlng').value);
  if(isNaN(lat)||isNaN(lng))return toast('Add your location with GPS or the demo button.');
  db.vols.push({id:Date.now(),name:$('#vn').value.trim(),phone:$('#vp').value.trim(),skill:$('#vs').value,lat,lng,ok:false});
  save();e.target.reset();toast('Enrolled. An admin will verify your details.')};

/* admin interface */
let adminOn=false;
function renderAdmin(){
  const A=$('#adminBody');
  if(!adminOn){A.innerHTML='<form class="card" id="gate" style="max-width:340px"><h2>Admin sign in</h2><label for="pin">PIN (demo PIN is 1234)</label><input id="pin" type="password" inputmode="numeric"><div class="row"><button class="btn">Sign in</button></div></form>';
    $('#gate').onsubmit=e=>{e.preventDefault();if($('#pin').value==='1234'){adminOn=true;renderAdmin()}else toast('Wrong PIN. Try again.')};return}
  const open=db.reqs.filter(r=>r.status==='Open').length;
  A.innerHTML=`<div class="stats card sm"><div><b>${db.vols.length}</b>Volunteers</div><div><b>${db.vols.filter(v=>v.ok).length}</b>Verified</div><div><b>${db.reqs.length}</b>Requests</div><div><b>${open}</b>Open</div></div>
  <div class="grid" style="grid-template-columns:1fr"><div class="card"><h2>Volunteers</h2><ul>${db.vols.map(v=>`<li class="v"><div><b>${esc(v.name)}</b> <span class="tag ${v.ok?'ok':''}">${v.ok?'Verified':'Pending'}</span><small>${esc(v.skill)} - ${esc(v.phone)}</small></div><div class="row" style="margin:0">${v.ok?'':`<button class="btn vol" data-a="ver" data-id="${v.id}">Verify</button>`}<button class="btn ghost" data-a="del" data-id="${v.id}">Remove</button></div></li>`).join('')}</ul></div>
  <div class="card"><h2>Help requests</h2><ul>${db.reqs.length?db.reqs.map(r=>{const v=db.vols.find(x=>x.id===r.vid);return `<li class="v"><div><b>${esc(r.need)}</b> <span class="tag ${r.status==='Open'?'open':'ok'}">${r.status}</span><small>${esc(r.name)} (${esc(r.phone)}) - assigned to ${v?esc(v.name):'removed volunteer'}<br>${esc(r.desc||'No details')}<br>${r.t}</small></div><div>${r.status==='Open'?`<button class="btn vol" data-a="res" data-id="${r.id}">Mark resolved</button>`:''}</div></li>`}).join(''):'<li class="empty">No requests yet.</li>'}</ul></div></div>`}
$('#adminBody').onclick=e=>{const a=e.target.dataset.a,id=e.target.dataset.id;if(!a)return;
  if(a==='ver')db.vols.find(v=>v.id==id).ok=true;
  if(a==='del')db.vols=db.vols.filter(v=>v.id!=id);
  if(a==='res')db.reqs.find(r=>r.id==id).status='Resolved';
  save();renderAdmin();renderNear()};
renderNear();
