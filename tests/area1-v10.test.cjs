'use strict';
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
test('V10 compiles and loads after V9 in a single consistent boot path',()=>{
 const idx=read('index.html');
 const a=read('scenario_room1_v10.js'),b=read('scenario_room1_v10_visual.js'),terrain=read('scenario_room1_v10_terrain.js');
 assert.doesNotThrow(()=>new Function(a));
 assert.doesNotThrow(()=>new Function(b));
 assert.doesNotThrow(()=>new Function(terrain));
 assert(a.length>10000&&b.length>8000&&terrain.length>10000);
 assert(idx.indexOf("scenario_room1_v9_fx.js")<idx.indexOf("scenario_room1_v10.js"));
 assert(idx.indexOf("scenario_room1_v10.js")<idx.indexOf("scenario_room1_v10_visual.js"));
 assert(idx.includes("+ coreV10 + '\\n\\n' + artV10 +"));
 assert(idx.includes("+ artV10 + '\\n\\n' + terrainV10 +"));
});
test('the original V9, V8 and 17MB legacy game are preserved',()=>{
 for(const f of ['scenario_room1_v9.js','scenario_room1_v9_visual.js','scenario_room1_v9_fx.js',
 'scenario_room1_v9_backdrop.js','scenario_room1_v8.js','area1_blueprints_v8.js','game_v25.html']){
  assert(fs.existsSync(path.join(root,f)),f);
 }
 assert(read('game_v25.html').length>17000000);
});
test('V10 provides four unique base strikes and eight essence transformations',()=>{
 const s=read('scenario_room1_v10.js');
 for(const name of ['Soco direto','Soco cruzado','Chute giratório','Chute finalizador'])assert(s.includes(name),name);
 for(const form of ['water','wind','poison','tree','glass','colossal','ice','shadow'])
   assert(s.includes(form+':{title:'),'Missing playable essence: '+form);
 for(const cmd of ['KeyJ','KeyK','KeyL','KeyU','KeyT','KeyQ'])assert(s.includes(cmd),'Missing input '+cmd);
 for(const ability of ['jet','whirlpool','tidal','blade','dash','cyclone','venom','cloud','garden',
  'leap','whip','canopy','prism','veil','mirror','bite','slam','quake','shard','frost','winter',
  'shade','echo','eclipse'])assert(s.includes('case "'+ability+'":'),'Missing logic: '+ability);
});
test('V10 builds animated per-form, per-state low-resolution strips and avoids networked assets',()=>{
 const s=read('scenario_room1_v10_visual.js');
 for(const id of ['base','water','wind','poison','tree','glass','colossal','ice','shadow'])assert(s.includes(id));
 assert(s.includes('const W=72,H=88,FRAMES=8'));
 assert(s.includes('for(const form of initialForms)for(const action of states)get(form,action)'));
 assert(s.includes('drawMacSprite=function()'));
 assert(!s.includes('dead-cells.png'));
});
test('world art uses material-specific, cached pixel tiles without changing collision geometry',()=>{
 const s=read('scenario_room1_v10_terrain.js');
 for(const key of ['mangue','raizes','cripta','abismo','ruinas','aqueduto','templo'])assert(s.includes(key));
 for(const mat of ['wood','shrine','moss','stone'])assert(s.includes(mat));
 assert(s.includes('a1BuildRoomCache=function()'));
 assert(s.includes('roomCacheDirty=false'));
 assert(!s.includes('solids.push('),'visual pass must not mutate collision shapes');
});
