// MAC FROG V10 — original animated pixel sprites, Fly Essence visuals and HUD.
// Each form owns eight animated 8-frame strips. Atlases are cached, NOT generated per frame.
(function installMetamorphosisArtV10(){
"use strict";
const core=window.MacFrogV10State,registry=Object.fromEntries(window.MacFrogV10.registry().map(x=>[x.id,x]));
const colors={base:["#5a8352","#a7c07b","#d3be87"],water:["#2f7181","#63bac2","#b0ebdd"],
 wind:["#5e9258","#bcdb86","#e5edb7"],poison:["#67834b","#d9b85a","#f8da75"],
 tree:["#326f4a","#87c089","#d4dca0"],glass:["#5c8f87","#b5e8c7","#ecf3d9"],
 colossal:["#4c6242","#ac9964","#ead099"],ice:["#456b91","#8cc5dc","#e9f4fc"],
 shadow:["#40466e","#9586bb","#c9d3f0"]};
const states=["idle","run","punch","kick","special","ultimate","transform","hurt","jump","fall","land"];
const W=72,H=88,FRAMES=8,atlases=new Map();
const fill=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(c,col,pts){c.fillStyle=col;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fill();}
function frog(c,form,action,frame){
 const p=colors[form]||colors.base;
 const phase=(frame/FRAMES)*Math.PI*2;
 const run=action==="run",punch=action==="punch",kick=action==="kick",special=action==="special",ultimate=action==="ultimate";
 const jump=action==="jump",fall=action==="fall",land=action==="land";
 const bob=jump?-4:fall?2:land?Math.round((8-frame)*.6):Math.round(Math.sin(phase)*(run?4:2)),
 stretch=action==="transform"?Math.round(Math.sin(Math.PI*(frame+1)/9)*6):0;
 const leg=jump?-8:fall?5:land?0:Math.round(Math.sin(phase)*(run?10:2));
 const arm=punch?Math.round(Math.sin(Math.min(1,frame/5)*Math.PI)*16):
  special?Math.round(Math.sin(Math.PI*(frame+1)/9)*8):jump?10:fall?-2:3;
 const wide=form==="colossal",thin=form==="wind"||form==="shadow",membranes=form==="water"||form==="wind";
 const width=wide?49:thin?32:39, left=36-width/2;
 const mainY=25+bob-stretch, bottom=71+bob+stretch;
 // Shadow outline, thigh and ankle, carefully kept within a fixed 72x88 image frame.
 fill(c,"rgba(4,14,20,.19)",12,80,48,4);
 poly(c,"#1b2930",[[left+3,54+bob],[left+15,54+bob],[left+12+leg*.25,74],[left-2+leg*.25,79],[left-6,73]]);
 poly(c,p[0],[[left+4,57+bob],[left+14,56+bob],[left+11+leg*.25,71],[left-3+leg*.25,75]]);
 poly(c,"#1b2930",[[left+width-18,55+bob],[left+width-5,55+bob],[left+width+leg*.25,76],[left+width-19+leg*.25,79],[left+width-22,72]]);
 poly(c,p[0],[[left+width-17,58+bob],[left+width-8,57+bob],[left+width-5-leg*.25,71],[left+width-16-leg*.25,75]]);
 if(kick){
  const thrust=frame<4?frame*7:(8-frame)*7;
  poly(c,"#1b2830",[[left+width-15,58+bob],[left+width+thrust,55+bob-6],[left+width+thrust+3,65+bob],[left+width-12,74]]);
  poly(c,p[1],[[left+width-10,60+bob],[left+width+thrust,59+bob-6],[left+width+thrust,63+bob-6],[left+width-11,70]]);
 }
 // Massive belly and dorsal shading.
 const belly=wide?54:63;
 poly(c,"#13262b",[[left+4,mainY+4],[left+width-4,mainY+3],[left+width+6,mainY+24],[left+width+1,bottom],[left-1,bottom],[left-7,mainY+23]]);
 poly(c,p[0],[[left+6,mainY+7],[left+width-5,mainY+6],[left+width+2,mainY+24],[left+width-2,bottom-4],[left+3,bottom-4],[left-2,mainY+23]]);
 poly(c,p[1],[[left+12,mainY+21],[left+width-11,mainY+21],[left+width-7,mainY+38],[left+width-11,mainY+48],[left+11,mainY+47],[left+6,mainY+38]]);
 fill(c,p[2],left+14,mainY+42,width-28,3);
 // Speckles follow form-specific motif, not just a recolor.
 for(let i=0;i<7;i++){
  const x=left+8+(i*19)%(width-12),y=mainY+23+(i*13)%25;
  fill(c,i%2?"#344f49":p[2],x,y,i%3+2,2);
 }
 // Arms, separated from central body so they move frame-to-frame.
 const armY=mainY+22;
 poly(c,"#1b2930",[[left+5,armY],[left-5,armY+4],[left-5,armY+23],[left+1,armY+31],[left+10,armY+12]]);
 poly(c,p[0],[[left+5,armY+4],[left-2,armY+5],[left-1,armY+25],[left+3,armY+25],[left+9,armY+11]]);
 const right=left+width;
 const rx=right+arm;
 poly(c,"#17292d",[[right-7,armY],[right+3,armY+2],[rx+7,armY+22],[rx+5,armY+29],[right-3,armY+24]]);
 poly(c,p[0],[[right-7,armY+5],[right,armY+5],[rx+4,armY+23],[rx+1,armY+25],[right-4,armY+20]]);
 fill(c,p[2],rx-1,armY+24,11,5);
 if(membranes) {
  poly(c,p[1],[[rx+3,armY+25],[rx+14,armY+12],[rx+16,armY+30]]);
  fill(c,p[2],rx+5,armY+23,10,2);
 }
 // Broad frog head with projecting eyes and animated mouth.
 const headY=mainY-11+Math.round(Math.sin(phase)*1.5);
 poly(c,"#14282a",[[left-6,headY+15],[left-5,headY+5],[left+5,headY-2],[right-4,headY-2],[right+7,headY+7],[right+6,headY+22],[left+1,headY+29],[left-7,headY+22]]);
 poly(c,p[0],[[left-4,headY+14],[left+1,headY+5],[left+8,headY],[right-6,headY],[right+5,headY+11],[right+3,headY+20],[right-6,headY+25],[left+1,headY+24]]);
 fill(c,p[1],left+5,headY+8,width-9,6);
 // Horns, translucent fins, glowing spots, icy crown: distinct species silhouettes.
 if(form==="colossal"){poly(c,p[2],[[left+1,headY+7],[left-7,headY-15],[left+13,headY+3]]);poly(c,p[2],[[right-4,headY+7],[right+7,headY-14],[right-13,headY+2]]);}
 if(form==="tree"){for(let i=0;i<4;i++)fill(c,p[2],left-10+i*16,headY-1,7,5);}
 if(form==="wind"){poly(c,p[2],[[left+5,headY+1],[left-11,headY-10],[left+3,headY+12]]);poly(c,p[2],[[right-5,headY+1],[right+11,headY-10],[right-3,headY+12]]);}
 if(form==="ice"){for(let i=0;i<4;i++)poly(c,p[2],[[left+6+i*10,headY+4],[left+10+i*10,headY-9-(i%2)*4],[left+13+i*10,headY+4]]);}
 if(form==="shadow"){fill(c,"#89dfc6",left+2,headY+13,7,3);fill(c,"#89dfc6",right-8,headY+13,6,3);}
 if(form==="glass"){fill(c,"rgba(227,250,231,.80)",left+8,headY+18,width-15,2);fill(c,"#d8f7d7",left+18,mainY+35,width-35,3);}
 if(form==="poison"){for(let i=0;i<8;i++)fill(c,i%2?"#efd16f":"#4c4932",left+(i*11)%width,headY+6+(i%3)*4,3,3);}
 if(form==="water"){fill(c,"#94eff1",left-4,headY+12,5,12);fill(c,"#94eff1",right-1,headY+12,5,12);}
 // Distinct pupils and mouth: expressive, blinking frames.
 const blink=frame===6&&action==="idle";
 fill(c,"#173132",left+2,headY+13,12,10);fill(c,"#173132",right-14,headY+13,12,10);
 fill(c,p[2],left+5,headY+15,7,blink?2:6);
 fill(c,p[2],right-11,headY+15,7,blink?2:6);
 if(!blink){fill(c,"#1b2830",left+8+(frame%2),headY+16,3,4);fill(c,"#1b2830",right-9+(frame%2),headY+16,3,4);}
 fill(c,"#1d3734",left+12,headY+24,width-24,2);
 if(action==="hurt")fill(c,"#f8e0b3",left+13,headY+27,width-26,3);
 if(ultimate){fill(c,p[2],8,10,8+(frame*7)%31,3);fill(c,p[2],54,18,5,12);}
 if(action==="transform"){fill(c,p[2],5+frame*5,mainY-12,3,9);fill(c,p[2],61-frame*5,mainY+9,3,8);}
}
function createStrip(form,action){
 const canvas=document.createElement("canvas");canvas.width=W*FRAMES;canvas.height=H;
 const c=canvas.getContext("2d");c.imageSmoothingEnabled=false;
 for(let i=0;i<FRAMES;i++){
  c.save();c.translate(i*W,0);frog(c,form,action,i);c.restore();
 }
 return canvas;
}
function get(form,action){
 const key=form+":"+action;
 if(!atlases.has(key))atlases.set(key,createStrip(form,action));
 return atlases.get(key);
}
const initialForms=["base","water","wind","poison","tree","glass","colossal","ice","shadow"];
for(const form of initialForms)for(const action of states)get(form,action);
let landingTimer=0,lastGrounded=mac.grounded;
const oldUpdateForAnim=update;
update=function(dt){
 oldUpdateForAnim(dt);
 if(!lastGrounded&&mac.grounded)landingTimer=.16;
 else landingTimer=Math.max(0,landingTimer-dt);
 lastGrounded=mac.grounded;
};
const oldDraw=drawMacSprite;
drawMacSprite=function(){
 if(mac.dead||currentRoom!==0&&currentRoom!==1){oldDraw();return;}
 const a=core.attack;
 const transforming=core.transformTimer>0;
 // Use the same original V10 frog silhouette for idle, movement and attacks.
 // Legacy atlases are still preserved and used as fallback during death.
 const form=transforming?(core.nextForm||core.form):core.form;
 const action=transforming?"transform":a?(a.type==="combo"?(a.kick?"kick":"punch"):a.type==="ultimate"?"ultimate":"special"):
   !mac.grounded?(mac.vy<-60?"jump":"fall"):
   landingTimer>0?"land":Math.abs(mac.vx)>35?"run":"idle";
 const sprite=get(form,action);
 const progress=transforming?1-core.transformTimer/.42:a?Math.min(1,a.elapsed/a.time):core.time*(action==="run"?13:8)/FRAMES;
 const frame=transforming?Math.floor(progress*FRAMES)%FRAMES:a?Math.min(7,Math.floor(progress*FRAMES)):Math.floor(progress*FRAMES)%FRAMES;
 const scale=1.65; // consistent, legible pixel-scale silhouette with less screen occlusion
 const ww=W*scale,hh=H*scale;
 const x=Math.round(mac.x+mac.width/2-ww/2),y=Math.round(mac.y+mac.height-hh+13);
 ctx.save();ctx.imageSmoothingEnabled=false;
 if(mac.facing<0){ctx.translate(x+ww,0);ctx.scale(-1,1);ctx.drawImage(sprite,frame*W,0,W,H,0,y,ww,hh);}
 else ctx.drawImage(sprite,frame*W,0,W,H,x,y,ww,hh);
 ctx.restore();
};
const beforeExits=drawRoomExit;
drawRoomExit=function(){
 beforeExits();
 if(currentRoom!==0)return;
 ctx.save();ctx.imageSmoothingEnabled=false;
 for(const f of core.flies){
  const cfg=colors[f.id],x=Math.round(f.x),y=Math.round(f.y),phase=Math.sin(core.time*18+f.phase)*5;
  // Original 16x16 Essence Fly silhouette, animated wings and segmented abdomen.
  ctx.fillStyle="rgba(7,12,15,.42)";ctx.fillRect(x-11,y-5,22,17);
  ctx.fillStyle=cfg[1];ctx.fillRect(x-5,y-8,10,15);
  ctx.fillStyle=cfg[2];ctx.fillRect(x-3,y-4,6,6);
  ctx.fillStyle="#dff4e8";ctx.fillRect(x-17,y-11+phase,11,7);ctx.fillRect(x+6,y-11-phase,11,7);
  ctx.fillStyle="#152b2b";ctx.fillRect(x-5,y+7,3,5);ctx.fillRect(x+2,y+7,3,5);
  ctx.strokeStyle=cfg[1];ctx.lineWidth=2;ctx.strokeRect(x-19,y-20,38,40);
 }
 for(const p of core.projectiles){
  ctx.fillStyle=p.color;
  ctx.fillRect(p.x-p.width/2,p.y-p.height/2,p.width,p.height);
  ctx.strokeStyle="rgba(235,255,243,.55)";
  ctx.strokeRect(p.x-p.width/2,p.y-p.height/2,p.width,p.height);
  ctx.fillStyle="rgba(234,255,243,.50)";ctx.fillRect(p.x-p.width/2+4,p.y-p.height/2+3,Math.max(1,p.width-8),4);
 }
 for(const z of core.zones){
  const alpha=Math.min(.35,z.remaining*.30);
  ctx.fillStyle="rgba(153,221,192,"+alpha+")";
  ctx.beginPath();ctx.ellipse(z.x,z.y,z.range,z.range*.67,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=z.color;ctx.lineWidth=3;ctx.stroke();
 }
 for(const p of core.fx){ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}
 ctx.restore();
};
const oldHUD=drawHUD;
drawHUD=function(){
 oldHUD();
 if(mac.dead)return;
 const cfg=colors[core.form],name=core.form==="base"?"FORMA BASE":(registry[core.form]?.name||core.form).toUpperCase();
 const x=20,y=HEIGHT-58,w=270;
 ctx.save();
 ctx.fillStyle="rgba(5,18,22,.87)";ctx.fillRect(x,y,w,46);
 ctx.fillStyle=cfg[1];ctx.fillRect(x,y,5,46);
 ctx.fillStyle="#e3ede6";ctx.font="bold 12px sans-serif";ctx.textAlign="left";
 ctx.fillText(name,x+14,y+17);
 ctx.fillStyle="#23434b";ctx.fillRect(x+14,y+27,184,8);
 ctx.fillStyle=cfg[1];ctx.fillRect(x+14,y+27,184*(core.energy/100),8);
 ctx.fillStyle="#c2d0c7";ctx.font="11px sans-serif";
 ctx.fillText("Q ESSÊNCIA  T TRANSFORMAR",x+14,y+43);
 if(core.message&&core.message.life>0){
  ctx.fillStyle="rgba(7,24,27,.90)";ctx.fillRect((WIDTH-350)/2,62,350,40);
  ctx.fillStyle="#e8f1de";ctx.font="bold 14px sans-serif";ctx.textAlign="center";
  ctx.fillText(core.message.text,WIDTH/2,87);
 }
 ctx.restore();
};
window.MacFrogV10Art=Object.freeze({
  info:()=>({atlases:atlases.size,frames:FRAMES,states:[...states],forms:[...initialForms],size:[W,H]}),
  sprite:(form,action)=>get(form,action)
});
})();