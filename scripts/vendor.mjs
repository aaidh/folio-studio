import {mkdir,copyFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await mkdir(new URL('vendor/',root),{recursive:true});
for(const [source,target] of [['html2canvas/dist/html2canvas.min.js','html2canvas.min.js'],['html2canvas/LICENSE','html2canvas.LICENSE'],['jspdf/dist/jspdf.umd.min.js','jspdf.umd.min.js'],['jspdf/LICENSE','jspdf.LICENSE']])await copyFile(new URL('node_modules/'+source,root),new URL('vendor/'+target,root));
console.log('Copied pinned export libraries and licenses into vendor/.');
