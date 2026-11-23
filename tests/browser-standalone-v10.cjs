'use strict';
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const filename=path.resolve(__dirname,'../dist/mac-frog-v10-jogavel.html');
 assert(fs.existsSync(filename),'Standalone HTML build is missing');
 assert(fs.statSync(filename).size>17_000_000,'Legacy game assets missing from standalone HTML');
 const url=pathToFileURL(filename).href+'?dev=1';
 const errors=[],browser=await chromium.launch({headless:true,args:['--no-sandbox','--allow-file-access-from-files']});
 const page=await browser.newPage({viewport:{width:1365,height:768}});
 page.on('pageerror',err=>errors.push(err.stack||err.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.MacFrogV10&&!!window.MacFrogV10Terrain&&!!window.MacFrogV10EnemyArt,
   null,{timeout:45000});
  await page.waitForFunction(()=>window.MacFrogV10Parallax?.ready()&&window.MacFrogV10Terrain?.motifsReady()&&window.MacFrogV10EnemyArt?.ready(),
   null,{timeout:15000});
  const v=await page.evaluate(()=>({
    v10:window.MacFrogV10.info(),
    map:window.MacFrogV9.validate(),
    art:window.MacFrogV10Art.info(),
    parallax:window.MacFrogV10Parallax.ready()
  }));
  assert.equal(v.map.ok,true,'V9 map broken in standalone file');
  assert.equal(v.art.atlases,99,'Animation strips missing from standalone');
  assert.equal(v.parallax,true);
  const init=await page.evaluate(()=>window.MacFrogV10.info());
  await page.keyboard.press('j');
  const after=await page.evaluate(()=>window.MacFrogV10.info());
  assert.equal(after.attack,'Soco direto');
  if(errors.length)throw Error('Console errors: '+errors.slice(0,5).join('\n'));
  const dir=path.resolve(__dirname,'../test-results-v10');
  fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'v10-offline-playable.png')});
  console.log('V10_OFFLINE_STANDALONE_OK',JSON.stringify({
   bytes:fs.statSync(filename).size,forms:v.v10.unlocked.length,
   animations:v.art.atlases,license:'mixed original + CC0',
   errors:errors.length
  }));
 }catch(e){
  console.error('V10_OFFLINE_STANDALONE_FAILED',e.stack||e,errors.slice(0,8));
  process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
