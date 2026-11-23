'use strict';
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const scripts=[
 'scenario_room1_v9.js',
 'scenario_room1_v9_visual.js',
 'scenario_room1_v9_fx.js'
];
test('V9 scripts compile and are injected into the boot pipeline in order',()=>{
 const index=read('index.html');
 let prev=index.indexOf('scenario_room1_v8_visual.js');
 for(const filename of scripts){
   const script=read(filename);
   assert(script.length>2000,'Missing implementation: '+filename);
   assert.doesNotThrow(()=>new Function(script),filename+' syntax error');
   const position=index.indexOf(filename);
   assert(position>prev,'Boot order wrong for '+filename);
   prev=position;
 }
 assert(index.includes('fxV9 +'), 'V9 FX not injected');
});
test('original animation/game and the complete V8 map are preserved',()=>{
 const old=read('game_v25.html');
 for(const symbol of ['MAC_ATLAS_META','macAtlas','aquaticAtlas','windAtlas',
   'updateMacAnimation','startTongue','startGrapple','startWindGust','fireWaterShot',
   'drawMacSprite','drawBoss']){
   assert(old.includes(symbol),'Missing legacy system '+symbol);
 }
 assert(read('scenario_room1_v8.js').includes('A1_V8_BLUEPRINTS'));
 assert(read('area1_blueprints_v8.js').includes('"mina"'));
});
test('V9 includes physically open downward shafts, insect AI and persistent miniboss',()=>{
 const core=read(scripts[0]),art=read(scripts[1]),fx=read(scripts[2]);
 for(const str of ['r.v9Shaft','a1CheckTransitions=function','a1Transition=function',
   'LACRAIA','mini.hp','saveMini','readMini','window.MacFrogV9']){
   assert(core.includes(str),'Core V9 missing '+str);
 }
 for(const str of ['a1DrawEnemy=function','a1DrawParallax=parallax','a1BuildRoomCache=function',
   'drawBoss=function','miniDraw','buildSprite']){
   assert(art.includes(str),'V9 artwork missing '+str);
 }
 for(const str of ['damageMac=function','drawMacSprite=function','MacFrogV9Dev']){
   assert(fx.includes(str),'FX hook missing '+str);
 }
});
