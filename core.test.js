import test from 'node:test';
import assert from 'node:assert/strict';
import {sample, blank, normalize, safeURL, renderPortfolio, templates} from './core.js';

test('all layouts export complete standalone websites',()=>{
  for(const template of templates){
    const html=renderPortfolio({...sample,template});
    assert.ok(html.startsWith('<!doctype html>'));
    assert.ok(html.includes(`class="${template}"`));
    assert.ok(html.includes('Alex Morgan'));
    assert.ok(html.includes('Everyday Objects'));
    assert.ok(!/<script|<link\s/i.test(html),'export must work without scripts or external styles');
    assert.ok(html.includes('name="viewport"'));
  }
});
test('user content cannot become executable HTML',()=>{
  const injection='\"><img src=x onerror=alert(1)><script>alert(1)</script>';
  const html=renderPortfolio({...sample,name:injection,headline:injection,bio:injection,projects:[{title:injection,description:injection,url:'javascript:alert(1)'}]});
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('&lt;script&gt;'));
});
test('only ordinary web links are published',()=>{
  for(const value of ['javascript:alert(1)','data:text/html,test','file:///etc/passwd','https://user:pass@example.com','http://exa mple.com'])assert.equal(safeURL(value),'',value);
  assert.equal(safeURL('github.com/aaidh'),'https://github.com/aaidh');
  assert.equal(safeURL('https://example.com/?a=1&b=2'),'https://example.com/?a=1&b=2');
});
test('imports constrain structure and reject unsafe images and design values',()=>{
  const d=normalize({...sample,photo:'data:image/svg+xml;base64,AAAA',template:'</style><script>',accent:'__proto__',font:'evil',projects:[null,...Array.from({length:30},()=>({title:'x',unknown:'drop'}))]});
  assert.equal(d.photo,'');assert.equal(d.template,'editorial');assert.equal(d.accent,'forest');
  assert.equal(d.font,'serif');assert.equal(d.projects.length,19);assert.ok(!('unknown' in d.projects[0]));
  assert.throws(()=>normalize(null));assert.throws(()=>normalize([]));
});
test('blank and partially completed drafts produce clean optional sections',()=>{
  const html=renderPortfolio(blank);
  assert.ok(!html.includes('id="work"'));assert.ok(!html.includes('id="experience"'));
  assert.ok(!html.includes('mailto:'));assert.ok(html.includes('Thanks for stopping by.'));
});
test('email, photo and links escape attributes',()=>{
  const html=renderPortfolio({...sample,email:'bad\"@example.com',photo:'data:image/png;base64,aGVsbG8=',github:'https://example.com/?a=1&b=2'});
  assert.ok(html.includes('data:image/png;base64,aGVsbG8='));
  assert.ok(html.includes('href="https://example.com/?a=1&amp;b=2"'));
  assert.ok(!html.includes('href="mailto:bad"'));
});
