'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');

(async()=>{
 const markup=['<!doctype html><html><body>',
  '<section id="landing"><div class="freshHome"><div class="freshHero"></div><div class="freshQuickSteps"></div>',
  '<div class="freshLibrary"><div class="freshLibraryTop"></div></div></div></section>',
  '<section id="schooldash" class="monthEnhanced"><div class="heading"><h1>School</h1></div>',
  '<div id="schoolTabs"><button data-workflow-tab="teachers"></button><button data-workflow-tab="progress"></button><button data-workflow-tab="history"></button></div>',
  '<div id="school-teachers"></div><div id="school-history"></div><div id="studioPanel"><div class="studioTop"><h2>Monthly</h2><p>Old text</p></div></div>',
  '<div id="school-overview"></div><div id="school-feedbackschool"></div>',
  '<div id="school-editor" class="hidden"><div class="row">Old toolbar</div><iframe id="editor"></iframe></div>',
  '</section></body></html>'].join('');
 const dom=new JSDOM(markup,{url:'https://example.test/',runScripts:'outside-only'});
 const w=dom.window,d=w.document;
 w.__mprDeveloperPortrait='data:image/png;base64,iVBORw0KGgo=';
 vm.runInContext("const Studio = {directSaveExport:async function(){window.__exportCalls=(window.__exportCalls||0)+1},showPanel:function(){window.__showCalls=(window.__showCalls||0)+1}}",dom.getInternalVMContext());
 assert.equal(w.Studio,undefined,'Actual portal Studio is a top-level const, not a window property');
 d.getElementById('school-editor').scrollIntoView=()=>{};
 vm.runInContext(fs.readFileSync('fresh-experience-v2.js','utf8'),dom.getInternalVMContext());
 assert.ok(d.querySelector('#fresh-developer'),'Separate developer section');
 assert.equal(d.querySelector('#freshDeveloperPortrait').getAttribute('src'),w.__mprDeveloperPortrait,'Existing original photo remains');
 assert.match(d.querySelector('#fresh-developer').textContent,/DEVELOPED BY[\s\S]*Muzafar Ali Solangi/i);
 assert.match(d.querySelector('#fresh-support a').href,/wa\.me\/923000357397/,'WhatsApp support');
 assert.equal(d.querySelector('#schoolTabs [data-workflow-tab="progress"]').textContent,'02 · Monthly Progress');
 assert.ok(d.querySelector('#freshPreviewDownload'),'Visible dedicated download control must exist');
 const state={schoolName:'Sample School',semis:'12345678',month:'October',year:2026};
 await w.PortalExcelPreview.open(state,'2026-10');
 assert.equal(w.PortalExcelPreview.isOpen(),true);
 assert.equal(d.getElementById('school-editor').classList.contains('hidden'),false);
 assert.equal(d.getElementById('studioPanel').classList.contains('hidden'),true);
 assert.equal(w.__exportCalls||0,0,'Opening preview MUST NOT start downloading before user confirms');
 assert.match(d.getElementById('freshPreviewMonth').textContent,/2026-10/);
 d.querySelector('#freshPreviewDownload').click();
 await Promise.resolve(); await Promise.resolve();
 assert.equal(w.__exportCalls,1,'Explicit preview download click triggers secure export exactly once');
 w.PortalExcelPreview.onExportSaved();
 assert.match(d.querySelector('#freshPreviewStatus').textContent,/saved to school history/i);
 d.querySelector('[data-preview-edit]').click();
 assert.equal(w.PortalExcelPreview.isOpen(),false);
 assert.equal(w.__showCalls,1,'Edit returns to the same school Studio');
 dom.window.close();
 console.log('PASS: Mobile sections, developer portrait, WhatsApp, original Excel preview first, user-confirmed download');
})().catch(error=>{console.error(error);process.exitCode=1;});
