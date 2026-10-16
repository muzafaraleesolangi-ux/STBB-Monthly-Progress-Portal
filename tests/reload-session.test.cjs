'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const code=fs.readFileSync('portal-state-v3.js','utf8');
const page=fs.readFileSync('index.html','utf8');
const studio=fs.readFileSync('studio-core-v2.js','utf8');
const experience=fs.readFileSync('fresh-experience-v2.js','utf8');
assert.match(page,/portal-state-v3\.js\?v=\d+/,'Load route-restoration module');
assert.match(page,/PortalState\?\.restoreAfterLogin/,'Restoration occurs AFTER authenticated school account is loaded');
assert.doesNotMatch(studio,/activate\(\)\.then\(\(\)=>dashTab\('teachers'/,'Never force the Teachers section after page refresh');
assert.doesNotMatch(experience,/!window\.Studio\|\|typeof Studio\.directSaveExport/,'Do not check nonexistent window.Studio for Excel export');
assert.match(experience,/typeof Studio==='undefined'\|\|typeof Studio\.directSaveExport/,'Use actual Studio binding for Excel export');

async function check(section){
 const dom=new JSDOM('<!doctype html><html><body><div id="schoolTabs"><button data-workflow-tab="teachers"></button><button data-workflow-tab="history"></button></div><div id="studioPanel"></div></body></html>',{url:'https://example.test',runScripts:'outside-only'});
 const w=dom.window,events=[];
 w.auth={token:'test-token',semis:'401234567',admin:false,role:'hm'};
 w.account={semis:'401234567',school_name:'Test School'};
 w.show=()=>{};
 w.dashTab=tab=>events.push('tab:'+tab);
 let active='',previewOpen=false;
 w.Studio={
  activePeriod:()=>active,
  openPeriod:async month=>{active=month;events.push('month:'+month)},
  showPanel:()=>events.push('progress'),
  previewReport:async()=>{previewOpen=true;events.push('preview')},
  stage:n=>events.push('stage:'+n)
 };
 w.PortalExcelPreview={
  open:async()=>{previewOpen=true;events.push('preview-open')},
  isOpen:()=>previewOpen
 };
 w.sessionStorage.setItem('mpr_school_last_page_v3',JSON.stringify({semis:'401234567',section,month:'2026-10',stage:4}));
 w.eval(code);
 const restored=await w.PortalState.restoreAfterLogin();
 assert.equal(restored,true);
 if(section==='progress')assert.deepEqual(events,['month:2026-10','progress','stage:4'],'Restore same report, month and editing stage');
 if(section==='preview')assert.deepEqual(events,['month:2026-10','preview'],'Restore live Excel preview for the same month');
 if(section==='history')assert.deepEqual(events,['tab:history'],'Restore Excel History rather than resetting home');
 if(section==='teachers')assert.deepEqual(events,['tab:teachers'],'Restore selected teacher workspace');
 await w.PortalState.restoreAfterLogin();
 assert.equal(events.length,section==='progress'?3:section==='preview'?2:1,'Repeated session initialization must not reset route again');
 dom.window.close();
}
Promise.all(['progress','preview','history','teachers'].map(check)).then(()=>console.log('PASS: same tab/month/editor/preview after reload; no forced logout or home redirect')).catch(e=>{console.error(e);process.exitCode=1});
