import {renderPortfolio} from './core.js';

// Bound canvas memory and dimensions so long portfolios also work on phones.
export function exportDimensions(width, height, requestedScale = 2) {
  if (![width,height,requestedScale].every(v=>Number.isFinite(v)&&v>0)) throw new Error('Invalid portfolio dimensions.');
  const scale=Math.min(requestedScale,16000/width,16000/height,Math.sqrt(24000000/(width*height)));
  return {width:Math.max(1,Math.floor(width*scale)),height:Math.max(1,Math.floor(height*scale)),scale};
}

export function pageSlices(totalHeight, pageHeight, intervals = []) {
  if(!Number.isFinite(totalHeight)||!Number.isFinite(pageHeight)||totalHeight<1||pageHeight<1)throw new Error('Invalid page dimensions.');
  const slices=[];let top=0;
  while(top<totalHeight){
    const remaining=totalHeight-top;
    const remainingPages=Math.ceil(remaining/pageHeight);
    let bottom=Math.min(totalHeight,top+Math.ceil(remaining/remainingPages));
    if(bottom<totalHeight){
      // Move a cut above any line or illustration crossing it, but keep pages useful.
      let changed=true;
      while(changed){changed=false;for(const [start,end] of intervals){if(start<bottom && end>bottom && start>top+pageHeight*0.55){bottom=Math.floor(start);changed=true;}}}
    }
    bottom=Math.max(top+1,Math.floor(bottom));slices.push({top,height:bottom-top});top=bottom;
  }
  return slices;
}

export function portfolioFilename(name, extension) {
  const slug=String(name||'portfolio').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'portfolio';
  return `${slug}-portfolio.${extension}`;
}

function canvasBlob(canvas,type,quality) {
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The image is too large for this browser. Try standard quality or fewer entries.')),type,quality));
}

function lineIntervals(doc, scale) {
  const result=[];
  const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(!node.textContent.trim() || ['STYLE','SCRIPT'].includes(node.parentElement?.tagName))continue;
    const range=doc.createRange();range.selectNodeContents(node);
    for(const rect of range.getClientRects())if(rect.height>0) result.push([Math.floor(rect.top*scale),Math.ceil(rect.bottom*scale)]);
  }
  for(const element of doc.querySelectorAll('.project-visual,.portrait')){const rect=element.getBoundingClientRect();result.push([Math.floor(rect.top*scale),Math.ceil(rect.bottom*scale)]);}
  return result;
}

export async function exportVisual(draft,{format,width=1024,scale=2,onProgress=()=>{}}={}) {
  if(!['png','jpeg','pdf'].includes(format))throw new Error('Choose PNG, JPG, or PDF.');
  if(typeof globalThis.html2canvas!=='function' || (format==='pdf'&&!globalThis.jspdf?.jsPDF))throw new Error('The export tools have not loaded. Refresh the page and try again.');
  const frame=document.createElement('iframe');
  frame.title='Preparing portfolio download';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
  frame.setAttribute('sandbox','allow-same-origin');
  frame.style.cssText=`position:fixed;left:-20000px;top:0;width:${width}px;height:800px;border:0;pointer-events:none;`;
  try {
    onProgress('Preparing your portfolio…');
    const loaded=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Portfolio preparation took too long. Please try again.')),20000);frame.onload=()=>{clearTimeout(timer);resolve();};});
    frame.srcdoc=renderPortfolio(draft);document.body.append(frame);await loaded;
    const doc=frame.contentDocument;
    await doc.fonts.ready;
    await Promise.all([...doc.images].map(img=>img.decode().catch(()=>{throw new Error('Your photo could not be included. Try uploading it again.');})));
    const height=Math.ceil(Math.max(doc.body.scrollHeight,doc.documentElement.scrollHeight));
    const dimensions=exportDimensions(width,height,scale);
    onProgress('Rendering your design…');
    const backgroundColor=frame.contentWindow.getComputedStyle(doc.body).backgroundColor;
    const canvas=await globalThis.html2canvas(doc.body,{scale:dimensions.scale,width,height,windowWidth:width,windowHeight:height,scrollX:0,scrollY:0,backgroundColor,logging:false,imageTimeout:15000});
    if(!canvas.width||!canvas.height)throw new Error('The portfolio could not be rendered. Try standard quality.');
    if(format!=='pdf')return {blob:await canvasBlob(canvas,`image/${format}`,format==='jpeg'?0.94:undefined),filename:portfolioFilename(draft.name,format==='jpeg'?'jpg':'png')};
    onProgress('Creating PDF pages…');
    const pdf=new globalThis.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.setProperties({title:`${draft.name} — Portfolio`,author:draft.name,creator:'Folio Studio'});
    const margin=12, pageWidth=210-2*margin, pageHeight=297-2*margin;
    let pixelHeight=Math.floor(pageHeight/pageWidth*canvas.width);
    // Fit a near-complete single page rather than orphaning a footer on page two.
    if(canvas.height<=pixelHeight*1.15)pixelHeight=canvas.height;
    const slices=pageSlices(canvas.height,pixelHeight,lineIntervals(doc,dimensions.scale));
    for(const [i,slice] of slices.entries()){
      if(i)pdf.addPage();
      const page=document.createElement('canvas');page.width=canvas.width;page.height=slice.height;
      const ctx=page.getContext('2d');ctx.fillStyle=draft.template==='studio'?'#19251f':'#ffffff';ctx.fillRect(0,0,page.width,page.height);ctx.drawImage(canvas,0,slice.top,canvas.width,slice.height,0,0,page.width,page.height);
      const renderWidth=Math.min(pageWidth,pageHeight*canvas.width/slice.height);
      pdf.addImage(page.toDataURL('image/jpeg',0.95),'JPEG',(210-renderWidth)/2,margin,renderWidth,slice.height/canvas.width*renderWidth,undefined,'FAST');
      page.width=page.height=0;
      onProgress(`Creating PDF page ${i+1} of ${slices.length}…`);
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    return {blob:pdf.output('blob'),filename:portfolioFilename(draft.name,'pdf')};
  } finally {frame.remove();}
}
