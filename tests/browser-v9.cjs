'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results-v9');
 fs.mkdirSync(out,{recursive:true});
 const errors=[];
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1365,height:768},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
  await page.goto('http://127.0.0.1:8765/?dev=1&version=9',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!(window.MacFrogV9&&window.MacFrogV9Dev),null,{timeout:60000});
  await page.waitForTimeout(900);
  const info=await page.evaluate(()=>window.MacFrogV9.info());
  assert.equal(info.version,'9.0');assert.equal(info.rooms,43);
  const valid=await page.evaluate(()=>window.MacFrogV9.validate());
  assert.equal(valid.ok,true,JSON.stringify(valid));
  await page.screenshot({path:path.join(out,'v9-entrance.png')});
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(440);
  await page.keyboard.up('ArrowRight');
  const moved=await page.evaluate(()=>window.MacFrogV9.info());
  assert(moved.player.x>info.player.x+10,'Player movement broken');
  await page.keyboard.press('Space');
  await page.keyboard.press('m');
  await page.waitForTimeout(110);
  await page.screenshot({path:path.join(out,'v9-map.png')});
  await page.keyboard.press('m');
  // Actual V8/V9 transition functions, collision and spawn for all 136 directions.
  const links=await page.evaluate(()=>window.MacFrogMapV6.rooms().flatMap(r=>
    r.exits.filter(e=>e.to!=='__NEXT_AREA__').map(e=>({from:r.id,to:e.to,gated:e.requiresWater}))));
  assert.equal(links.length,136,'Unexpected directional count');
  let gated=0,downward=0;
  for(const l of links){
   const open=await page.evaluate(x=>window.MacFrogV9Dev.testDoor(x.from,x.to,true),l);
   assert.equal(open.arrived,l.to,'Failed open transition '+JSON.stringify(open));
   assert.equal(open.collision,false,'Colliding spawn '+JSON.stringify(open));
   assert.equal(open.inBounds,true,'Invalid arrival '+JSON.stringify(open));
   const closed=await page.evaluate(x=>window.MacFrogV9Dev.testDoor(x.from,x.to,false),l);
   assert.equal(closed.arrived,l.gated?l.from:l.to,'Gate mismatch '+JSON.stringify(closed));
   if(l.gated)gated++;
   if(open.side==='bottom')downward++;
  }
  assert(downward>0,'No real downward transitions tested');
  assert(gated>0,'No ability gates tested');
  const shafts=await page.evaluate(()=>{
   return window.MacFrogMapV6.rooms().filter(r=>r.exits.some(e=>e.side==='bottom'))
    .map(r=>window.MacFrogV9Diagnostics.inspectShaft(r.id));
  });
  for(const shaft of shafts){
   assert(shaft.shaft&&shaft.blockingFloors.length===0,'Blocked physical shaft: '+shaft.id);
  }
  // Physical fall: start above a genuine gap and let the original gravity,
  // collisions, event loop and transition system do the work (no direct teleport).
  for(const start of ['entrada','poco','torre']){
   const prepared=await page.evaluate(id=>window.MacFrogV9Dev.preparePhysicalFall(id),start);
   await page.waitForFunction(
    origin=>window.MacFrogV9.info().room!==origin,{timeout:4800},start
   );
   const arrived=await page.evaluate(()=>window.MacFrogV9.info());
   assert.equal(arrived.room,prepared.expected,
      'Natural falling descent failed: '+JSON.stringify({prepared,arrived}));
  }
  await page.evaluate(()=>window.MacFrogV9Dev.enter('mina'));
  await page.waitForTimeout(180);
  await page.screenshot({path:path.join(out,'v9-lacraia.png')});
  let mini;
  for(let i=0;i<11;i++){
    mini=await page.evaluate(()=>window.MacFrogV9Dev.hitMini(40));
    if(!mini.alive)break;
  }
  assert.equal(mini.alive,false,'Mini boss cannot be defeated');
  assert.equal(mini.stored,true,'Mini boss progress not saved');
  await page.evaluate(()=>window.MacFrogV9Dev.enter('torre'));
  await page.screenshot({path:path.join(out,'v9-tower.png')});
  await page.evaluate(()=>window.MacFrogV9Dev.mainBoss());
  await page.waitForTimeout(200);
  await page.screenshot({path:path.join(out,'v9-tribal-frog.png')});
  const chief=await page.evaluate(()=>window.MacFrogV9Dev.checkElasticPhase());
  assert(chief.warned&&chief.active,'Elastic second phase did not trigger: '+JSON.stringify(chief));
  await page.screenshot({path:path.join(out,'v9-elastic-attack.png')});
  if(errors.length)throw Error('Unexpected browser errors: '+errors.slice(0,8).join(' | '));
  console.log('V9_BROWSER_OK '+JSON.stringify({rooms:info.rooms,
   directions:links.length,downward,gated,shafts:shafts.length,miniBoss:'defeatable',
   screenshots:6,errors:0}));
 }catch(e){
  await page.screenshot({path:path.join(out,'FAILED-v9.png')}).catch(()=>{});
  console.error('V9_BROWSER_FAILED',e.stack||e,errors.slice(0,8));
  process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
