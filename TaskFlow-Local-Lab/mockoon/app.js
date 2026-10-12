'use strict';
const names=['crypto-assets','certificates','jwt-keys','services','vendors',
  'secrets','tasks','rotation-requests','notifications','ci-checks'];
const el=id=>document.getElementById(id);
let snapshot={}, loaded=null;
function message(text){el('message').textContent=text;}
async function api(path,options={}){
  const response=await fetch(path,{...options,cache:'no-store',headers:{
    ...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
  if(!response.ok)throw new Error((options.method||'GET')+' '+path+': HTTP '+response.status);
  return response.status===204?null:response.json();
}
function validCollections(data){
  for(const name of names){
    if(!Array.isArray(data[name]))throw new Error('Missing array: '+name);
    const ids=new Set();
    for(const row of data[name]){
      if(!row||typeof row!=='object'||Array.isArray(row)||
        !['string','number'].includes(typeof row.id))throw new Error('Invalid record in '+name);
      if(ids.has(String(row.id)))throw new Error('Duplicate ID in '+name);
      ids.add(String(row.id));
    }
  }
  return data;
}
function table(id,rows,fields){
  el(id).replaceChildren();
  for(const row of rows){
    const tr=document.createElement('tr');
    for(const field of fields){const td=document.createElement('td');
      td.textContent=row[field]??'-';tr.append(td);}
    el(id).append(tr);
  }
}
function inspect(){
  const rows=snapshot[el('collection').value]||[];
  el('records').textContent=JSON.stringify(rows,null,2);
  const previous=el('recordId').value;
  el('recordId').replaceChildren();
  for(const row of rows){const option=document.createElement('option');
    option.value=String(row.id);option.textContent=String(row.id);el('recordId').append(option);}
  if(rows.some(r=>String(r.id)===previous))el('recordId').value=previous;
}
async function refresh(){
  const next={};
  for(const name of names){next[name]=await api('/'+name);
    if(!Array.isArray(next[name]))throw new Error(name+' did not return an array');}
  snapshot=next;el('cards').replaceChildren();
  for(const [label,count] of [['Inventory assets',snapshot['crypto-assets'].length],
    ['Open tasks',snapshot.tasks.filter(t=>t.status!=='closed').length],
    ['Certificates',snapshot.certificates.length],
    ['Rotation requests',snapshot['rotation-requests'].length]]){
    const card=document.createElement('div');card.className='card';
    const number=document.createElement('strong');number.textContent=count;
    card.append(number,document.createTextNode(label));el('cards').append(card);
  }
  table('tasks',snapshot.tasks,['priority','title','owner','status']);
  table('services',snapshot.services,['service','scope','score','readinessStatus']);
  inspect();message('Fresh API records loaded. Refresh after each n8n run.');
}
function rebase(value,now){
  if(Array.isArray(value))return value.map(v=>rebase(v,now));
  if(value&&typeof value==='object')return Object.fromEntries(
    Object.entries(value).map(([k,v])=>[k,rebase(v,now)]));
  if(typeof value==='string'&&/^@days:-?\d+(\.\d+)?$/.test(value))
    return new Date(now+Number(value.slice(6))*86400000).toISOString();
  return value;
}
async function replaceAll(data){
  validCollections(data);
  for(const name of names)await api('/'+name,{method:'PUT',body:JSON.stringify(data[name])});
  loaded=null;el('editJson').value='';await refresh();
}
async function reset(){
  if(!confirm('Stop active workflows. This replaces all mock records and deletes lab progress. Continue?'))return;
  await replaceAll(rebase(await api('/seed-data'),Date.now()));
  message('Initialized: 8 assets, 5 certificates, and no tasks. Dates start from now.');
}
async function loadRecord(){
  const name=el('collection').value,id=el('recordId').value;
  if(!id)throw new Error('This collection is empty. Run its workflow or initialize first.');
  const row=await api('/'+name+'/'+encodeURIComponent(id));
  loaded={name,id};el('editJson').value=JSON.stringify(row,null,2);
  message('Loaded '+name+'/'+id+'. Edit then Save; loading did not change it.');
}
async function saveRecord(){
  if(!loaded)throw new Error('Load a record before saving.');
  if(el('collection').value!==loaded.name||el('recordId').value!==loaded.id)
    throw new Error('Selection changed. Load the intended record again.');
  const row=JSON.parse(el('editJson').value);
  if(!row||typeof row!=='object'||Array.isArray(row)||String(row.id)!==loaded.id)
    throw new Error('Keep the loaded record id unchanged.');
  const patch={...row};delete patch.id;
  const path='/'+loaded.name+'/'+encodeURIComponent(loaded.id);
  await api(path,{method:'PATCH',body:JSON.stringify(patch)});
  const saved=await api(path);
  for(const [key,value] of Object.entries(patch)){
    if(JSON.stringify(saved[key])!==JSON.stringify(value))
      throw new Error('Read-back mismatch for '+key+'. Inspect before retrying.');
  }
  el('editJson').value=JSON.stringify(saved,null,2);await refresh();
  message('Saved and verified by a fresh GET: '+path);
}
async function exportSnapshot(){
  await refresh();
  const data={format:'taskflow-local-snapshot-v1',exportedAt:new Date().toISOString(),collections:snapshot};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const link=document.createElement('a'),url=URL.createObjectURL(blob);
  link.href=url;link.download='taskflow-snapshot-'+Date.now()+'.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);message('Exported fresh mock data. This is not an n8n backup.');
}
async function restore(){
  const file=el('snapshotFile').files[0];if(!file)throw new Error('Choose a snapshot JSON file first.');
  const data=JSON.parse(await file.text());
  if(data.format!=='taskflow-local-snapshot-v1')throw new Error('Choose a snapshot from this kit.');
  validCollections(data.collections);
  if(!confirm('Stop workflows and export current data first. Replace all mock collections with this snapshot?'))return;
  await replaceAll(data.collections);message('Snapshot restored. Dates were preserved, not moved forward.');
}
async function loadEvent(){
  el('eventJson').value=JSON.stringify(await api('/events/'+el('eventType').value),null,2);
}
async function sendEvent(){
  const url=new URL(el('webhookUrl').value.trim());
  if(url.protocol!=='http:'||!['localhost','127.0.0.1'].includes(url.hostname)||
    url.port!=='5678'||!/^\/webhook(?:-test)?\/tf-(ci-crypto|security-alert)$/.test(url.pathname))
    throw new Error('Use this lab\'s local n8n webhook URL on port 5678.');
  const token=el('labToken').value;if(!token)throw new Error('Enter your practice X-Lab-Token.');
  const body=JSON.parse(el('eventJson').value);
  const response=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json',
    'X-Lab-Token':token},body:JSON.stringify(body)});
  el('eventResult').textContent='HTTP '+response.status+'\n'+await response.text();
  if(!response.ok)throw new Error('Webhook failed. Read its result and inspect n8n.');
  await refresh();
}
function bind(id,handler){el(id).onclick=async()=>{
  const button=el(id);button.disabled=true;
  try{await handler();}catch(error){message(error.message);
    if(id==='sendEvent')el('eventResult').textContent=error.message+'\nCheck the n8n execution before retrying.';}
  finally{button.disabled=false;}
};}
for(const name of names){const option=document.createElement('option');
  option.value=name;option.textContent=name;el('collection').append(option);}
el('collection').onchange=()=>{loaded=null;el('editJson').value='';inspect();};
el('eventType').onchange=()=>loadEvent().catch(e=>message(e.message));
for(const button of document.querySelectorAll('[data-days]'))button.onclick=()=>{
  try{if(!loaded||loaded.name!=='certificates')throw new Error('Load a certificate first.');
    const row=JSON.parse(el('editJson').value);
    row.expiresAt=new Date(Date.now()+Number(button.dataset.days)*86400000).toISOString();
    el('editJson').value=JSON.stringify(row,null,2);message('Editor changed. Click Save edited record.');
  }catch(e){message(e.message);}
};
bind('refresh',refresh);bind('reset',reset);bind('load',loadRecord);bind('save',saveRecord);
bind('export',exportSnapshot);bind('restore',restore);bind('sendEvent',sendEvent);
Promise.all([refresh(),loadEvent()]).catch(e=>message('Open through http://localhost:3000. '+e.message));
