/* Real DOM regression tests for classwise teacher subject selection. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
async function main(){
 const html='<!doctype html><html><body><main><section id="schooldash"><div id="schoolTabs"></div><div id="school-overview"></div><div id="school-editor" class="hidden"></div><div id="school-history" class="hidden"></div></section></main></body></html>';
 const dom=new JSDOM(html,{url:'https://portal.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 w.structuredClone=global.structuredClone;
 w.scrollTo=()=>{};
 w.alert=msg=>{throw Error('Unexpected alert: '+msg)};
 w.confirm=()=>true;
 w.crypto.randomUUID=()=>'e2d113ee-7a22-4091-888e-c96c88d983f5';
 let serverSetup={
  selectedClasses:[4,5],
  teachers:[
   {id:'t1',name:'Teacher One',pid:'111',designation:'PST',classes:[4,5]},
   {id:'t2',name:'Teacher Two',pid:'222',designation:'PST',classes:[4,5]}
  ],
  books:{
   5:[
    {id:'5-english',name:'English',chapters:['A','B'],active:false,teacherId:''},
    {id:'5-maths',name:'Mathematics',chapters:['One','Two'],active:false,teacherId:''},
    {id:'5-science',name:'Science',chapters:['Cells'],active:false,teacherId:''}
   ],
   4:[
    {id:'4-english',name:'English',chapters:['Reading'],active:false,teacherId:''},
    {id:'4-sindhi',name:'Sindhi',chapters:['Lesson'],active:false,teacherId:''}
   ]
  }
 };
 let serverVersion=1, saveCalls=0;
 w.fetch=async(url,opts={})=>{
  const body=JSON.parse(opts.body||'{}');
  let out={};
  if(body.action==='load-setup')out={setup:serverSetup,version:serverVersion};
  else if(body.action==='save-setup'){
    if(body.version!==serverVersion)return {ok:false,status:409,json:async()=>({error:'Concurrent setup change'})};
    serverSetup=JSON.parse(JSON.stringify(body.setup));serverVersion++;saveCalls++;out={version:serverVersion}
  }else throw Error('Unexpected server action: '+body.action);
  return {ok:true,status:200,json:async()=>out}
 };
 w.eval(String.raw