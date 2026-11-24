// MAC FROG V9: authored-world repair, physical down-shafts and creature behaviours.
// Installed after V8. Legacy atlases, physics and attacks remain untouched.
(function installMacFrogV9(){
"use strict";
const rooms=A1.rooms, TILE=96, storageKey="mac_frog_v9_boss";
const V9={version:"9.0",time:0,particles:[],fade:0,transition:null,mini:null,kills:0};
window.MacFrogV9State=V9;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const overlap=(a,b)=>a&&b&&
 a.x<b.x+(b.width??b.w)&&a.x+(a.width??a.w)>b.x&&
 a.y<b.y+(b.height??b.h)&&a.y+(a.height??a.h)>b.y;
function readMini(){
 try{return localStorage.getItem(storageKey)==="defeated";}catch(_){return false;}
}
function saveMini(){
 try{localStorage.setItem(storageKey,"defeated");}catch(_){}
}
function emit(x,y,color,n=8){
 for(let i=0;i<n;i++)V9.particles.push({x,y,vx:(Math.random()-.5)*230,vy:-65-Math.random()*220,
 life:.25+Math.random()*.35,size:2+Math.random()*4,color});
 if(V9.particles.length>110)V9.particles.splice(0,V9.particles.length-110);
}
const hasBottom = r=>r.exits.some(e=>e.side==="bottom");
const hasTop = r=>r.exits.some(e=>e.side==="top");
const pitRooms=new Set(["poco","abismo","fossa","lago","reservatorio","aqueduto","canal_alto","cripta","ruina","mina"]);
const groundRooms=new Set(["entrada","cais","celas","estacao","hub","claustro","galeria","bombas","eclusa","altar","raiz","patio","observatorio","coro","saida","santuario"]);
for(const [id,r] of Object.entries(rooms)){
 r.v9Theme=({red:"mangue",green:"raizes",purple:"cripta",deep:"abismo",blue:"ruinas",teal:"aqueduto",gold:"templo"})[r.zone]||"ruinas";
 r.v9Seed=[...id].reduce((n,c)=>n*29+c.charCodeAt(0),17)>>>0;
 r.v9Shaft=null;
 // Most rooms get continuous navigable floors. Real pits remain in selected hazard rooms.
 const bottom=hasBottom(r);
 if(bottom){
   const left=r.width-455, right=r.width-34;
   r.v9Shaft={x:left,width:right-left,y:r.height-TILE};
   // Replace loose holes with one intentional, visibly framed downward shaft.
   r.floors=[{x:0,y:r.height-TILE,width:left,height:TILE},{x:right,y:r.height-TILE,width:r.width-right,height:TILE}];
   // Clear accidental solid ceilings/steps covering the actual opening.
   r.platforms=r.platforms.filter(p=>!(p.x<right&&p.x+p.width>left&&p.y>r.height-480));
   r.walls=r.walls.filter(w=>!(w.x<right&&w.x+w.width>left&&w.y+w.height>r.height-480));
   // Return ledge immediately to the left of the opening.
   r.platforms.push({x:left-165,y:r.height-216,width:160,height:26,style:"wood"});
   for(const e of r.exits)if(e.side==="bottom"){e.from=left+25;e.to=right-15;}
 }else if(groundRooms.has(id) || !pitRooms.has(id)&&!r.water.length){
   r.floors=[{x:0,y:r.height-TILE,width:r.width,height:TILE}];
 }
 // Repurpose floor obstacles as geological details; only key rooms get dangerous chasms.
 if(id==="mina"){
   r.platforms.push({x:300,y:r.height-265,width:350,height:28,style:"stone"});
   r.platforms.push({x:790,y:r.height-265,width:370,height:28,style:"moss"});
 }
 if(id==="saida"){
   r.platforms.push({x:320,y:r.height-240,width:330,height:28,style:"shrine"});
 }
}
const baseLoad=a1LoadNode, baseTransition=a1Transition, baseCheck=a1CheckTransitions;
a1LoadNode=function(id,side,preserve){
 baseLoad(id,side,preserve);
 V9.transition=null;
 V9.mini=(id==="mina"&&!readMini())?{
  hp:340,maxHp:340,x:Math.floor(rooms[id].width*.58),y:rooms[id].height-230,
  w:185,h:90,alive:true,state:"idle",timer:1.2,phase:1,dir:-1,flash:0,hitOnce:false
 }:null;
 for(const [i,e] of A1.enemies.entries()){
   // Convert three legacy archetypes into distinct original insect silhouettes.
   e.role=e.type==="ghost"?"mosca":e.type==="thing"?"besouro":"larva";
   e.phase=(i*1.8+rooms[id].v9Seed%11);
   if(e.role==="mosca"){e.type="ghost";e.speed=65;e.damage=9;}
   else if(e.role==="besouro"){e.type="thing";e.speed=43;e.damage=15;e.hp=105;e.maxHp=105;}
   else{e.type="spider";e.speed=57;e.damage=8;}
 }
};
function spawnFree(r,x,y){
  return x>=12&&y>=0&&x+mac.width<=r.width-12&&y+mac.height<=r.height-8&&
    !solids.some(a=>overlap({x,y,width:mac.width,height:mac.height},a));
}
function settleArrival(r,x,y){
  // Prioritize the actual doorway; avoid spawning beneath a ledge or inside masonry.
  const offsets=[0,-45,45,-90,90,-145,145,-220,220];
  const heights=[y,8,22,42,74,120,180,255,Math.max(12,r.height-350)];
  for(const yy of heights)for(const dx of offsets){
    const xx=clamp(x+dx,14,r.width-mac.width-14);
    if(spawnFree(r,xx,yy))return {x:xx,y:yy};
  }
  return null;
}
a1Transition=function(door){
 if(!door)return;
 const from=A1.node,vy=mac.vy;
 baseTransition(door);
 if(from!==A1.node){
   V9.transition={from,to:A1.node,side:door.side};
   V9.fade=.22;
   emit(mac.x+mac.width/2,mac.y+mac.height, "#a9bd97",9);
   if(door.side==="bottom"){
     const r=rooms[A1.node],back=r&&r.exits.find(e=>e.dest===from&&e.side==="top");
     if(back){
       mac.x=clamp((back.from+back.to)/2-mac.width/2,25,r.width-mac.width-25);
       mac.y=8;mac.vy=Math.max(100,Math.min(500,vy));mac.grounded=false;
       snapCameraToMac();
     }
   }else if(door.side==="top"){
     const r=rooms[A1.node],shaft=r&&r.v9Shaft;
     if(shaft){
       mac.x=shaft.x-155;mac.y=r.height-335;mac.vy=0;mac.grounded=false;
       snapCameraToMac();
     }
   }
   // Original V8 arrival math may overlap hand-placed stone tiles.
   const targetRoom=rooms[A1.node];
   if(targetRoom){
     const fixed=settleArrival(targetRoom,mac.x,mac.y);
     if(fixed){mac.x=fixed.x;mac.y=fixed.y;}
     else console.warn("V9 no safe spawn near entrance",from,A1.node);
     snapCameraToMac();
   }
 }
};
a1CheckTransitions=function(dt){
 if(currentRoom!==0||A1.fullMapOpen)return baseCheck(dt);
 const r=rooms[A1.node],cx=mac.x+mac.width/2,foot=mac.y+mac.height;
 const down=r.exits.find(e=>e.side==="bottom");
 if(down&&A1.transitionCooldown<=0&&r.v9Shaft&&
    cx>=down.from&&cx<=down.to&&foot>=r.height-64&&mac.vy>=0){
    if(a1CanUseExit(down)){a1Transition(down);return;}
 }
 // Old V8 transitions used 'S on solid floor'; V9 requires a physical drop.
 const keyS=keys.KeyS,keyDown=keys.ArrowDown;
 keys.KeyS=false;keys.ArrowDown=false;
 try{baseCheck(dt);}finally{keys.KeyS=keyS;keys.ArrowDown=keyDown;}
};
const oldHit=a1HitFirst;
a1HitFirst=function(box,damage){
 const mini=V9.mini;
 if(currentRoom===0&&A1.node==="mina"&&mini&&mini.alive&&overlap(box,mini)){
   mini.hp=Math.max(0,mini.hp-damage);mini.flash=.12;
   emit(clamp(box.x,mini.x,mini.x+mini.w),mini.y+mini.h*.44,"#9ee5be",5);
   if(mini.hp===0){
     mini.alive=false;mini.state="dead";V9.kills++;saveMini();
     // A real, immediately useful first-clear reward for defeating the miniboss.
     mac.hp=Math.min(mac.maxHp,mac.hp+35);
     V9.rewardNotice={text:"LACRAIA DERROTADA  •  +35 VIDA",life:3.2};
     emit(mini.x+mini.w/2,mini.y+mini.h/2,"#9ee4ca",38);
     V9.fade=.30;
   } else if(mini.hp<mini.maxHp*.50)mini.phase=2;
   return true;
 }
 return oldHit(box,damage);
};
const oldEnemies=a1UpdateEnemies;
a1UpdateEnemies=function(dt){
 oldEnemies(dt);
 if(currentRoom!==0||A1.fullMapOpen)return;
 const room=rooms[A1.node];
 for(const e of A1.enemies){
   if(!e.alive)continue;
   if(e.role==="mosca"){
     // Flight keeps the classic chase, but never crosses the chamber boundary.
     e.x=clamp(e.x,30,room.width-e.w-30);
     e.y=clamp(e.y+Math.sin(V9.time*9+e.phase)*20*dt,30,room.height-e.h-80);
   }else if(e.role==="besouro"){
     const near=Math.abs((mac.x+mac.width/2)-(e.x+e.w/2))<220;
     // Patrol boundaries follow the support platform, not the entire world.
     if(near&&Math.abs(mac.y-e.y)<110){
       e.x=clamp(e.x+e.dir*36*dt,e.min,Math.max(e.min,e.max-e.w));
     }
     if(e.x<=e.min)e.dir=1;
     if(e.x+e.w>=e.max)e.dir=-1;
   }else if(e.role==="larva"){
     // The larva's undulation is animated by its sprite, not by bypassing
     // collision or adding unsupervised sideways movement.
     e.x=clamp(e.x,e.min,Math.max(e.min,e.max-e.w));
   }
 }
};
const baseUpdate=update;
function updateMini(dt){
 const b=V9.mini;if(!b||!b.alive||mac.dead)return;
 b.flash=Math.max(0,b.flash-dt);
 const close=Math.abs(mac.x+mac.width/2-(b.x+b.w/2))<650;
 if(!close&&b.state==="idle")return;
 b.timer-=dt;
 const direction=mac.x<b.x?-1:1;
 const speed=b.phase===2?2.0:1.0;
 if(b.state==="idle"&&b.timer<=0){
   b.dir=direction;b.hitOnce=false;b.attackIndex=(b.attackIndex||0)+1;
   // Predictable but varied: a telegraphed ground slam alternates with charges.
   const slam=b.phase===2 ? b.attackIndex%2===0 : b.attackIndex%3===0;
   b.state=slam?"slamWarn":"warn";b.timer=(slam?.85:.72)/speed;
 }else if(b.state==="warn"&&b.timer<=0){
   b.state="charge";b.timer=.48;b.hitOnce=false;
 }else if(b.state==="slamWarn"&&b.timer<=0){
   b.state="slam";b.timer=.24;b.hitOnce=false;
   emit(b.x+b.w/2,b.y+b.h,"#a0d1a9",16);
 }else if(b.state==="slam"){
   // Short-range shockwave: entirely avoidable by leaving the marked zone.
   const area={x:b.x-88,y:b.y+5,width:b.w+176,height:b.h+55};
   if(!b.hitOnce&&overlap(area,{x:mac.x,y:mac.y,width:mac.width,height:mac.height})){
     damageMac(b.phase===2?19:13,b.x+b.w/2);b.hitOnce=true;
   }
   if(b.timer<=0){b.state="recover";b.timer=.85/speed;}
 }else if(b.state==="charge"){
   const r=rooms[A1.node];
   b.x=clamp(b.x+b.dir*(b.phase===2?490:365)*dt,72,r.width-b.w-72);
   // Hitbox includes the head and middle segments, once per attack.
   if(!b.hitOnce&&overlap(b,{x:mac.x,y:mac.y,width:mac.width,height:mac.height})){
     damageMac(b.phase===2?21:16,b.x+b.w/2);b.hitOnce=true;
   }
   if(b.timer<=0){b.state="recover";b.timer=.82/speed;}
 }else if(b.state==="recover"&&b.timer<=0){b.state="idle";b.timer=.70/speed;}
 const supporting=rooms[A1.node].floors.concat(rooms[A1.node].platforms)
  .filter(p=>p.x<b.x+b.w&&p.x+p.width>b.x&&p.y>=b.y+b.h-10)
  .sort((a,c)=>a.y-c.y)[0];
 if(supporting)b.y=supporting.y-b.h;
}
update=function(dt){
 const prevNode=A1.node;
 baseUpdate(dt);
 if(A1.fullMapOpen||mac.dead)return;
 V9.time+=dt;
 if(currentRoom===0)updateMini(dt);
 if(prevNode!==A1.node)V9.fade=.21;
 V9.fade=Math.max(0,V9.fade-dt);
 if(V9.rewardNotice)V9.rewardNotice.life=Math.max(0,V9.rewardNotice.life-dt);
 for(let i=V9.particles.length-1;i>=0;i--){
   const p=V9.particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=450*dt;
   if(p.life<=0)V9.particles.splice(i,1);
 }
};
// Preserve the old tribal frog boss mechanics while adding an actual second-phase attack.
const bossUpdateV8=updateBoss;
boss.v9TongueCooldown=2.2;
updateBoss=function(dt){
 if(currentRoom!==1||!boss.alive||boss.defeated)return bossUpdateV8(dt);
 if(boss.state==="v9TongueWarn"||boss.state==="v9Tongue"){
   boss.stateTimer-=dt;
   boss.hurtTimer=Math.max(0,boss.hurtTimer-dt);
   if(boss.state==="v9TongueWarn"&&boss.stateTimer<=0){
     boss.state="v9Tongue";boss.stateTimer=.28;boss.hitMacThisAttack=false;
   }
   if(boss.state==="v9Tongue"){
     const hit={x:boss.facing===1?boss.x+boss.width:boss.x-350,
       y:boss.y+28,width:350,height:24};
     if(!boss.hitMacThisAttack&&overlap(hit,{x:mac.x,y:mac.y,width:mac.width,height:mac.height})){
       damageMac(17,boss.x+boss.width/2);boss.hitMacThisAttack=true;
     }
     if(boss.stateTimer<=0){boss.state="recover";boss.stateTimer=.55;}
   }
   return;
 }
 bossUpdateV8(dt);
 if(boss.active&&boss.hp<boss.maxHp*.55&&boss.state==="idle"){
   boss.v9TongueCooldown-=dt;
   if(boss.v9TongueCooldown<=0){
     boss.facing=mac.x<boss.x?-1:1;
     boss.state="v9TongueWarn";boss.stateTimer=.52;boss.v9TongueCooldown=2.8;
   }
 }
};
window.MacFrogV9=Object.freeze({
 info:()=>({version:V9.version,room:A1.node,rooms:Object.keys(rooms).length,
  shafts:Object.values(rooms).filter(r=>!!r.v9Shaft).length,mini:V9.mini&&{hp:V9.mini.hp,state:V9.mini.state},
  miniDefeated:readMini(),reward:V9.rewardNotice?.life>0?V9.rewardNotice.text:null,
  player:{x:mac.x,y:mac.y}}),
 validate:()=>{
  const issues=[];
  for(const [id,r] of Object.entries(rooms)){
   for(const ex of r.exits){
    if(ex.dest==="__NEXT_AREA__")continue;
    if(!rooms[ex.dest]?.exits.some(back=>back.dest===id))issues.push(id+"->"+ex.dest);
    if(ex.side==="bottom"){
      if(!r.v9Shaft)issues.push("missing down shaft "+id);
      else if(r.floors.some(f=>f.y<=r.height-TILE&&f.y+f.height>=r.height-1&&
        f.x<ex.to&&f.x+f.width>ex.from))issues.push("shaft blocked "+id);
    }
   }
  }
  return {ok:issues.length===0,issues};
 }
});
// The V8 last load ran before this module. Reapply the updated geometry.
a1LoadNode("entrada","left",false);
})();
