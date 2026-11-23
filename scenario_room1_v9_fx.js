// Mac Frog V9: non-destructive player animation polish, power feedback and debug validation.
(function installV9Effects(){
"use strict";
const v9=window.MacFrogV9State;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function sparks(x,y,color,count=4){
 for(let i=0;i<count;i++)v9.particles.push({x,y,color,size:2+Math.random()*4,
 vx:(Math.random()-.5)*170,vy:(Math.random()-.65)*210,life:.15+Math.random()*.3});
 if(v9.particles.length>110)v9.particles.splice(0,v9.particles.length-110);
}
const dmgBase=damageMac;
damageMac=function(amount,source){
 const before=mac.hp;
 dmgBase(amount,source);
 if(mac.hp<before){sparks(mac.x+mac.width/2,mac.y+mac.height/2,"#e69678",12);}
};
const hitEnemyBase=a1DamageEnemy;
a1DamageEnemy=function(e,amount){
 const prior=e.hp;hitEnemyBase(e,amount);
 if(e.hp<prior)sparks(e.x+e.w/2,e.y+e.h/2,"#a8cca0",7);
};
const dmgBossBase=damageBoss;
damageBoss=function(amount){
 const hp=boss.hp;dmgBossBase(amount);
 if(boss.hp<hp)sparks(boss.x+boss.width/2,boss.y+boss.height/2,"#e9bb82",14);
};
const animBase=drawMacSprite;
drawMacSprite=function(){
 if(!mac.dead&&(mac.activePower==="water"||mac.activePower==="wind")){
  ctx.save();
  const c=mac.activePower==="water"?"rgba(68,174,223,.20)":"rgba(159,207,145,.18)";
  const x=mac.x+mac.width/2,y=mac.y+mac.height/2;
  const g=ctx.createRadialGradient(x,y,3,x,y,62);
  g.addColorStop(0,c);g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=g;ctx.fillRect(x-62,y-62,124,124);
  ctx.restore();
 }
 animBase();
};
let wasGrounded=mac.grounded,trailTimer=0;
const updateBase=update;
update=function(dt){
 const beforeRoom=currentRoom, oldHp=mac.hp;
 updateBase(dt);
 if(mac.dead)return;
 trailTimer+=dt;
 if(!wasGrounded&&mac.grounded&&Math.abs(mac.vy)<65){
   sparks(mac.x+mac.width/2,mac.y+mac.height,"#98a28b",8);
 }
 wasGrounded=mac.grounded;
 if(trailTimer>=.075){
   trailTimer=0;
   if(mac.activePower==="water"){
     for(const bolt of waterShots.slice(0,4))sparks(bolt.x,bolt.y,"#7dcfe0",2);
   }else if(mac.activePower==="wind"){
     for(const blade of windBlades.slice(0,4))sparks(blade.x,blade.y,"#b8e6a0",2);
   }
   if(beforeRoom===1&&boss.active&&boss.state==="dash"){
     sparks(boss.x+boss.width/2,boss.y+boss.height,"#b0a882",3);
   }
 }
};
const diagnostic={
  getState:()=>({room:A1.node,mainBoss:currentRoom===1?{state:boss.state,hp:boss.hp,active:boss.active}:null,
    lacraia:v9.mini?{hp:v9.mini.hp,state:v9.mini.state,alive:v9.mini.alive}:null}),
  inspectShaft:(id=A1.node)=>{
    const r=A1.rooms[id];if(!r)throw Error("Unknown room "+id);
    const door=r.exits.find(e=>e.side==="bottom");
    const shaft=r.v9Shaft;
    return {id,height:r.height,door:door?{dest:door.dest,from:door.from,to:door.to,water:door.requiresWater}:null,
      shaft,blockingFloors:shaft?r.floors.filter(f=>f.x<shaft.x+shaft.width&&f.x+f.width>shaft.x&&f.y+f.height>=r.height):[]};
  }
};
window.MacFrogV9Diagnostics=Object.freeze(diagnostic);
// Developer helpers are hidden from normal sessions and are never called by gameplay.
if(typeof location!=="undefined"&&new URLSearchParams(location.search).get("dev")==="1"){
 window.MacFrogV9Dev=Object.freeze({
   ...diagnostic,
   enter:(id)=>{a1LoadNode(id,"left",false);return window.MacFrogV9.info();},
   testDoor:(from,to,withWater=true)=>{
     if(!A1.rooms[from]||!A1.rooms[to])throw Error("Unknown connection");
     const d=A1.rooms[from].exits.find(e=>e.dest===to);
     if(!d)throw Error("No door from "+from+" to "+to);
     mac.waterPower=!!withWater;
     a1LoadNode(from,"left",false);
     a1RoomGeometry(A1.rooms[from]);A1.transitionCooldown=0;
     const r=A1.rooms[from],middle=(d.from+d.to)/2;
     const holdUp=keys.KeyW,holdDown=keys.KeyS;
     if(d.side==="bottom"){
       mac.x=middle-mac.width/2;mac.y=r.height-112;mac.vy=200;mac.grounded=false;
     }else if(d.side==="top"){
       mac.x=middle-mac.width/2;mac.y=120;mac.vy=0;mac.grounded=false;keys.KeyW=true;
     }else{
       mac.x=d.side==="left"?0:r.width-mac.width;
       mac.y=r.height-175;mac.vy=0;
     }
     try{a1CheckTransitions(.017);}finally{keys.KeyW=holdUp;keys.KeyS=holdDown;}
     const hit={x:mac.x,y:mac.y,width:mac.width,height:mac.height},target=A1.rooms[A1.node];
     return {from,to,side:d.side,water:withWater,locked:d.requiresWater,
       arrived:A1.node,collision:solids.some(s=>rectsOverlap(s,hit)),
       inBounds:hit.x>=0&&hit.y>=0&&hit.x+hit.width<=target.width&&hit.y+hit.height<=target.height};
   },
   hitMini:(damage=35)=>{
     if(A1.node!=="mina")a1LoadNode("mina","left",false);
     const b=v9.mini;if(!b||!b.alive)return {alive:false};
     a1HitFirst({x:b.x+15,y:b.y+20,width:b.w-30,height:b.h-35},damage);
     return {hp:b.hp,alive:b.alive,stored:window.MacFrogV9.info().miniDefeated};
   },
   mainBoss:()=>{loadRoom(1,"left");mac.x=2510;boss.x=2710;boss.active=true;
     return {bossX:boss.x,hp:boss.hp,alive:boss.alive};}
 });
}
})();
