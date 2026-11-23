'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const errors=[],root=path.resolve(__dirname,'..'),output=path.join(root,'test-results');
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1365,height:768},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text())});
 try{
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>Boolean(window.MacFrogV8&&window.MacFrogV8.info),null,{timeout:60000});
   await page.waitForTimeout(1800);
   const initial=await page.evaluate(()=>window.MacFrogV8.info());
   assert.equal(initial.version,'8.0');
   assert.equal(initial.rooms,43);
   await page.screenshot({path:path.join(output,'v8-first-room.png'),fullPage:false});
   await page.keyboard.down('ArrowRight');
   await page.waitForTimeout(950);
   await page.keyboard.up('ArrowRight');
   const moved=await page.evaluate(()=>window.MacFrogV8.info());
   assert(moved.player.x>initial.player.x+10,'Player did not move: '+JSON.stringify({initial,moved}));
   await page.keyboard.press('m');
   await page.waitForTimeout(250);
   const withMap=await page.evaluate(()=>window.MacFrogV8.info());
   assert.equal(withMap.mapOpen,true,'M failed to open map');
   await page.screenshot({path:path.join(output,'v8-world-map.png'),fullPage:false});
   await page.keyboard.press('m');
   const closed=await page.evaluate(()=>window.MacFrogV8.info());
   assert.equal(closed.mapOpen,false,'M failed to close map');
   const validation=await page.evaluate(()=>window.MacFrogV8.validate());
   assert.equal(validation.ok,true,JSON.stringify(validation));
   if(errors.length)throw Error('Browser errors: '+errors.join(' | '));
   console.log('BROWSER_SMOKE_OK',JSON.stringify({initial,moved,withMap,validation}));
 }catch(e){
   await page.screenshot({path:path.join(output,'v8-browser-failed.png'),fullPage:false}).catch(()=>{});
   console.error('BROWSER_SMOKE_FAILED',e.stack||e,errors);
   process.exitCode=1;
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});