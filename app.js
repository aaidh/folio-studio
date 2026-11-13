import {sample, blank, normalize, renderPortfolio, escapeHTML as e, safeURL, accents} from './core.js';

const $ = selector => document.querySelector(selector);
const storageKey = 'folio-studio-v1';
let draft = structuredClone(sample), step = 'profile', toastTimer, renderTimer;
let storageOK = true;
try {const saved = localStorage.getItem(storageKey);if(saved) draft = normalize(JSON.parse(saved));} catch {storageOK=false;}
const steps = ['profile','projects','experience','contact','design'];
const names = {profile:'About you',projects:'Projects',experience:'Experience',contact:'Connect',design:'Design'};
const intros = {
  profile:['A good introduction goes a long way.','Tell people who you are and what you love doing.'],
  projects:['Let your work do the talking.','Add the projects you’re proud of. Start with your best.'],
  experience:['Every journey is worth sharing.','Add work, education, volunteering, or your next chapter.'],
  contact:['Make the next connection.','Only share the contact details you want to make public.'],
  design:['Find your own expression.','Choose a starting point. Your content stays with you.']
};
function toast(message) {$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function save() {
  try {localStorage.setItem(storageKey,JSON.stringify(draft));storageOK=true;$('#save-status').textContent='Saved on this device';}
  catch {storageOK=false;$('#save-status').textContent='Download a draft to keep your work';}
}
function preview() {const html=renderPortfolio(draft);$('#preview').srcdoc=html;if($('#preview-dialog').open) $('#preview-dialog iframe').srcdoc=html;}
function update() {save();clearTimeout(renderTimer);renderTimer=setTimeout(preview,160);}
function field(label,key,{type='text',help='',placeholder='',optional=false,value=draft[key],attr=''}={}) {
  const id = `input-${key.replaceAll('.','-')}`;
  return `<div class="field"><label for="${id}">${e(label)}${optional?'<span class="optional">Optional</span>':''}</label>${type==='textarea'?`<textarea id="${id}" data-key="${key}" maxlength="5000" ${attr}>${e(value)}</textarea>`:`<input id="${id}" data-key="${key}" type="${type}" value="${e(value)}" placeholder="${e(placeholder)}" maxlength="1000" ${attr}>`}${help?`<small>${e(help)}</small>`:''}</div>`;
}
function renderFields() {
  const intro = intros[step];
  let html=`<div class="section-intro"><h3>${intro[0]}</h3><p>${intro[1]}</p></div>`;
  if(step==='profile') html+=`<div class="photo-row">${draft.photo?`<img class="avatar-placeholder" src="${draft.photo}" alt="Your profile photo">`:`<div class="avatar-placeholder" aria-hidden="true">${e((draft.name||'You').split(' ').map(s=>s[0]).slice(0,2).join(''))}</div>`}<div><label class="button file-label">Upload photo<input id="photo" type="file" accept="image/png,image/jpeg,image/webp"></label><small>JPG, PNG or WebP · up to 5 MB</small>${draft.photo?'<button class="text-button" type="button" id="remove-photo">Remove photo</button>':''}</div></div>${field('Full name','name',{placeholder:'Your name',attr:'autocomplete="name"'})}${field('What do you do?','role',{placeholder:'e.g. Frontend developer & designer'})}${field('Your headline','headline',{type:'textarea',help:'A short statement that captures your approach. Line breaks are welcome.'})}${field('A little about you','bio',{type:'textarea',placeholder:'What do you care about? What do you bring to your work?'})}${field('Location','location',{optional:true,placeholder:'e.g. Based in Colombo · Working globally'})}${field('Skills','skills',{help:'Separate your skills with commas.',placeholder:'JavaScript, React, UI design'})}`;
  if(step==='projects'||step==='experience') {
    const projects=step==='projects';
    html+=draft[step].map((item,i)=>`<section class="repeat-card"><div class="repeat-heading"><span>${projects?'PROJECT':'EXPERIENCE'} ${String(i+1).padStart(2,'0')}</span><div><button type="button" class="text-button" data-move="${i}" aria-label="Move ${projects?'project':'experience'} ${i+1} up" ${i===0?'disabled':''}>↑ Move up</button> &nbsp; <button type="button" class="text-button" data-remove="${i}" aria-label="Remove ${projects?'project':'experience'} ${i+1}">Remove</button></div></div>${field(projects?'Project name':'Role or qualification',`${step}.${i}.title`,{value:item.title})}${projects?`${field('Category / year',`${step}.${i}.category`,{value:item.category,placeholder:'Web development · 2026',optional:true})}`:`${field('Organisation',`${step}.${i}.company`,{value:item.company})}${field('Time period',`${step}.${i}.period`,{value:item.period,placeholder:'2024 — Present'})}`}${field('Description',`${step}.${i}.description`,{type:'textarea',value:item.description})}${projects?field('Project link',`${step}.${i}.url`,{type:'url',value:item.url,placeholder:'https://your-project.com',optional:true}):''}</section>`).join('');
    html+=`<button type="button" class="button add-button" id="add-item" ${draft[step].length>=20?'disabled':''}>+ Add ${projects?'a project':'experience or education'}</button>`;
    if(!draft[step].length) html+='<p class="notice">This section stays hidden in your portfolio until you add an entry.</p>';
  }
  if(step==='contact') html+=`${field('Email address','email',{type:'email',placeholder:'you@example.com',optional:true,attr:'autocomplete="email"'})}${field('GitHub','github',{type:'url',placeholder:'https://github.com/yourname',optional:true})}${field('LinkedIn','linkedin',{type:'url',placeholder:'https://linkedin.com/in/yourname',optional:true})}${field('Another website','website',{type:'url',placeholder:'https://your-website.com',optional:true})}${field('Availability note','availability',{optional:true,placeholder:'Open to internships',help:'Leave empty to hide the availability badge.'})}<p class="notice">These details will appear on your downloaded website. Your draft stays in this browser until you download or share it.</p>`;
  if(step==='design') html+=`<span class="group-label">Choose a layout</span><div class="template-options">${[['editorial','Editorial','Warm, considered & timeless',''],['studio','Studio','Bold, dark & expressive','dark'],['minimal','Minimal','Clear, modern & focused','clean']].map(([id,title,desc,cls])=>`<button type="button" data-template="${id}" class="template-option" aria-pressed="${draft.template===id}"><span class="template-thumbnail ${cls}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><strong>${title}</strong><small>${desc}</small></span></button>`).join('')}</div><span class="group-label">Accent colour</span><div class="swatches">${Object.entries(accents).map(([id,color])=>`<button type="button" class="swatch" data-accent="${id}" aria-label="${id} accent" aria-pressed="${draft.accent===id}" style="--swatch:${color}"></button>`).join('')}</div><div class="field"><label for="font">Headline style</label><select id="font" data-key="font"><option value="serif" ${draft.font==='serif'?'selected':''}>Classic serif</option><option value="sans" ${draft.font==='sans'?'selected':''}>Modern sans serif</option></select></div><p class="notice">Every layout adapts to phones and tablets. Your downloaded website includes its styles and photo, with no setup or account required.</p>`;
  $('#fields').innerHTML=html;
  $('#step-count').textContent=`0${steps.indexOf(step)+1} / 05`;
  $('#step-hint').textContent=step==='design'?'Looking good. Make it yours.':`Step ${steps.indexOf(step)+1} of 5 · Changes save automatically.`;
  $('#next').textContent=step==='design'?'Download website ↗':`Next: ${names[steps[steps.indexOf(step)+1]]} →`;
  document.querySelectorAll('[data-step]').forEach(b=>{b.classList.toggle('active',b.dataset.step===step);if(b.dataset.step===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
}
function changeStep(next) {step=next;renderFields();$('#editor-form').scrollTop=0;}
function download(filename,content,type) {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function exportWebsite() {
  if(!draft.name.trim()){changeStep('profile');$('#input-name').focus();toast('Add your name before downloading your website.');return;}
  const invalid = ['github','linkedin','website'].filter(k=>draft[k]&&!safeURL(draft[k]));
  if(draft.projects.some(p=>p.url&&!safeURL(p.url))) invalid.push('project links');
  if(draft.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(draft.email)) invalid.push('email');
  if(invalid.length){toast(`Please check your ${invalid.join(', ')} before downloading.`);return;}
  download('index.html',renderPortfolio(draft),'text/html;charset=utf-8');toast('Your website is ready. See “How to publish” to put it online.');
}
$('#editor-form').addEventListener('submit',ev=>ev.preventDefault());
$('#editor-form').addEventListener('input',ev=>{
  const key=ev.target.dataset.key;if(!key)return;
  const path=key.split('.');if(path.length===3)draft[path[0]][Number(path[1])][path[2]]=ev.target.value;else draft[key]=ev.target.value;
  update();
});
$('#fields').addEventListener('click',ev=>{
  const button=ev.target.closest('button');if(!button)return;
  if(button.id==='add-item') {draft[step].push(step==='projects'?{title:'',category:'',description:'',url:''}:{title:'',company:'',period:'',description:''});renderFields();$('#editor-form').scrollTop=$('#editor-form').scrollHeight;}
  else if(button.dataset.remove!==undefined) {const i=Number(button.dataset.remove);if(!confirm('Remove this entry from your draft?'))return;draft[step].splice(i,1);renderFields();}
  else if(button.dataset.move!==undefined) {const i=Number(button.dataset.move);if(i>0)[draft[step][i],draft[step][i-1]]=[draft[step][i-1],draft[step][i]];renderFields();}
  else if(button.dataset.template) {draft.template=button.dataset.template;renderFields();}
  else if(button.dataset.accent) {draft.accent=button.dataset.accent;renderFields();}
  else if(button.id==='remove-photo'){draft.photo='';renderFields();}
  else return;
  save();preview();
});
$('#fields').addEventListener('change',async ev=>{
  if(ev.target.id!=='photo')return;
  const file=ev.target.files?.[0];if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){toast('Choose a JPG, PNG, or WebP image smaller than 5 MB.');ev.target.value='';return;}
  try {
    const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const scale=Math.min(1,600/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();draft.photo=canvas.toDataURL('image/webp',0.85);save();renderFields();preview();toast('Photo added. It stays on your device.');
  }catch{toast('That image could not be opened. Try another photo.');}
});
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>changeStep(b.dataset.step)));
$('#next').addEventListener('click',()=>step==='design'?exportWebsite():changeStep(steps[steps.indexOf(step)+1]));
$('#export').addEventListener('click',exportWebsite);
for(const mode of ['desktop','mobile']) $('#'+mode).addEventListener('click',()=>{
  $('.browser-shell').classList.toggle('mobile',mode==='mobile');for(const other of ['desktop','mobile']){$('#'+other).classList.toggle('selected',other===mode);$('#'+other).setAttribute('aria-pressed',String(other===mode));}
});
$('#backup').addEventListener('click',()=>{download('folio-studio-draft.json',JSON.stringify({version:1,portfolio:draft},null,2),'application/json');toast('Draft saved. Import it here whenever you want to keep editing.');});
$('#import').addEventListener('change',async ev=>{
  const file=ev.target.files?.[0];if(!file)return;
  try {if(file.size>4*1024*1024)throw new Error('Draft files must be smaller than 4 MB.');const parsed=JSON.parse(await file.text());if(parsed.version!==1||!parsed.portfolio||typeof parsed.portfolio.name!=='string')throw new Error('Choose a draft exported from Folio Studio.');const next=normalize(parsed.portfolio);if(!confirm('Replace your current draft with this imported draft?'))return;draft=next;save();renderFields();preview();toast('Draft imported. Welcome back.');}
  catch(err){toast(err instanceof SyntaxError?'This file is not valid JSON. Choose a Folio Studio draft.':err.message);}
  finally{ev.target.value='';}
});
$('#reset').addEventListener('click',()=>{if(confirm('Start an empty portfolio? Your current draft will be replaced. Save a draft file first if you want to keep it.')){draft=structuredClone(blank);step='profile';save();renderFields();preview();toast('A fresh start. Tell your story.');}});
$('#help').addEventListener('click',()=>$('#help-dialog').showModal());
$('#fullscreen').addEventListener('click',()=>{$('#preview-dialog iframe').srcdoc=renderPortfolio(draft);$('#preview-dialog').showModal();});
document.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
renderFields();preview();
if(!storageOK) {$('#save-status').textContent='Save a draft file to keep your work';toast('Browser saving is unavailable. Use “Save draft file” to keep your work.');}
