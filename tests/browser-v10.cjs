'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const out=path.join(__dirname,'..','test-results-v10');fs.mkdirSync(out,{recursive:true});
 const errors=[],browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1365,height:768},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const shoot=async name=>page.screenshot({path:path.join(out,name+'.png')});
 try{
  await page.goto('http://127.0.0.1:8765/?dev=1&version=10',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!(window.MacFrogV10&&window.MacFrogV10Dev&&window.MacFrogV10Art),null,{timeout:60000});
  await page.waitForTimeout(350);
  const original=await page.evaluate(()=>window.MacFrogV10.info());
  assert.equal(original.version,'10.0-alpha');
  assert.equal(original.form,'base');
  assert.equal((await page.evaluate(()=>window.MacFrogV10.validate())).ok,true);
  const meta=await page.evaluate(()=>window.MacFrogV10Art.info());
  assert.equal(meta.atlases,72,'Nine forms * eight states must be rendered');
  assert.deepEqual(meta.size,[72,88]);
  assert.equal(meta.frames,8);
  const forms=await page.evaluate(()=>window.MacFrogV10.registry());
  assert.equal(forms.length,9);
  for(const form of forms.filter(f=>f.id!=='base')){
    assert.equal(form.specials.length,2,form.id+' specials');
    assert(form.ultimate&&form.passive,'Missing ultimate/passive '+form.id);
  }
  await shoot('v10-base');
  await page.keyboard.press('j');
  const first=await page.evaluate(()=>window.MacFrogV10.info());
  assert.equal(first.attack,'Soco direto','First punch not mapped to J');
  await page.waitForTimeout(400);
  const reset=await page.evaluate(()=>window.MacFrogV10.info());
  assert.equal(reset.attack,null,'Combo does not finish');
  // Real keyboard input for every transformation. One complete special and ultimate
  // cycle is checked per form, not only data registration.
  const ids=forms.filter(f=>f.id!=='base').map(f=>f.id);
  for(const id of ids){
    const granted=await page.evaluate(key=>window.MacFrogV10Dev.grant(key),id);
    assert.equal(granted,true,'Fly Essence unlock failed for '+id);
    await page.evaluate(key=>window.MacFrogV10Dev.select(key),id);
    await page.keyboard.press('t');
    await page.waitForFunction(key=>window.MacFrogV10.info().form===key,id,{timeout:3000});
    const selection=await page.evaluate(()=>window.MacFrogV10.info());
    assert.equal(selection.form,id,'Transformation could not be entered');
    await page.evaluate(()=>window.MacFrogV10Dev.setEnergy(100));
    await page.keyboard.press('k');
    await page.waitForTimeout(520);
    const attack1=await page.evaluate(()=>window.MacFrogV10.info());
    assert.equal(attack1.stats.abilities>=1,true,'Special 1 never executed '+id);
    await page.waitForTimeout(260);
    await page.evaluate(()=>window.MacFrogV10Dev.setEnergy(100));
    await page.keyboard.press('l');
    await page.waitForTimeout(620);
    await page.waitForTimeout(300);
    await page.evaluate(()=>window.MacFrogV10Dev.setEnergy(100));
    const beforeUltimate=await page.evaluate(()=>window.MacFrogV10.info().stats.abilities);
    await page.keyboard.press('u');
    await page.waitForTimeout(490);
    const final=await page.evaluate(()=>window.MacFrogV10.info());
    assert(final.energy<8,'Ultimate did not consume its resource '+JSON.stringify({id,energy:final.energy}));
    assert(final.stats.abilities>=beforeUltimate+1,'Ultimate action was not executed '+id);
    if(id==='water'||id==='wind'||id==='colossal'||id==='shadow')await shoot('v10-'+id);
    await page.waitForTimeout(900);
    await page.keyboard.press('t');
    await page.waitForFunction(()=>window.MacFrogV10.info().form==='base',null,{timeout:3000});
  }
  const done=await page.evaluate(()=>window.MacFrogV10.info());
  assert.equal(done.unlocked.length,9);
  assert(done.stats.abilities>=24,'Eight forms must execute both specials and ultimate');
  // Persistence across a new browser document must not unlock powers in advance.
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.MacFrogV10,null,{timeout:60000});
  const reloaded=await page.evaluate(()=>window.MacFrogV10.info());
  assert.equal(reloaded.unlocked.length,9,'Essences are not persisted');
  assert.equal(reloaded.form,'base','Transforms should start safely after reload');
  assert.equal((await page.evaluate(()=>window.MacFrogV9.validate())).ok,true,'V9 graph broken');
  if(errors.length)throw Error('Browser errors: '+errors.slice(0,6).join(' | '));
  console.log('V10_BROWSER_OK',JSON.stringify({forms:ids.length,atlases:meta.atlases,frames:meta.frames,
   abilities:done.stats.abilities,unlocked:done.unlocked.length,screenshots:6,errors:errors.length}));
 }catch(e){
  await shoot('FAILED-v10').catch(()=>{});
  console.error('V10_BROWSER_FAILED',e.stack||e,errors.slice(0,8));process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});