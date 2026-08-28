const dailyEl = document.getElementById('daily');
const weeklyEl = document.getElementById('weekly');
const trendingGrid = document.getElementById('trendingGrid');
const latestGrid = document.getElementById('latestGrid');
const weeklyGrid = document.getElementById('weeklyGrid');
const tabs = document.querySelectorAll('.tab');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const todayChip = document.getElementById('todayChip');
const modal = document.getElementById('updateModal');
const updateForm = document.getElementById('updateForm');
const sourcesForm = document.getElementById('sourcesForm');
const STORAGE_KEY = 'newsly-kpop-local-updates-v1';
let DATA = { daily: [], weekly: [] };

function esc(v) { return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function groupOf(item) { return item.group || item.artist || 'K-POP'; }

function card(item, i) {
  const sources = item.sources || [];
  return `<article class="card" style="animation-delay:${Math.min(i*70,420)}ms">
    <div class="card-image-wrap"><img class="card-image" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" onerror="this.alt='Image unavailable';this.style.opacity='.25'"><span class="group-pill">🎤 ${esc(groupOf(item))}</span></div>
    <div class="card-body"><div class="card-meta">✦ ${esc(item.badge || 'K-Pop Update')} <span>•</span> ${esc(item.time || sources[0]?.time || 'Today')}</div>
    <h3 class="card-title">${esc(item.title)}</h3><p class="card-desc">${esc(item.description || '')}</p>
    <div class="sources">${sources.length ? sources.map(s=>`<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(s.title || 'Read source')} <span class="source-site">· ${esc(s.site || 'Source')}</span></span><span class="source-arrow">↗</span></a>`).join('') : '<div class="empty">No source links added yet.</div>'}</div></div></article>`;
}
function grid(el, items) { el.innerHTML = items.length ? items.map(card).join('') : '<div class="empty">No updates here yet — click <b>＋ Add Update</b> to make one ♡</div>'; }
function render() {
  const daily = DATA.daily || [], weekly = DATA.weekly || [];
  grid(trendingGrid, daily.slice(0,3)); grid(latestGrid, daily.slice(3)); grid(weeklyGrid, weekly);
  document.getElementById('localNotice').classList.toggle('hidden', !localStorage.getItem(STORAGE_KEY));
}
function addSource(values={}) {
  const row=document.createElement('div'); row.className='source-row';
  row.innerHTML=`<button type="button" class="remove-source">×</button><div class="source-row-grid"><label><span>Website</span><input class="source-site-input" placeholder="Soompi" value="${esc(values.site||'')}" required></label><label><span>Article title</span><input class="source-title-input" placeholder="Article headline..." value="${esc(values.title||'')}" required></label></div><label><span>Article URL</span><input class="source-url-input" type="url" placeholder="https://..." value="${esc(values.url||'')}" required></label><label><span>Time</span><input class="source-time-input" placeholder="Today" value="${esc(values.time||'Today')}"></label>`;
  row.querySelector('.remove-source').onclick=()=>{if(sourcesForm.children.length>1)row.remove()}; sourcesForm.appendChild(row);
}
function openForm(){ modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; updateForm.reset(); sourcesForm.innerHTML=''; addSource(); document.getElementById('group').focus(); }
function closeForm(){ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
function saveUpdate(e){
  e.preventDefault();
  const sources=[...sourcesForm.querySelectorAll('.source-row')].map(r=>({site:r.querySelector('.source-site-input').value.trim(),title:r.querySelector('.source-title-input').value.trim(),url:r.querySelector('.source-url-input').value.trim(),time:r.querySelector('.source-time-input').value.trim()||'Today'}));
  const group=document.getElementById('group').value.trim();
  const item={id:(group.toLowerCase().replace(/[^a-z0-9]+/g,'-')||'kpop')+'-'+Date.now(),group,badge:document.getElementById('badge').value.trim(),title:document.getElementById('title').value.trim(),description:document.getElementById('description').value.trim(),image:document.getElementById('image').value.trim(),time:new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'}),sources};
  DATA.daily=[item,...(DATA.daily||[])]; localStorage.setItem(STORAGE_KEY,JSON.stringify(DATA)); render(); closeForm(); window.scrollTo({top:document.getElementById('trending').offsetTop-80,behavior:'smooth'});
}
function exportData(){ const blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a'); a.href=url;a.download='data.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url); }
function loadSaved(){ const s=localStorage.getItem(STORAGE_KEY); if(!s)return false; try{DATA=JSON.parse(s);render();return true}catch{localStorage.removeItem(STORAGE_KEY);return false;} }
async function loadData(){ try{const r=await fetch('./data.json');if(!r.ok)throw Error('data.json failed');DATA=await r.json();if(!loadSaved())render();}catch(e){if(!loadSaved()){trendingGrid.innerHTML='<div class="empty">Could not load data.json.</div>';latestGrid.innerHTML='';weeklyGrid.innerHTML='';}} }

tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');const m=t.dataset.mode;dailyEl.classList.toggle('hidden',m!=='daily');weeklyEl.classList.toggle('hidden',m!=='weekly');}));
themeToggle.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('newsly-theme',document.body.classList.contains('dark')?'dark':'light');themeIcon.textContent=document.body.classList.contains('dark')?'☀':'☾';});
if(localStorage.getItem('newsly-theme')==='dark'){document.body.classList.add('dark');themeIcon.textContent='☀';}
document.getElementById('todayChip').textContent='✦ '+new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'}).toUpperCase();
document.getElementById('openForm').onclick=openForm; document.getElementById('closeForm').onclick=closeForm; document.getElementById('cancelForm').onclick=closeForm; document.getElementById('modalBackdrop').onclick=closeForm; document.getElementById('addSource').onclick=()=>addSource(); updateForm.addEventListener('submit',saveUpdate); document.getElementById('exportData').onclick=exportData;
document.getElementById('clearLocal').onclick=()=>{if(confirm('Clear updates saved in this browser? Your GitHub data.json will not be changed.')){localStorage.removeItem(STORAGE_KEY);location.reload();}};
loadData();
