import test from 'node:test';
import assert from 'node:assert/strict';
import {exportDimensions,pageSlices,portfolioFilename,exportVisual} from './export.js';

test('image dimensions respect memory and long-canvas limits',()=>{
  assert.deepEqual(exportDimensions(1024,2000,2),{width:2048,height:4000,scale:2});
  for(const height of [500,5000,20000,100000]){const d=exportDimensions(1024,height,2);assert.ok(d.height<=16000);assert.ok(d.width*d.height<=24000000);assert.ok(d.width>0);}
  assert.throws(()=>exportDimensions(0,100));assert.throws(()=>exportDimensions(100,NaN));
});
test('PDF slices cover every pixel without gaps or overlaps',()=>{
  const slices=pageSlices(5000,1200,[[1100,1250],[2300,2400]]);
  assert.ok(slices[0].height<=1100);
  let end=0;for(const slice of slices){assert.equal(slice.top,end);assert.ok(slice.height>0&&slice.height<=1200);end+=slice.height;}
  assert.equal(end,5000);
  assert.deepEqual(pageSlices(300,1000),[{top:0,height:300}]);
  assert.throws(()=>pageSlices(100,0));
  const balanced=pageSlices(2600,1200);
  assert.ok(balanced.every(slice=>slice.height>800),'avoid a nearly empty final page');
});
test('PDF pagination handles oversized illustrations without looping',()=>{
  const slices=pageSlices(4000,1000,[[0,3500],[900,1200],[899,1001]]);
  assert.equal(slices.reduce((sum,s)=>sum+s.height,0),4000);
  assert.ok(slices.length<=6);
});
test('download names remove unsafe characters and preserve ordinary names',()=>{
  assert.equal(portfolioFilename('Alex Morgan','pdf'),'alex-morgan-portfolio.pdf');
  assert.equal(portfolioFilename('../Aaidh <script>','jpg'),'aaidh-script-portfolio.jpg');
  assert.equal(portfolioFilename('李','png'),'portfolio-portfolio.png');
});
test('export errors explain missing tools and unsupported formats',async()=>{
  await assert.rejects(exportVisual({}, {format:'gif'}),/Choose PNG/);
  await assert.rejects(exportVisual({}, {format:'png'}),/export tools have not loaded/);
});
