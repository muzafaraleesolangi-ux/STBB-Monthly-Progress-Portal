'use strict';
/* Persistent school page navigation — route only, no credential copying. */
(function(){
 const KEY='mpr_school_last_page_v3';
 let restoring=false,lastRestoredSemis='';
 const schoolCode=()=>typeof auth!=='undefined'&&auth&&!auth.admin?String(auth.semis||''):'';
 function read(){
  try{
   const item=JSON.parse(sessionStorage.getItem(KEY)||'null');
   return item&&item.semis===schoolCode()&&['teachers','progress','history','preview'].includes(item.section)?item:null;
  }catch{return null}
 }
 function remember(section,month,stage){
  const semis=schoolCode();
  if(restoring||!semis)return;
  const old=read()||{};
  const state={
   semis,section,
   month:/^20\d{2}-(0[1-9]|1[0-2])$/.test(String(month||''))?month:(old.month||''),
   stage:Number.isInteger(stage)?stage:(old.stage??5)
  };
  try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch{}
 }
 function clear(){try{sessionStorage.removeItem(KEY)}catch{}lastRestoredSemis=''}
 const previousShow=show;
 show=function(id,...args){
  const result=previousShow(id,...args);
  if(id==='landing'&&!auth)clear();
  return result;
 };
 const previousDashTab=dashTab;
 dashTab=function(tab,...args){
  const result=previousDashTab(tab,...args);
  if(tab==='teachers'||tab==='history')remember(tab,typeof Studio!=='undefined'?Studio.activePeriod?.():'');
  return result;
 };
 if(typeof Studio!=='undefined'){
  const oldOpen=Studio.openPeriod;
  Studio.openPeriod=async function(month,...args){
   const result=await oldOpen(month,...args);
   if(Studio.activePeriod?.()===month)remember('progress',month,5);
   return result;
  };
  const oldShow=Studio.showPanel;
  Studio.showPanel=function(...args){
   const result=oldShow(...args);
   remember('progress',Studio.activePeriod?.()||'');
   return result;
  };
 }
 if(window.PortalExcelPreview){
  const oldPreview=window.PortalExcelPreview.open;
  window.PortalExcelPreview.open=async function(snapshot,month,...args){
   const result=await oldPreview(snapshot,month,...args);
   remember('preview',month,5);
   return result;
  };
 }
 document.addEventListener('click',event=>{
  const stage=event.target.closest('#studioPanel [data-studio-stage]');
  if(stage&&typeof Studio!=='undefined'){
   const step=Number(stage.dataset.studioStage);
   if(Number.isInteger(step))remember('progress',Studio.activePeriod?.()||'',step)
  }
  if(event.target.closest('[data-preview-edit]')){
   remember('progress',typeof Studio!=='undefined'?Studio.activePeriod?.():'',5);
  }
 });
 async function restoreAfterLogin(){
  const code=schoolCode();
  if(!code||!account||String(account.semis||'')!==code||typeof Studio==='undefined')return false;
  if(lastRestoredSemis===code)return true;
  const saved=read();
  restoring=true;
  try{
   if(!saved){
    dashTab('teachers',document.querySelector('#schoolTabs [data-workflow-tab="teachers"]'));
    lastRestoredSemis=code;
    return true;
   }
   if(saved.section==='teachers'||saved.section==='history'){
    dashTab(saved.section,document.querySelector('#schoolTabs [data-workflow-tab="'+saved.section+'"]'));
   }else{
    if(saved.month&&Studio.activePeriod?.()!==saved.month){
     await Studio.openPeriod(saved.month);
    }
    if(saved.section==='preview'&&Studio.activePeriod?.()===saved.month){
     await Studio.previewReport();
     if(!window.PortalExcelPreview?.isOpen?.())Studio.showPanel();
    }else{
     Studio.showPanel();
     if(Number.isInteger(saved.stage)&&saved.stage>=0&&saved.stage<=5&&saved.stage!==5)Studio.stage?.(saved.stage);
    }
   }
   lastRestoredSemis=code;
   return true;
  }catch(error){
   console.warn('Could not reopen last school page:',error);
   try{Studio.showPanel()}catch{}
   lastRestoredSemis=code;
   return false;
  }finally{restoring=false}
 }
 window.PortalState={restoreAfterLogin,remember,clear,read};
})();
