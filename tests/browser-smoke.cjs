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
   await page.goto('http://127.0.0.1:8765/?dev=1',{waitUntil:'domcontentloaded',timeout:60000});
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
   await page.keyboard.press('Space');
   await page.waitForTimeout(120);
   const jumped=await page.evaluate(()=>window.MacFrogV8.info());
   assert(jumped.player.y<moved.player.y-15,'Original jump movement not working');
   await page.keyboard.press('KeyZ');
   await page.keyboard.press('KeyC');
   await page.waitForTimeout(300);
   await page.keyboard.press('m');
   await page.waitForTimeout(250);
   const withMap=await page.evaluate(()=>window.MacFrogV8.info());
   assert.equal(withMap.mapOpen,true,'M failed to open map');
   await page.keyboard.down('ArrowRight');
   await page.waitForTimeout(450);
   await page.keyboard.up('ArrowRight');
   const stillPaused=await page.evaluate(()=>window.MacFrogV8.info());
   assert(Math.abs(stillPaused.player.x-withMap.player.x)<1,'Map pause did not stop movement');
   await page.screenshot({path:path.join(output,'v8-world-map.png'),fullPage:false});
   await page.keyboard.press('m');
   const closed=await page.evaluate(()=>window.MacFrogV8.info());
   assert.equal(closed.mapOpen,false,'M failed to close map');
   const validation=await page.evaluate(()=>window.MacFrogV8.validate());
   assert.equal(validation.ok,true,JSON.stringify(validation));
   // Browser-rendered walkthrough: inspect the real game engine across distinct geometries.
   const tour=[
     ['poco','vertical-shaft'],
     ['santuario','water-sanctuary'],
     ['hub','central-hub'],
     ['lago','flooded-lake'],
     ['arvore','ancient-tree'],
     ['eclusa','water-lock'],
     ['copa','upper-canopy'],
     ['saida','final-gate']
   ];
   for(const [id,slug] of tour){
     const state=await page.evaluate(roomId=>({
       info:window.MacFrogV8Dev.enter(roomId),
       geometry:window.MacFrogV8Dev.inspect(roomId)
     }),id);
     assert.equal(state.info.current,id,'Wrong room loaded in browser: '+id);
     assert(state.geometry.platforms>0,'No platforms in '+id);
     assert(state.geometry.doors.length>0,'No doors in '+id);
     if(id==='poco')assert(state.geometry.height>1450,'Vertical shaft is not multi-screen');
     await page.waitForTimeout(150);
     await page.screenshot({path:path.join(output,'v8-'+slug+'.png')});
   }
   const gateBefore=await page.evaluate(()=>window.MacFrogV8Dev.inspect('saida'));
   assert(gateBefore.doors.some(d=>d.water),'Final gate lacks a water requirement');
   const switched=await page.evaluate(()=>window.MacFrogV8Dev.setWater(true));
   assert.equal(switched,true,'Water unlock developer inspection failed');
   const gateAfter=await page.evaluate(()=>window.MacFrogV8Dev.inspect('saida'));
   assert(gateAfter.doors.some(d=>d.water),'Unlock must keep the door progression rule');
   if(errors.length)throw Error('Browser errors: '+errors.join(' | '));
   console.log('BROWSER_SMOKE_OK',JSON.stringify({initial,moved,withMap,validation}));
 }catch(e){
   await page.screenshot({path:path.join(output,'v8-browser-failed.png'),fullPage:false}).catch(()=>{});
   console.error('BROWSER_SMOKE_FAILED',e.stack||e,errors);
   process.exitCode=1;
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});