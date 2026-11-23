// MAC FROG V10 — Metamorphosis foundation.
// Gameplay-driven combos, Essence Flies, distinct form abilities and safe legacy integration.
// This module loads last, AFTER the V9 FX wrappers. Does not remove any old assets.
(function installMetamorphosisV10(){
"use strict";
const VERSION="10.0-alpha", SAVE="mac_frog_v10_essences";
const TYPES={
  base:{title:"Mac",frog:"Sapo de Mac",color:"#80ac7a",accent:"#d4c28c",passive:"Versatilidade",
    combo:[{name:"Soco direto",damage:12,reach:70,time:.25,hit:[.075,.17],kick:false},
      {name:"Soco cruzado",damage:16,reach:80,time:.31,hit:[.11,.22],kick:false},
      {name:"Chute giratório",damage:22,reach:104,time:.40,hit:[.15,.28],kick:true},
      {name:"Chute finalizador",damage:29,reach:118,time:.49,hit:[.19,.34],kick:true}]},
  water:{title:"Guardião das Marés",frog:"Rã aquática",color:"#58b6ba",accent:"#c0eae3",passive:"Pele Hidrodinâmica",
    specials:[{id:"jet",label:"Jato Pressurizado",energy:17,time:.41},
      {id:"whirlpool",label:"Redemoinho",energy:26,time:.62}],
    ultimate:{id:"tidal",label:"Maré Ancestral",energy:100,time:1.10},progress:"santuario",anchor:"aquatic"},
  wind:{title:"Rã Planadora",frog:"Rhacophorus",color:"#a6c475",accent:"#eff5bb",passive:"Corpo Leve",
    specials:[{id:"blade",label:"Lâmina de Vento",energy:17,time:.38},
      {id:"dash",label:"Impulso Celeste",energy:24,time:.50}],
    ultimate:{id:"cyclone",label:"Tempestade Anfíbia",energy:100,time:1.05},progress:"torre",anchor:"aerial"},
  poison:{title:"Dendrobata",frog:"Dendrobatidae",color:"#e4a64f",accent:"#f1e26a",passive:"Secreção Defensiva",
    specials:[{id:"venom",label:"Cuspe Venenoso",energy:17,time:.42},
      {id:"cloud",label:"Nuvem Tóxica",energy:26,time:.65}],
    ultimate:{id:"garden",label:"Jardim da Toxina",energy:100,time:1.15},progress:"fossa",anchor:"toxic"},
  tree:{title:"Caçador das Copas",frog:"Rã arborícola",color:"#70b981",accent:"#d5eeb8",passive:"Aderência",
    specials:[{id:"leap",label:"Salto Predador",energy:18,time:.49},
      {id:"whip",label:"Chicote de Língua",energy:22,time:.53}],
    ultimate:{id:"canopy",label:"Caçador das Copas",energy:100,time:1.02},progress:"arvore",anchor:"tree"},
  glass:{title:"Rã-de-Vidro",frog:"Centrolenidae",color:"#a0e1c7",accent:"#f4fbeb",passive:"Camuflagem",
    specials:[{id:"prism",label:"Reflexo Prismático",energy:16,time:.44},
      {id:"veil",label:"Véu Transparente",energy:30,time:.65}],
    ultimate:{id:"mirror",label:"Espelho Vivo",energy:100,time:1.12},progress:"arquivo",anchor:"crystal"},
  colossal:{title:"Sapo-Cornudo",frog:"Ceratophrys",color:"#ae915a",accent:"#f6d7a1",passive:"Resistência Bruta",
    specials:[{id:"bite",label:"Mordida Colossal",energy:19,time:.56},
      {id:"slam",label:"Esmagamento",energy:26,time:.70}],
    ultimate:{id:"quake",label:"Terremoto Primitivo",energy:100,time:1.20},progress:"mina",anchor:"stone"},
  ice:{title:"Rã da Geada",frog:"Lithobates sylvaticus",color:"#82b7db",accent:"#e2f3ff",passive:"Tolerância ao Frio",
    specials:[{id:"shard",label:"Estilhaço Gelado",energy:17,time:.40},
      {id:"frost",label:"Barreira de Geada",energy:25,time:.58}],
    ultimate:{id:"winter",label:"Inverno Profundo",energy:100,time:1.15},progress:"farol",anchor:"ice"},
  shadow:{title:"Sapo da Noite",frog:"Anfíbios noturnos",color:"#a18fc5",accent:"#d2c6f1",passive:"Instinto Noturno",
    specials:[{id:"shade",label:"Investida Sombria",energy:18,time:.40},
      {id:"echo",label:"Eco Noturno",energy:25,time:.62}],
    ultimate:{id:"eclipse",label:"Eclipse Anfíbio",energy:100,time:1.12},progress:"cripta",anchor:"shadow"}
};
const ids=Object.keys(TYPES), formKeys=ids.filter(id=>id!=="base");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), overlap=(a,b)=>!!a&&!!b&&a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const valid=()=>!mac.dead && !A1.fullMapOpen && (currentRoom===0||currentRoom===1);
function read(){
 try {
  const s=JSON.parse(localStorage.getItem(SAVE)||"null");
  if(s?.version!==10)return null;
  const unlocks=Array.isArray(s.unlocked)?s.unlocked.filter(i=>!!TYPES[i]):[];
  return {unlocked:["base",...unlocks],selected:TYPES[s.selected]?s.selected:"base",energy:Number(s.energy)};
 }catch(_){return null;}
}
const stored=read();
const state={
  version:VERSION, selected:"base", form:"base", unlocked:new Set(stored?.unlocked||["base"]),
  energy:clamp(Number.isFinite(stored?.energy)?stored.energy:100,0,100),
  formTimer:0,attack:null,queue:false,comboIndex:-1,comboGrace:0,transformTimer:0,
  fx:[],projectiles:[],zones:[],flies:[],time:0,invulnerable:0,
  stats:{combos:0,damageEvents:0,captures:0,abilities:0},message:null
};
state.selected=state.unlocked.has(stored?.selected)?stored.selected:"base";
function persist(){
 try {localStorage.setItem(SAVE,JSON.stringify({version:10,selected:state.selected,unlocked:[...state.unlocked],energy:state.energy}));}
 catch(_){}
}
function message(text){state.message={text,life:2.5};}
function vfx(x,y,color,n=6){
 for(let i=0;i<n;i++){
  if(state.fx.length>=100)state.fx.shift();
  const a=Math.PI*2*i/n;
  state.fx.push({x,y,vx:Math.cos(a)*(65+i*17),vy:Math.sin(a)*(45+i*11),life:.24+(i%4)*.08,color,size:2+i%4});
 }
}
function unlock(id,notify=true){
 if(!TYPES[id]||id==="base"||state.unlocked.has(id))return false;
 state.unlocked.add(id);state.energy=Math.min(100,state.energy+35);
 state.selected=id;state.stats.captures++;
 if(notify)message("ESSÊNCIA OBTIDA: "+TYPES[id].title.toUpperCase());
 persist();return true;
}
function flyPosition(room){
 const width=room.width,height=room.height;
 const viable=(room.platforms||[]).filter(p=>p.width>115&&p.y>260&&p.y<height-125).sort((a,b)=>b.width-a.width);
 const floor=(room.floors||[]).find(f=>f.width>350);
 const support=viable[0]||floor;
 if(support)return {x:clamp(support.x+Math.min(support.width*.55,280),100,width-100),y:clamp(support.y-110,160,height-165)};
 return {x:clamp(width*.5,100,width-100),y:Math.max(170,height-340)};
}
function spawnFlies(){
 state.flies=[];
 if(currentRoom!==0)return;
 const room=A1.rooms[A1.node];if(!room)return;
 for(const id of formKeys){
  if(TYPES[id].progress!==A1.node||state.unlocked.has(id))continue;
  // Do not require an unavailable essence to obtain itself.
  if(id==="colossal"&&window.MacFrogV9?.info().miniDefeated===false)continue;
  const p=flyPosition(room);
  state.flies.push({id,x:p.x,y:p.y,baseY:p.y,radius:18,phase:ids.indexOf(id)*.8});
 }
}
let lastNode=A1.node,lastRoom=currentRoom;
function flyHit(f){
 if(!tongue.active)return false;
 const hit={x:f.x-18,y:f.y-18,width:36,height:36};
 if(typeof getTongueHitbox==="function"){
  const th=getTongueHitbox();
  if(th&&overlap(hit,th))return true;
 }
 // Input-friendly swept tongue pickup: small vertical grace and realistic
 // reach prevents low-FPS missed frames while still requiring a tongue action.
 const origin=typeof getTongueOrigin==="function"?getTongueOrigin():
   {x:mac.x+mac.width/2,y:mac.y+mac.height*.43};
 const dx=f.x-origin.x,dy=f.y-origin.y;
 return Math.abs(dx)<186 && Math.abs(dy)<73 &&
   (mac.facing<0?dx<=22:dx>=-22);
}
const comboBase=TYPES.base.combo;
function transformedCombo(id,index){
 const main=TYPES[id],base=comboBase[index];
 const heavy=id==="colossal",fast=id==="shadow"||id==="wind";
 return {...base,name:main.title+" — "+base.name,
   damage:Math.round(base.damage*(heavy?1.32:fast?.92:1.12)),
   time:base.time*(heavy?1.24:fast?.87:1),
   reach:base.reach+(id==="tree"?44:id==="colossal"?22:8),
   theme:main.color};
}
function startAttack(data,type="combo",index=-1){
 if(!valid())return false;
 state.attack={...data,type,index,elapsed:0,didHit:false,fired:false};
 state.queue=false;
 state.comboIndex=index;
 state.comboGrace=0;
 return true;
}
function combo(){
 if(!valid()||state.transformTimer>0)return false;
 if(state.attack){
  if(state.attack.type==="combo"&&state.attack.elapsed>state.attack.time*.45){
    state.queue=true;return true;
  }
  return false;
 }
 const i=state.comboGrace>0?(state.comboIndex+1)%4:0;
 return startAttack(state.form==="base"?{...comboBase[i]}:transformedCombo(state.form,i),"combo",i);
}
function cost(value){
 if(state.energy+1e-6<value){message("ENERGIA INSUFICIENTE");return false;}
 state.energy=clamp(state.energy-value,0,100);persist();return true;
}
function special(index){
 if(!valid()||state.form==="base"||state.attack||state.transformTimer>0)return false;
 const form=TYPES[state.form],data=index===2?form.ultimate:form.specials[index];
 if(!data)return false;
 if(!cost(data.energy))return false;
 return startAttack({...data,color:form.color},index===2?"ultimate":"special",-1);
}
function toggle(){
 if(!valid()||state.attack||state.transformTimer>0)return false;
 if(state.form==="base"){
  if(!state.unlocked.has(state.selected)||state.selected==="base"){message("ENGULA UMA MOSCA DE ESSÊNCIA");return false;}
  state.transformTimer=.42;state.nextForm=state.selected;
 }else{
  state.transformTimer=.30;state.nextForm="base";
 }
 vfx(mac.x+mac.width/2,mac.y+mac.height/2,TYPES[state.nextForm].color,14);
 return true;
}
function selectNext(){
 if(!valid()||state.form!=="base")return false;
 const unlocked=formKeys.filter(x=>state.unlocked.has(x));
 if(!unlocked.length){message("ENCONTRE UMA MOSCA DE ESSÊNCIA");return false;}
 const i=unlocked.indexOf(state.selected);
 state.selected=unlocked[(i+1)%unlocked.length];message(TYPES[state.selected].title);
 persist();return true;
}
// New inputs intentionally avoid the original main attack controls.
const controls={KeyJ:()=>combo(),KeyK:()=>special(0),KeyL:()=>special(1),
 KeyU:()=>special(2),KeyT:()=>toggle(),KeyQ:()=>selectNext()};
function onKey(e){
 if(e.repeat||!controls[e.code]||!valid())return;
 const handled=controls[e.code]();
 if(handled)e.preventDefault();
}
window.addEventListener("keydown",onKey,{passive:false});
function hurtAt(box,damage,kind){
 if(!box)return false;
 const fromCount=state.stats.damageEvents;
 if(currentRoom===0){
  // Existing V9 a1HitFirst also handles the Lacraia mini-boss.
  const hit=a1HitFirst(box,damage);
  if(hit)state.stats.damageEvents++;
  return hit;
 }
 if(currentRoom===1&&boss.alive&&boss.active&&!boss.defeated){
  const b={x:boss.x,y:boss.y,width:boss.width,height:boss.height};
  if(overlap(box,b)){damageBoss(damage);state.stats.damageEvents++;return true;}
 }
 return fromCount<state.stats.damageEvents;
}
function attackBox(reach=84,height=64){
 const face=mac.facing<0?-1:1;
 return {x:face===1?mac.x+mac.width-10:mac.x-reach+10,
 y:mac.y+Math.max(0,mac.height*.25),width:reach,height};
}
function fireProjectile(kind,power,speed,life=1.2){
 const face=mac.facing<0?-1:1,py=mac.y+mac.height*.43;
 state.projectiles.push({kind,x:mac.x+mac.width/2+face*36,y:py,vx:face*speed,
  vy:kind==="leap"?-100:0,life,power,width:kind==="tidal"?140:40,height:kind==="tidal"?75:28,
  color:TYPES[state.form].color,hitOnce:false});
}
function zone(kind,power,range=175,time=.55){
 state.zones.push({kind,x:mac.x+mac.width/2,y:mac.y+mac.height/2,range,
  remaining:time,cooldown:0,power,color:TYPES[state.form].color});
}
function activate(id){
 state.stats.abilities++;
 switch(id){
  case "jet":fireProjectile("jet",26,560);break;
  case "whirlpool":zone("whirlpool",18,154,.8);break;
  case "tidal":fireProjectile("tidal",74,480,1.5);break;
  case "blade":fireProjectile("blade",25,760);break;
  case "dash":mac.vx=(mac.facing<0?-1:1)*500;zone("dash",26,107,.35);break;
  case "cyclone":zone("cyclone",20,240,1.25);break;
  case "venom":fireProjectile("venom",18,500);break;
  case "cloud":zone("cloud",12,165,1.2);break;
  case "garden":zone("garden",36,280,1.1);break;
  case "leap":mac.vy=-550;mac.vx=(mac.facing<0?-1:1)*240;zone("leap",20,112,.35);break;
  case "whip":hurtAt(attackBox(230,95),35,"whip");break;
  case "canopy":zone("canopy",45,250,.85);break;
  case "prism":fireProjectile("prism",30,490);break;
  case "veil":state.invulnerable=2.1;break;
  case "mirror":fireProjectile("mirror",65,600,1.7);break;
  case "bite":hurtAt(attackBox(125,92),48,"bite");break;
  case "slam":zone("slam",43,180,.3);break;
  case "quake":zone("quake",65,330,.90);break;
  case "shard":fireProjectile("shard",31,650);break;
  case "frost":zone("frost",16,155,1.3);break;
  case "winter":zone("winter",50,295,1.2);break;
  case "shade":mac.vx=(mac.facing<0?-1:1)*560;zone("shade",31,115,.35);break;
  case "echo":fireProjectile("echo",33,560);break;
  case "eclipse":zone("eclipse",66,295,.97);break;
 }
 const color=TYPES[state.form].accent;
 vfx(mac.x+mac.width/2,mac.y+mac.height/2,color,14);
}
const dot={};
const originalUpdate=update;
update=function(dt){
 originalUpdate(dt);
 if(!valid())return;
 dt=clamp(dt,0,.05);
 state.time+=dt;
 if(lastNode!==A1.node||lastRoom!==currentRoom){
  lastNode=A1.node;lastRoom=currentRoom;
  state.projectiles=[];state.zones=[];spawnFlies();
 }
 if(mac.waterPower&&!state.unlocked.has("water"))unlock("water",true);
 if(state.message)state.message.life=Math.max(0,state.message.life-dt);
 for(const p of state.fx){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=270*dt;p.life-=dt;}
 state.fx=state.fx.filter(p=>p.life>0);
 if(state.invulnerable>0){
  state.invulnerable=Math.max(0,state.invulnerable-dt);
  // Camouflage must still respect damage invulnerability from the original engine.
  if(state.form==="glass")mac.invulnerableTimer=Math.max(mac.invulnerableTimer||0,Math.min(.15,state.invulnerable));
 }
 state.energy=clamp(state.energy+dt*(state.form==="base"?4.2:2.0),0,100);
 if(state.transformTimer>0){
  state.transformTimer-=dt;
  if(state.transformTimer<=0){
   state.form=state.nextForm||"base";state.nextForm=null;
   message(state.form==="base"?"FORMA ORIGINAL":TYPES[state.form].title);
   persist();
  }
 }
 if(state.form==="wind"&&mac.vy>115&&(keys.Space||keys.ArrowUp))mac.vy=Math.min(mac.vy,115);
 if(state.form==="water"&&currentRoom===0){
  const w=A1.rooms[A1.node]?.water||[];
  const pb={x:mac.x,y:mac.y,width:mac.width,height:mac.height};
  if(w.some(f=>overlap(pb,f))&&mac.vy>120)mac.vy=120;
 }
 for(const fly of state.flies){
  fly.y=fly.baseY+Math.sin(state.time*3+fly.phase)*15;
  if(flyHit(fly)){
   unlock(fly.id,true);
   vfx(fly.x,fly.y,TYPES[fly.id].color,22);
   fly.captured=true;
  }
 }
 state.flies=state.flies.filter(f=>!f.captured);
 if(state.comboGrace>0)state.comboGrace-=dt;
 if(state.attack){
  const a=state.attack;a.elapsed+=dt;
  if(a.type==="combo"){
   const active=a.elapsed>=a.hit[0]&&a.elapsed<=a.hit[1];
   if(active&&!a.didHit){
    const x=attackBox(a.reach,a.kick?80:66);
    a.didHit=hurtAt(x,a.damage,"combo");
    if(a.didHit)vfx(x.x+(mac.facing<0?10:a.reach-10),x.y+(a.kick?55:25),a.theme||"#d4bd89",7);
   }
  }else if(!a.fired&&a.elapsed>=a.time*.38){
   a.fired=true;activate(a.id);
  }
  if(a.elapsed>=a.time){
   state.attack=null;
   if(a.type==="combo"){
    state.comboGrace=.35;
    if(state.queue){
     const next=(a.index+1)%4;
     startAttack(state.form==="base"?{...comboBase[next]}:transformedCombo(state.form,next),"combo",next);
     if(next===3)state.stats.combos++;
    }
   }
  }
 }
 for(const p of state.projectiles){
  p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
  const box={x:p.x-p.width/2,y:p.y-p.height/2,width:p.width,height:p.height};
  if(hurtAt(box,p.power,p.kind)){p.life=0;vfx(p.x,p.y,p.color,8);}
  if(p.x<0||p.x>(A1.rooms[A1.node]?.width||4800)+100)p.life=0;
 }
 state.projectiles=state.projectiles.filter(p=>p.life>0);
 for(const z of state.zones){
  z.remaining-=dt;z.cooldown-=dt;
  if(z.cooldown<=0){
   z.cooldown=.25;
   const b={x:z.x-z.range,y:z.y-z.range*.68,width:2*z.range,height:z.range*1.36};
   hurtAt(b,z.power,z.kind);
  }
 }
 state.zones=state.zones.filter(z=>z.remaining>0);
};
const oldDamage=damageMac;
damageMac=function(amount,source){
 const mitigation=state.form==="colossal"?.78:1;
 if(state.invulnerable>0&&state.form==="glass")return;
 return oldDamage(amount*mitigation,source);
};
const previousLoad=a1LoadNode;
a1LoadNode=function(id,side,preserve){
 const r=previousLoad(id,side,preserve);
 lastNode=id;spawnFlies();return r;
};
function info(){
 return {version:state.version,form:state.form,selected:state.selected,unlocked:[...state.unlocked],
  energy:+state.energy.toFixed(1),attack:state.attack?.name||state.attack?.label||null,
  flies:state.flies.map(f=>f.id),stats:{...state.stats},message:state.message?.life>0?state.message.text:null};
}
window.MacFrogV10=Object.freeze({info,registry:()=>Object.entries(TYPES).map(([id,v])=>({id,name:v.title,passive:v.passive,specials:v.specials?.map(a=>a.label)||[],ultimate:v.ultimate?.label||null})),
 validate:()=>{
  const errors=[];
  for(const [id,v] of Object.entries(TYPES)){
   if(id==="base"){if(v.combo.length!==4)errors.push("base-combo");continue;}
   if(v.specials?.length!==2||!v.ultimate||!v.passive||!v.progress)errors.push("form-"+id);
  }
  return {ok:!errors.length,errors};
 }});
window.MacFrogV10State=state;
if(typeof location!=="undefined"&&new URLSearchParams(location.search).get("dev")==="1"){
 window.MacFrogV10Dev=Object.freeze({
  grant:(id)=>unlock(id,false),select:(id)=>{if(!state.unlocked.has(id))throw Error("locked "+id);state.selected=id;return info();},
  transform:()=>{const done=toggle();return {done,...info()};},combo:()=>{const done=combo();return {done,...info()};},
  action:(n)=>{const done=special(n);return {done,...info()};},setEnergy:(v)=>state.energy=clamp(v,0,100),
  travel:(id)=>{a1LoadNode(id,"left",false);return info();},
  prepareMiniPunch:()=>{
   a1LoadNode("mina","left",false);
   const m=window.MacFrogV9State.mini;
   if(!m||!m.alive)throw Error("Mini boss not alive; reset test storage");
   mac.x=m.x-85;mac.y=m.y+8;mac.facing=1;mac.vx=0;mac.vy=0;
   state.attack=null;state.form="base";state.transformTimer=0;
   return {hp:m.hp,player:{x:mac.x,y:mac.y},boss:{x:m.x,y:m.y}};
  },
  prepareFly:(id)=>{
   const form=TYPES[id];if(!form?.progress)throw Error("unknown fly "+id);
   a1LoadNode(form.progress,"left",false);
   const f=state.flies.find(x=>x.id===id);
   if(!f)throw Error("fly unavailable "+id);
   mac.facing=1;
   mac.x=f.x-87;
   const room=A1.rooms[A1.node];
   const support=[...room.platforms,...room.floors]
      .filter(p=>p.x<=f.x&&p.x+p.width>=f.x&&p.y>f.y&&p.y-f.y<260)
      .sort((a,b)=>a.y-b.y)[0];
   mac.y=support?support.y-mac.height-2:f.y-mac.height*.72;
   mac.vx=0;mac.vy=0;mac.grounded=!!support;
   snapCameraToMac();
   return {id,fly:{x:f.x,y:f.y},mac:{x:mac.x,y:mac.y},unlocked:state.unlocked.has(id)};
  },
  state:()=>({timer:state.transformTimer,attack:state.attack,projectiles:state.projectiles.length,zones:state.zones.length})
 });
}
spawnFlies();
})();