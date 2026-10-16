'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');

const page=fs.readFileSync('index.html','utf8');
const studio=fs.readFileSync('studio-core-v2.js','utf8');
const older=fs.readFileSync('report-premium-v4.css','utf8');
const premium=fs.readFileSync('fresh-portal-v1.css','utf8');

assert.match(page,/<link rel="stylesheet" href="fresh-portal-v1\.css\?v=\d+"/,'Premium CSS must load on the page');
assert.match(page,/<script src="fresh-portal-v1\.js\?v=\d+"><\/script>/,'Premium UI must initialize directly on the page');
assert.match(studio,/data-quick-save-export/,'The subject stage must present an export control');
assert.match(studio,/function directSaveExport\(/,'Export button must invoke the secure workflow');
assert.doesNotMatch(older,/#studioPanel\[data-stage="5"\]\s*\.studioFooter\s*\{\s*display\s*:\s*none\s*!important/,'Legacy CSS must never hide the entire export footer');
assert.doesNotMatch(older,/\.studioFooter\s*>\s*:not\(#studioReviewAction\)\s*\{\s*display\s*:\s*none\s*!important/,'Legacy CSS must not hide replacement export buttons');

const d=new JSDOM('<!doctype html><html><head><style>'+older+'\n'+premium+'</style></head><body><section id="studioPanel" data-stage="5"><div class="studioFooter" id="studioFooter"><span class="freshFooterLabel">October 2026</span><button type="button" class="freshSave" data-progress-saveall>Save</button><button type="button" class="freshExport" data-quick-save-export>Save &amp; Export Excel</button></div></section></body></html>');
const footer=d.window.document.getElementById('studioFooter');
const button=footer.querySelector('[data-quick-save-export]');
assert.ok(button,'Export action must exist in the reporting footer');
assert.notEqual(d.window.getComputedStyle(footer).display,'none','Reporting footer must be rendered visibly');
assert.notEqual(d.window.getComputedStyle(button).display,'none','Export button must be rendered visibly');
assert.match(button.textContent,/Export Excel/);
d.window.close();
console.log('PASS: visible Save and Export Excel buttons under merged legacy and premium CSS');
