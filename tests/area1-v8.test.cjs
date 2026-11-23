'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const v6=read('scenario_room1_v6.js');
const start=v6.indexOf('Object.assign(A1.zoneColors'),end=v6.indexOf('function a1AssetReady');
assert(start>0&&end>start);
const prelude="\nconst window={},storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};\nconst A1={node:\"entrada\",roomHeight:900,roomCacheId:null,checkpointX:760,checkpointNode:\"hub\",previousNode:null,zoneColors:{},discovered:new Set([\"entrada\"]),transitionCooldown:0,lastWaterPower:false};\nconst mac={x:90,y:0,vx:0,vy:0,normalHeight:64,width:32,height:64,waterPower:false,windPower:false,hp:100,maxHp:100,dead:false,activePower:null};\nconst keys={},waterFly={alive:false},checkpoints=[{id:\"ruinas_inicio\",x:760,y:680}],solids=[],platforms=[],walls=[];\nlet currentCheckpointId=null,currentRoom=0,checkpointMessageTimer=0;\nconst grad={addColorStop(){}},ctx=new Proxy({createLinearGradient:()=>grad,createRadialGradient:()=>grad}, {get:(o,k)=>k in o?o[k]:()=>{}});\nconst WIDTH=1365,HEIGHT=600,camera={x:0,y:0},performance={now:()=>100},document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};\nfunction floorSeg(x,w){return{x,y:760,width:w,height:140}}\nfunction p(x,y,w,style){return{x,y,width:w,height:24,style}}\nfunction exitDef(side,dest,from,to,requiresWater){return{side,dest,from,to,requiresWater}}\nfunction snapCameraToMac(){camera.x=mac.x;camera.y=mac.y}\nfunction rectsOverlap(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y}\nfunction damageMac(n){mac.hp=Math.max(0,mac.hp-n)}\nlet a1RoomGeometry=()=>{},a1EntryPosition=()=>({x:90,y:696});\nlet a1LoadNode=function(id,dir,preserve){\n const room=A1.rooms[id];A1.previousNode=A1.node;A1.node=id;A1.discovered.add(id);\n a1RoomGeometry(room);\n if(!preserve){const p=a1EntryPosition(room,dir);mac.x=p.x;mac.y=p.y;}\n A1.roomCache=document.createElement(\"canvas\");A1.roomCache.width=room.width;\n A1.roomCache.height=A1.roomHeight;A1.roomCacheCtx=A1.roomCache.getContext(\"2d\");A1.roomCacheId=id;\n},a1ClampToRoom=()=>{},a1CheckTransitions=()=>{};\nlet a1Transition=door=>{if(A1.rooms[door.dest])a1LoadNode(door.dest,\"left\",false)};\nfunction a1CanUseExit(ex){return !ex.requiresWater||mac.waterPower}\nlet update=()=>{},saveGame=()=>{},loadSavedGame=()=>false,respawnMac=()=>{},drawHUD=()=>{};\nlet a1DrawParallax=()=>{},a1BuildRoomCache=()=>{},a1DrawWater=()=>{},a1DrawExitCue=()=>{},a1DrawBlockedExit=()=>{},a1DrawForeground=()=>{},a1DrawMap=()=>{};\n";
const suffix="\nreturn {A1,mac,keys,solids,window,storage,checkpoints,\n load:(id,dir)=>a1LoadNode(id,dir,false),\n collide:rectsOverlap,\n paint:()=>{a1DrawParallax();a1BuildRoomCache();a1DrawWater(A1.rooms[A1.node]);a1DrawForeground();drawHUD();A1.fullMapOpen=true;a1DrawMap();A1.fullMapOpen=false;}\n};\n";
function boot(){
 return new Function(prelude+v6.slice(start,end)+read('area1_blueprints_v8.js')+read('area1_connectors_v8.js')+read('scenario_room1_v8.js')+read('scenario_room1_v8_visual.js')+suffix)();
}
function reachable(rooms,power){
 const found=new Set(['entrada']),q=['entrada'];
 while(q.length){const id=q.shift();for(const d of rooms[id].exits){
  if(d.dest==='__NEXT_AREA__'||d.requiresWater&&!power||found.has(d.dest))continue;
  found.add(d.dest);q.push(d.dest);
 }}return found;
}
test('43 authored rooms, 13 tall rooms and reciprocal graph',()=>{
 const h=boot(),rs=h.A1.rooms;
 assert.equal(Object.keys(rs).length,43);
 assert.equal(Object.values(rs).filter(r=>r.height>1450).length,13);
 assert.equal(Object.values(rs).reduce((n,r)=>n+r.exits.filter(e=>e.dest!=='__NEXT_AREA__').length,0)/2,68);
 assert.equal(h.window.MacFrogV8.validate().ok,true);
});
test('ability progression is acyclic and reachable',()=>{
 const rs=boot().A1.rooms,pre=reachable(rs,false),post=reachable(rs,true);
 assert(pre.has('santuario'));assert(!pre.has('saida'));
 assert.equal(pre.size,32);assert.equal(post.size,43);
});
test('entrance spawns avoid collisions for each traversable doorway',()=>{
 const h=boot(),rs=h.A1.rooms;
 for(const [id,r] of Object.entries(rs))for(const e of r.exits){
  if(!rs[e.dest])continue;
  h.mac.waterPower=!!e.requiresWater;h.A1.node=id;h.load(e.dest,'left');
  const p={x:h.mac.x,y:h.mac.y,width:h.mac.width,height:h.mac.height};
  assert(Number.isFinite(p.x)&&Number.isFinite(p.y),id+' -> '+e.dest);
  assert(p.x>=0&&p.x+p.width<=rs[e.dest].width,id+' -> '+e.dest);
  assert(!h.solids.some(s=>h.collide(p,s)),id+' -> '+e.dest+' spawned in a solid');
 }
});
test('each room and fullscreen map render with canvas context',()=>{
 const h=boot();
 for(const id of Object.keys(h.A1.rooms)){h.load(id,'left');h.paint()}
});
test('original sprite atlases and combat mechanics remain intact',()=>{
 const s=read('game_v25.html');
 for(const k of ['MAC_ATLAS_META','macAtlas','windAtlas','waterAttackAtlas','aquaticAtlas','flyAtlas','startGrapple','startTongue','updateMacAnimation']){
  assert(s.includes(k),'missing original '+k);
 }
});
test('index.html boots V8 in the correct order and not V7',()=>{
 const s=read('index.html');
 const files=['game_v25.html','scenario_room1_v6.js','area1_blueprints_v8.js','area1_connectors_v8.js','scenario_room1_v8.js','scenario_room1_v8_visual.js'];
 let last=-1;for(const file of files){const pos=s.indexOf(file);assert(pos>last,file+' load order');last=pos;}
 assert(!s.includes('scenario_room1_v7.js'));
});
