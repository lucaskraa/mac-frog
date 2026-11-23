// Mac Frog V9 original procedural pixel-art rendering (no copyrighted game assets).
// Draws 16/32px modular patterns and hand-built spritesheets, not stretched rectangles.
(function installV9Art(){
"use strict";
const v9=window.MacFrogV9State,rooms=A1.rooms;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const P={
 mangue:["#102523","#294139","#52694c","#a2be78","#6a8c72"],
 raizes:["#102b24","#2d4939","#596a43","#b9cf7d","#73946f"],
 cripta:["#181e2a","#353c4b","#626276","#a49da3","#646f89"],
 abismo:["#0b1d2a","#234458","#3a6470","#8ac6c7","#5b99a1"],
 ruinas:["#101f2c","#2c4354","#51646a","#9ab9a7","#668986"],
 aqueduto:["#102c30","#23535a","#48747d","#9ad0c0","#5eaab1"],
 templo:["#29262d","#554437","#85664c","#ddbd86","#9f9b72"]
};
const colors=r=>P[r?.v9Theme]||P.ruinas;
const prng=n=>{n=((n^61)^(n>>>16))>>>0;n=(n+(n<<3))>>>0;n^=n>>>4;n=Math.imul(n,0x27d4eb2d)>>>0;return ((n^(n>>>15))>>>0)/4294967295;};
const textures=new Map();
function texture(theme,style="stone"){
 const key=theme+"|"+style;
 if(textures.has(key))return textures.get(key);
 const c=document.createElement("canvas"),t=c.getContext("2d");c.width=48;c.height=48;
 const p=P[theme]||P.ruinas;
 t.fillStyle=style==="wood"?"#4b3b33":p[1];t.fillRect(0,0,48,48);
 // Make small pixel blocks, masonry cracks and roots at native resolution.
 for(let y=0;y<48;y+=4)for(let x=0;x<48;x+=4){
   const n=prng(x*923+y*37+theme.length*117+style.length*29);
   t.fillStyle=n>.74?p[2]:n<.15?p[0]:style==="wood"?"#584334":p[1];
   t.fillRect(x,y,4,4);
 }
 t.strokeStyle=style==="wood"?"#8c7155":p[0];t.lineWidth=2;
 for(let y=15;y<48;y+=21){
   t.beginPath();t.moveTo(0,y);t.lineTo(48,y);t.stroke();
   for(let x=y%3?10:29;x<48;x+=31){t.fillRect(x,y,2,13);}
 }
 if(style==="moss"||theme==="mangue"||theme==="raizes"){
   for(let x=3;x<48;x+=11){t.fillStyle=prng(x*97)>.5?"#678a56":"#406c4f";
     t.fillRect(x,0,5,3);t.fillRect(x+2,3,2,3+((x*3)%8));}
 }
 if(style==="wood"){for(let x=11;x<48;x+=19){t.fillStyle="#2f2928";t.fillRect(x,8,2,40);}}
 textures.set(key,c);return c;
}
function paint(c,r,kind){
 if(!r||r.width<=0||r.height<=0)return;
 const pal=colors(rooms[A1.node]),theme=rooms[A1.node].v9Theme;
 const tx=texture(theme,kind);
 c.save();c.beginPath();c.rect(r.x,r.y,r.width,r.height);c.clip();
 c.fillStyle=c.createPattern(tx,"repeat");c.fillRect(r.x,r.y,r.width,r.height);
 c.fillStyle=kind==="wood"?"#ae996f":pal[3];c.fillRect(r.x,r.y,r.width,8);
 c.fillStyle=pal[0];c.fillRect(r.x,r.y+r.height-7,r.width,7);
 if(kind==="moss"||kind==="wood"){
   for(let x=Math.round(r.x/48)*48;x<r.x+r.width;x+=48){
     c.fillStyle=kind==="moss"?"#649476":"#73553d";
     c.fillRect(x+9,r.y+6,6,3+((x/48|0)%4)*3);
     if(kind==="moss"&&r.height>36)c.fillRect(x+15,r.y+9,3,19);
   }
 }
 c.strokeStyle=pal[0];c.lineWidth=3;c.strokeRect(r.x+.5,r.y+.5,r.width-1,r.height-1);
 c.restore();
}
function parallax(){
 const r=rooms[A1.node],pal=colors(r);const sky=ctx.createLinearGradient(0,0,0,HEIGHT);
 sky.addColorStop(0,pal[0]);sky.addColorStop(.64,pal[1]);sky.addColorStop(1,"#071719");
 ctx.fillStyle=sky;ctx.fillRect(0,0,WIDTH,HEIGHT);
 const off=camera.x*.10,oy=camera.y*.035;
 ctx.save();ctx.globalAlpha=.38;
 for(let layer=0;layer<3;layer++){
   const shift=(off*(layer+.7))%260;
   for(let i=-1;i<=Math.ceil(WIDTH/260)+2;i++){
     const x=Math.round(i*260-shift+(layer*61)),h=240+(i*i*47+layer*73+97)%230;
     const baseY=HEIGHT-30+oy+layer*50;
     ctx.fillStyle=layer===0?"#102a31":layer===1?"#10282b":"#0b1d20";
     if(r.v9Theme==="mangue"||r.v9Theme==="raizes"){
       ctx.fillRect(x+35,baseY-h,28,h);
       ctx.fillRect(x-40,baseY-h+45,180,24);
       ctx.fillRect(x-10,baseY-h-35,110,48);
       ctx.fillRect(x+10,baseY-h-73,64,45);
       ctx.fillRect(x+20,baseY-h-105,44,40);
       ctx.fillRect(x+42,baseY-h+85,5,h*.4);
     }else{
       ctx.fillRect(x,baseY-h,96,h);
       ctx.fillRect(x-24,baseY-h+46,144,22);
       for(let a=0;a<3;a++)ctx.clearRect(x+17+a*25,baseY-h+110,11,45);
       ctx.fillRect(x+21,baseY-h-25,56,25);
     }
   }
 }
 ctx.globalAlpha=.09;
 for(let i=0;i<12;i++){
   const x=(i*241-camera.x*.06+WIDTH*7)%WIDTH;
   ctx.fillStyle=pal[3];ctx.fillRect(Math.round(x),22+(i*97)%HEIGHT,4,4);
 }
 ctx.restore();
}
a1DrawParallax=parallax;
a1BuildRoomCache=function(){
 const r=rooms[A1.node],c=A1.roomCacheCtx;
 if(!c)return;
 c.clearRect(0,0,r.width,r.height);c.imageSmoothingEnabled=false;
 const pal=colors(r);
 // Background architecture only; it must not be mistaken for collision.
 c.save();c.globalAlpha=.20;
 for(let x=170;x<r.width;x+=360){
   c.fillStyle=pal[0];c.fillRect(x,200,42,r.height-200);
   c.fillRect(x-25,220,92,28);c.fillRect(x-17,260,77,12);
   if(r.v9Theme==="templo"||r.v9Theme==="cripta"){
     c.strokeStyle=pal[3];c.lineWidth=4;
     c.beginPath();c.arc(x+22,220,88,Math.PI,2*Math.PI);c.stroke();
   }else{
     c.fillStyle=pal[2];c.fillRect(x+25,150,7,170);
     c.fillRect(x-65,255,133,10);
   }
 }
 c.restore();
 for(const f of r.floors)paint(c,f,"moss");
 for(const w of r.walls)paint(c,w,"stone");
 for(const p of r.platforms)paint(c,p,p.style==="wood"?"wood":p.style==="moss"?"moss":"stone");
 // Portal framing sits beside collision boundaries and has an open center.
 if(r.v9Shaft){
   const s=r.v9Shaft,y=r.height-96;
   c.fillStyle="#10191c";c.fillRect(s.x,y,s.width,96);
   c.fillStyle=pal[3];c.fillRect(s.x-11,y,11,96);c.fillRect(s.x+s.width,y,11,96);
   for(let k=0;k<4;k++){
     c.fillStyle=k%2?pal[2]:pal[1];
     c.fillRect(s.x+10+k*82,y+25,58,5);
   }
   c.fillStyle="rgba(89,159,172,.25)";c.fillRect(s.x,y+72,s.width,22);
 }
 A1.roomCacheDirty=false;
};
const OLD_WATER=a1DrawWater;
a1DrawWater=function(room){
 OLD_WATER(room);
 ctx.save();ctx.globalAlpha=.38;
 for(const p of room.water||[]){
   ctx.fillStyle="#b6ebdf";
   for(let x=p.x+24;x<p.x+p.width;x+=48)ctx.fillRect(x+Math.sin(v9.time*3+x)*6,p.y+18,25,3);
 }
 ctx.restore();
};
a1DrawExitCue=function(e){
 const r=rooms[A1.node],pal=colors(r);
 const x=e.side==="left"?8:e.side==="right"?r.width-40:(e.from+e.to)/2-49;
 const y=e.side==="top"?12:e.side==="bottom"?r.height-102:r.height-292;
 const w=e.side==="left"||e.side==="right"?36:98;
 const h=e.side==="left"||e.side==="right"?214:30;
 ctx.save();
 ctx.fillStyle=a1CanUseExit(e)?"rgba(8,20,22,.54)":"rgba(23,76,98,.7)";
 ctx.fillRect(x,y,w,h);
 ctx.strokeStyle=a1CanUseExit(e)?pal[3]:"#9beaf5";ctx.lineWidth=5;ctx.strokeRect(x,y,w,h);
 if(e.side==="bottom"){
   ctx.fillStyle="rgba(3,11,15,.75)";ctx.fillRect(x+6,y+10,w-12,h+45);
   ctx.fillStyle=pal[3];
   ctx.fillRect(x+19,y+43,w-38,5);
 }
 if(!a1CanUseExit(e)){ctx.fillStyle="rgba(149,223,240,.52)";
   for(let t=4;t<h;t+=17)ctx.fillRect(x+5,y+t,w-10,4);
 }
 ctx.restore();
};
// Generate genuinely pixel-based animated insect sprites in an offscreen 32px atlas.
const sprites=new Map();
function buildSprite(role,frame){
 const key=role+"_"+frame;
 if(sprites.has(key))return sprites.get(key);
 const cvs=document.createElement("canvas"),c=cvs.getContext("2d");cvs.width=40;cvs.height=30;
 c.imageSmoothingEnabled=false;
 const pix=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x|0,y|0,w|0,h|0)};
 const leg=(x,y,dir,color)=>{pix(color,x,y,3,8);pix(color,x+dir*3,y+7,6,3)};
 const sway=frame%2?2:0;
 if(role==="mosca"){
   pix("#344d43",11,12,23,12);pix("#678c61",15,10,15,16);
   pix("rgba(166,239,231,.72)",13-sway,2,9,10);pix("rgba(137,216,225,.66)",22+sway,3,11,10);
   pix("#25373b",8,12,10,12);pix("#f6a369",9,15,4,4);pix("#d45850",13,15,3,4);
   for(let i=0;i<3;i++)leg(13+i*6,21,i%2?1:-1,"#2e3031");
 }else if(role==="larva"){
   for(let i=0;i<6;i++){
     const px=7+i*5;const py=13+Math.round(Math.sin((i+frame)*1.3)*2);
     pix(i%2?"#b5ac7c":"#82936c",px,py,9,11);
     pix("#3a4641",px+2,py+8,6,5);pix("#607353",px+2,py+2,3,3);
   }
   pix("#d2c28b",5,13+sway,10,12);pix("#ec8857",7,17+sway,4,4);
   for(let i=0;i<5;i++)leg(9+i*6,23,(i%2)*2-1,"#5a4b42");
 }else{
   for(let i=0;i<4;i++)leg(11+i*6,18+((i+frame)%2)*2,i%2?1:-1,"#46372f");
   pix("#332d3f",7,11,29,13);pix("#826454",9,7,26,15);
   pix("#544959",12,6,17,12);pix("#9b8a60",14,6,14,5);
   pix("#547255",15,6,5,3);pix("#577b57",27,10,6,4);
   pix("#e9a759",7,13,4,5);pix("#f5be62",31,13,4,5);
   pix("#f17b58",8,13,3,3);pix("#251b25",10,12,2,2);
   pix("#332d3f",6,5,3,7);pix("#af9263",5,3,4,5);
 }
 sprites.set(key,cvs);return cvs;
}
a1DrawEnemy=function(e){
 if(!e.alive)return;
 const role=e.role||"besouro",sprite=buildSprite(role,Math.floor(v9.time*(role==="mosca"?14:8))%4);
 ctx.save();ctx.imageSmoothingEnabled=false;
 if(e.hurtTimer>0)ctx.globalAlpha=.47;
 if(e.dir<0){ctx.translate(e.x+e.w,e.y);ctx.scale(-1,1);ctx.drawImage(sprite,0,-9,e.w+12,e.h+14);}
 else ctx.drawImage(sprite,e.x-7,e.y-9,e.w+12,e.h+14);
 ctx.restore();
 const hp=clamp(e.hp/e.maxHp,0,1);
 ctx.fillStyle="rgba(7,13,16,.75)";ctx.fillRect(e.x,e.y-11,e.w,4);
 ctx.fillStyle="#a3c17f";ctx.fillRect(e.x,e.y-11,e.w*hp,4);
};
// Segmented centipede: body motion animates independently of the attack hitbox.
function miniDraw(){
 const b=v9.mini;if(!b||!b.alive||A1.node!=="mina")return;
 const cx=b.x+b.w/2,y=b.y;
 ctx.save();
 const dir=b.dir;
 for(let i=7;i>=0;i--){
   const x=b.x+13+i*20;
   const raise=Math.round(Math.sin(v9.time*8-i*.75)*6);
   const cy=y+42+raise;
   ctx.fillStyle=b.flash>0?"#d1ffe4":i%2?"#483d52":"#625061";
   ctx.fillRect(x,cy-18,24,39);ctx.fillStyle="#89705c";ctx.fillRect(x+3,cy-15,18,11);
   ctx.fillStyle="#66a69a";ctx.fillRect(x+6,cy-11,7,5);
   ctx.fillStyle="#2b2934";ctx.fillRect(x+2,cy+18,7,17+(i%2)*5);
   ctx.fillRect(x+16,cy+19,7,16+((i+1)%2)*6);
 }
 const hx=dir<0?b.x-5:b.x+b.w-40;
 ctx.fillStyle=b.flash>0?"#ebffe8":"#514351";ctx.fillRect(hx,y+11,50,57);
 ctx.fillStyle="#8c6c55";ctx.fillRect(hx+8,y+13,34,14);
 ctx.fillStyle="#6bd8c0";ctx.fillRect(hx+(dir<0?10:30),y+33,8,7);
 ctx.fillStyle="#eddf9f";ctx.fillRect(hx+(dir<0?0:40),y+54,11,13);
 if(b.state==="warn"){
   ctx.strokeStyle="#f0b56d";ctx.lineWidth=4;
   const x=dir<0?b.x-270:b.x+b.w;
   ctx.strokeRect(x,b.y+25,270,65);
 }
 ctx.restore();
}
// The old boss AI remains authoritative; only visuals and the new tongue strike render here.
drawBoss=function(){
 if(currentRoom!==1||!boss.alive||boss.defeated)return;
 ctx.save();ctx.imageSmoothingEnabled=false;
 const bx=Math.round(boss.x-6),by=Math.round(boss.y-17);
 const px=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
 const pulse=Math.sin(v9.time*5)*2,hurt=boss.hurtTimer>0;
 px(hurt?"#f3b5c5":"#3b5149",bx+2,by+46,84,66);
 px(hurt?"#fff0d5":"#6e9e72",bx+9,by+15,72,55);
 px("#3e5d50",bx+17,by+6,17,17);px("#3e5d50",bx+57,by+6,18,17);
 px("#d3bd7d",bx+16,by+17,55,9);px("#b97c59",bx+32,by+8,32,8);
 px("#cbad73",bx+36,by-1,22,8);
 px("#302e3c",bx+17,by+31,14,12);px("#302e3c",bx+63,by+31,14,12);
 px("#ffe19f",bx+24,by+34,7,6);px("#ffe19f",bx+65,by+34,7,6);
 px("#2d3f39",bx+27,by+66,40,10);px("#8c684b",bx+32,by+74,31,9);
 px("#d6b56e",bx+12,by+84,18,12);px("#d6b56e",bx+61,by+84,18,12);
 for(let i=0;i<4;i++)px("#a5c38b",bx+28+i*9,by+55+Math.sin(i+v9.time*3)*pulse,7,4);
 // Elastic arm: visual length follows collision range, not a separate fake animation.
 if(["punchTelegraph","punchActive","v9TongueWarn","v9Tongue"].includes(boss.state)){
   const isActive=boss.state==="punchActive"||boss.state==="v9Tongue";
   const length=(boss.state.startsWith("v9Tongue")?350:boss.punchRange)*(isActive?1:.30);
   const fromX=boss.facing>0?bx+78:bx+8,toX=fromX+boss.facing*length;
   const y=by+55;
   px(isActive?"#a67c72":"#d5ad73",Math.min(fromX,toX),y,length,12);
   px("#668a6a",toX-13,y-11,27,31);
   if(!isActive){ctx.strokeStyle="#f1c67a";ctx.lineWidth=2;
     ctx.strokeRect(Math.min(fromX,toX),y-8,length,30);}
 }
 ctx.restore();
};
const oldDraw=draw;
draw=function(){
 oldDraw();
 if(currentRoom===0){
   ctx.save();ctx.translate(-Math.round(camera.x),-Math.round(camera.y));
   miniDraw();
   ctx.imageSmoothingEnabled=false;
   for(const p of v9.particles){
     ctx.globalAlpha=Math.min(1,Math.max(0,p.life*2.5));ctx.fillStyle=p.color;
     ctx.fillRect(p.x|0,p.y|0,p.size|0,p.size|0);
   }
   ctx.restore();
 }
 if(currentRoom===1&&boss.active&&boss.alive){
   const hp=clamp(boss.hp/boss.maxHp,0,1),w=Math.min(WIDTH-180,580),x=(WIDTH-w)/2;
   ctx.fillStyle="rgba(5,12,17,.88)";ctx.fillRect(x,HEIGHT-52,w,24);
   ctx.fillStyle="#ac756c";ctx.fillRect(x+4,HEIGHT-48,(w-8)*hp,16);
   ctx.strokeStyle="#debf85";ctx.strokeRect(x,HEIGHT-52,w,24);
   ctx.fillStyle="#efdbb3";ctx.font="bold 14px sans-serif";ctx.textAlign="center";
   ctx.fillText("CHEFE SAPO DA TRIBO  •  PODER ELÁSTICO",WIDTH/2,HEIGHT-61);
 }
 if(currentRoom===0&&A1.node==="mina"&&v9.mini?.alive){
   const b=v9.mini,w=Math.min(WIDTH-140,510),x=(WIDTH-w)/2;
   ctx.fillStyle="rgba(8,17,21,.88)";ctx.fillRect(x,HEIGHT-48,w,22);
   ctx.fillStyle="#78b7a3";ctx.fillRect(x+4,HEIGHT-44,(w-8)*(b.hp/b.maxHp),14);
   ctx.strokeStyle="#c5ad7e";ctx.strokeRect(x,HEIGHT-48,w,22);
   ctx.fillStyle="#e8d9b2";ctx.font="bold 14px sans-serif";ctx.textAlign="center";
   ctx.fillText("LACRAIA DAS PROFUNDEZAS",WIDTH/2,HEIGHT-58);
 }
 if(v9.fade>0){
   ctx.fillStyle="rgba(5,16,19,"+Math.min(.38,v9.fade*1.5)+")";
   ctx.fillRect(0,0,WIDTH,HEIGHT);
 }
};
})();
