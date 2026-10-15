'use strict';
/* Single export delivery path shared by new Studio, legacy Editor, History and Android.
   Cloud save happens BEFORE download. Original workbook is always retained in History. */
window.MPRDownloads=(()=>{
 const MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
 const MAX_B64=4400000;
 let lastUrl=null,cleanupTimer=null;
 function filename(value){const f=String(value||'Monthly_Progress.xlsx').replace(/[\\/<>:"|?*\u0000-\u001f]/g,'_').slice(0,175);return f.toLowerCase().endsWith('.xlsx')?f:f+'.xlsx'}
 function status(){let el=document.getElementById('mprDownloadHint');if(!el){el=document.createElement('div');el.id='mprDownloadHint';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.style.cssText='position:fixed;left:12px;right:12px;bottom:18px;z-index:10005;background:#143e52;color:#fff;padding:12px 14px;border-radius:12px;box-shadow:0 10px 32px #1235;font:12px system-ui,sans-serif;display:flex;align-items:center;gap:12px;flex-wrap:wrap';document.body.appendChild(el)}return el}
 function bytes(base64){
  if(typeof base64!=='string'||!base64.startsWith('UEs')||base64.length>MAX_B64)throw Error('Invalid Excel data: cannot prepare .xlsx file.');
  const str=atob(base64);if(str.length<100)throw Error('Excel file is empty or incomplete.');
  const u=new Uint8Array(str.length);for(let i=0;i<str.length;i++)u[i]=str.charCodeAt(i);
  // ZIP local-file header PK 03 04.
  if(u[0]!==0x50||u[1]!==0x4b||u[2]!==0x03||u[3]!==0x04)throw Error('Excel file structure is invalid.');
  return u
 }
 function showLink(blob,name){
  if(lastUrl)URL.revokeObjectURL(lastUrl);
  clearTimeout(cleanupTimer);
  const url=URL.createObjectURL(blob);lastUrl=url;
  const pane=status();pane.replaceChildren();
  const info=document.createElement('span');info.textContent='Excel prepared. If your browser did not download it, tap:';
  const link=document.createElement('a');link.href=url;link.download=name;link.textContent='⬇ Save '+name;link.style.cssText='background:#fff;color:#135b69;padding:8px 12px;border-radius:8px;font-weight:750;max-width:100%;overflow-wrap:anywhere;text-decoration:none';
  const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Dismiss download helper');close.style.cssText='color:#fff;background:transparent;border:1px solid #fff8;border-radius:6px;padding:4px 8px;cursor:pointer';
  close.onclick=()=>{pane.remove();clearTimeout(cleanupTimer);cleanupTimer=setTimeout(()=>{if(lastUrl===url){URL.revokeObjectURL(url);lastUrl=null}},180000)};
  pane.append(info,link,close);
  // Keep the link available as a second explicit tap: Android Chrome blocks some
  // programmatic downloads after asynchronous API calls.
  cleanupTimer=setTimeout(()=>{if(lastUrl===url){URL.revokeObjectURL(url);lastUrl=null}pane.remove()},300000);
  return {url,link}
 }
 function saveExcel(base64,name){
  const safeName=filename(name);
  const data=bytes(base64),blob=new Blob([data],{type:MIME});
  const {link}=showLink(blob,safeName);
  link.click();
  return {mode:'browser',message:'Excel archived. Download started; use Save link if needed.'}
 }
 return {saveExcel,bytes,filename}
})();