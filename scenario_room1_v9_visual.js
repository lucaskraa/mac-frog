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
 // Pixel-art understructure is decorative; physics stays on the top collision surface.
 if(r.height<=32){
   c.save();
   const stem=kind==="wood"?"#443b35":pal[1];
   for(let x=r.x;x<r.x+r.width;x+=16){
     const width=Math.min(16,r.x+r.width-x);
     const depth=14+Math.floor(prng(x*47+r.y*19+theme.length*41)*4)*8;
     c.fillStyle=stem;c.fillRect(x,r.y+6,width,depth);
     c.fillStyle=kind==="wood"?"#6b533e":pal[2];
     c.fillRect(x+2,r.y+10,Math.max(1,width-4),8);
     if(kind==="moss"&&prng(x*13+r.y*53)>.66){
       c.fillStyle="#638b59";c.fillRect(x+5,r.y+depth+5,3,11);
     }
   }
   c.restore();
 }
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
 const s=Math.sin, t=v9.time, scale=1;
 ctx.save();
 ctx.imageSmoothingEnabled=false;
 // Segmented chitin with rhythmic locomotion: separate armor, body, legs and luminescence.
 for(let i=7;i>=0;i--){
   const step=s(t*9-i*.72);
   const wobble=Math.round(step*4);
   const x=Math.round(b.x+13+i*20);
   const y=Math.round(b.y+42+wobble);
   const fill=b.flash>0?"#e5fff0":i%2?"#3f364c":"#554357";
   ctx.fillStyle="#242532";ctx.fillRect(x-1,y-12,26,34);
   ctx.fillStyle=fill;ctx.fillRect(x+1,y-20,24,32);
   ctx.fillStyle=i%2?"#916d6b":"#a38569";ctx.fillRect(x+3,y-20,18,7);
   ctx.fillStyle="#2f293a";ctx.fillRect(x+2,y+10,20,9);
   // Thin armor grooves and individual scaled ridges.
   ctx.fillStyle="#c2a183";ctx.fillRect(x+4,y-17,2,9);
   ctx.fillStyle="#74566d";ctx.fillRect(x+18,y-14,3,13);
   ctx.fillStyle="#70cbb3";ctx.fillRect(x+7,y-13,9,3);
   ctx.fillStyle="#426b67";ctx.fillRect(x+9,y-10,5,2);
   // Legs alternate their phase like a moving wave, rather than bouncing together.
   const stride=Math.round(step*6);
   ctx.fillStyle="#2e2934";
   ctx.fillRect(x+2,y+12,5,12);
   ctx.fillRect(x-2+stride,y+21,8,7);
   ctx.fillRect(x+17,y+11,5,13);
   ctx.fillRect(x+17-stride,y+23,9,6);
   ctx.fillStyle="#a78c70";
   ctx.fillRect(x+4,y+15,2,6);ctx.fillRect(x+18,y+15,2,6);
 }
 // Head has an articulated mouth, pincers, antennae and light-reflective eyes.
 const hx=Math.round(b.dir<0?b.x-5:b.x+b.w-40), hy=Math.round(b.y+8);
 ctx.fillStyle="#2a2936";ctx.fillRect(hx-5,hy+12,58,58);
 ctx.fillStyle=b.flash>0?"#ecfff2":"#58465b";ctx.fillRect(hx+1,hy+5,47,54);
 ctx.fillStyle="#98745d";ctx.fillRect(hx+8,hy+6,31,12);
 ctx.fillStyle="#b99373";ctx.fillRect(hx+10,hy+5,25,5);
 ctx.fillStyle="#322c38";ctx.fillRect(hx+10,hy+35,30,15);
 ctx.fillStyle="#dfac7b";ctx.fillRect(hx+6,hy+45,12,13);ctx.fillRect(hx+34,hy+45,12,13);
 ctx.fillStyle="#e8cd9a";ctx.fillRect(hx+9,hy+46,5,10);ctx.fillRect(hx+39,hy+46,5,10);
 const eyeX=b.dir<0?hx+9:hx+34;
 ctx.fillStyle="#7ce1c0";ctx.fillRect(eyeX,hy+22,9,7);
 ctx.fillStyle="#d9fff1";ctx.fillRect(eyeX+2,hy+23,3,3);
 ctx.strokeStyle="#835a70";ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(hx+12,hy+8);ctx.lineTo(hx-8,hy-11+s(t*4)*3);
 ctx.moveTo(hx+35,hy+8);ctx.lineTo(hx+56,hy-17+s(t*4+1)*3);ctx.stroke();
 // Telegraph makes the actual charge attack predictable, including during phase two.
 if(b.state==="warn"){
   const reach=b.phase===2?330:270;
   const left=b.dir<0?b.x-reach:b.x+b.w;
   ctx.fillStyle="rgba(246,162,89,.14)";ctx.fillRect(left,b.y+24,reach,73);
   ctx.strokeStyle="#f4ad71";ctx.lineWidth=3;
   ctx.strokeRect(left,b.y+24,reach,73);
   ctx.fillStyle="#ffd1a0";
   for(let i=12;i<reach;i+=32)ctx.fillRect(left+i,b.y+85,14,4);
 }
 if(b.state==="slamWarn"||b.state==="slam"){
   const active=b.state==="slam";
   const areaX=b.x-88,areaY=b.y+5;
   ctx.fillStyle=active?"rgba(138,227,163,.36)":"rgba(246,178,95,.14)";
   ctx.fillRect(areaX,areaY,b.w+176,b.h+55);
   ctx.strokeStyle=active?"#d2f4bd":"#f1b670";ctx.lineWidth=active?5:3;
   ctx.strokeRect(areaX,areaY,b.w+176,b.h+55);
   ctx.fillStyle=active?"#b4e7a7":"#edb77f";
   for(let i=0;i<9;i++){
     const x=areaX+12+i*43;
     ctx.fillRect(x,b.y+b.h+8,22,active?13:5);
   }
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

// Final tribal temple: restore atmosphere and coherent surfaces in legacy Area 2.
const baseWorldGeometry=drawWorldGeometry;
drawWorldGeometry=function(){
 if(currentRoom!==1)return baseWorldGeometry();
 const sky=ctx.createLinearGradient(0,camera.y,0,camera.y+HEIGHT);
 sky.addColorStop(0,"#131d26");sky.addColorStop(1,"#32413a");
 ctx.fillStyle=sky;ctx.fillRect(camera.x,camera.y,WIDTH,HEIGHT);
 ctx.save();ctx.globalAlpha=.32;
 for(let x=80;x<WORLD_WIDTH;x+=330){
   const y=ground.y-395;
   ctx.fillStyle="#1b302f";
   ctx.fillRect(x,y,74,440);
   ctx.fillRect(x-28,y+27,126,36);
   ctx.fillRect(x-21,y+115,113,16);
   ctx.fillRect(x+16,y-50,42,55);
   ctx.fillRect(x+26,y-80,23,30);
   ctx.fillStyle="#385b4d";
   for(let i=0;i<5;i++)ctx.fillRect(x+(i*13)%75,y+i*49,8,4);
   ctx.fillStyle="#10241f";
   ctx.fillRect(x+18,y+135,38,240);
 }
 ctx.restore();
 const c=ctx,tex=texture("templo","stone");
 const stone=(r,wood=false)=>{
   if(!r||r.width<=0||r.height<=0)return;
   c.save();c.fillStyle=c.createPattern(texture("templo",wood?"wood":"stone"),"repeat");
   c.fillRect(r.x,r.y,r.width,r.height);
   c.fillStyle=wood?"#a88a62":"#b2a37b";c.fillRect(r.x,r.y,r.width,8);
   c.fillStyle="#1a292b";c.fillRect(r.x,r.y+r.height-8,r.width,8);
   if(r.height<=32)for(let x=r.x+10;x<r.x+r.width;x+=37){
      c.fillStyle="#48493d";c.fillRect(x,r.y+13,16,19);
   }
   c.restore();
 };
 stone(ground);
 for(const p of platforms)stone(p,p.style==="wood");
 for(const w of walls)stone(w);
 // Handcrafted sigil embedded in the stone altar behind the arena.
 const x=boss.arenaLeft+220,y=ground.y-245;
 ctx.save();ctx.globalAlpha=.65;ctx.strokeStyle="#9dbb80";ctx.lineWidth=7;
 ctx.strokeRect(x-76,y-18,156,175);
 ctx.strokeRect(x-44,y+13,93,100);
 ctx.beginPath();ctx.moveTo(x-32,y+50);ctx.lineTo(x,y+14);
 ctx.lineTo(x+34,y+50);ctx.lineTo(x,y+113);ctx.closePath();ctx.stroke();
 ctx.restore();
};
// Tribal gate replaces the old fluorescent purple wall.
const previousGate=drawBossGate;
drawBossGate=function(){
 if(currentRoom!==1||!boss.active||!boss.alive)return;
 const g=bossGate;
 ctx.save();ctx.fillStyle="#1a2e2e";ctx.fillRect(g.x-8,g.y,g.width+16,g.height);
 ctx.fillStyle="#78634b";ctx.fillRect(g.x-8,g.y,g.width+16,20);
 ctx.fillRect(g.x-8,g.y+g.height-19,g.width+16,19);
 ctx.fillStyle="#86be9b";
 for(let i=0;i<6;i++)ctx.fillRect(g.x+11,g.y+28+i*31,5,18);
 ctx.strokeStyle="#8aa78b";ctx.lineWidth=4;ctx.strokeRect(g.x-8,g.y,g.width+16,g.height);
 ctx.restore();
};
// More recognizable original pixel sprite for the ancestral frog chief.
function chiefAtlas(frame=0){
 // Original 72x88 pixel-art animation sheet: detailed tribal skin, crown,
 // articulated hands, ornamental armor and six independent breathing poses.
 const cvs=document.createElement("canvas"),c=cvs.getContext("2d");
 cvs.width=72;cvs.height=88;c.imageSmoothingEnabled=false;
 const p=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)};
 const poly=(col,pts)=>{c.fillStyle=col;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fill()};
 const bob=Math.round(Math.sin(frame*Math.PI/3)*2);
 const move=Math.round(Math.sin(frame*Math.PI/3)*3);
 // Bent legs / broad amphibian toes preserve a low centre of gravity.
 poly("#202e31",[[7,64],[27,64],[31,79],[26,85],[4,85],[2,79]]);
 poly("#27443a",[[45,64],[67,64],[70,83],[51,86],[42,79]]);
 poly("#426b4b",[[8,68],[27,67],[26,80],[9,82]]);
 poly("#53815a",[[46,67],[63,67],[64,80],[49,81]]);
 p("#8bac6d",6,79,22,5);p("#8bac6d",48,79,22,5);
 for(let i=0;i<4;i++){p("#d0bf88",6+i*6,81,4,5);p("#d0bf88",49+i*6,81,4,5)}
 // Wide dark outline and heavy body, each patch of color is pixel shaped.
 poly("#1b3030",[[17,25+bob],[53,24+bob],[64,35+bob],[63,63],[53,76],[18,76],[10,63],[8,40]]);
 poly("#477253",[[19,29+bob],[52,28+bob],[58,40+bob],[57,63],[49,72],[22,72],[15,63],[14,40+bob]]);
 poly("#749662",[[25,39+bob],[47,39+bob],[54,58],[47,69],[26,69],[19,58]]);
 poly("#9eaf77",[[27,47],[47,47],[49,60],[42,67],[29,67],[24,60]]);
 // Tiny raised skin textures / dorsal markings.
 for(let i=0;i<12;i++){
   const x=18+(i*13)%38,y=38+(i*17)%23;
   p(i%3?"#3e694e":"#688c5b",x,y,2+(i%2),2+(i%3));
 }
 // Ribbed shoulder armour.
 poly("#4c4841",[[10,37+bob],[23,33+bob],[28,40+bob],[20,52],[7,50]]);
 poly("#745b48",[[49,34+bob],[60,37+bob],[65,49],[51,52],[44,40+bob]]);
 p("#ba9a65",10,42+bob,15,3);p("#bc986c",49,42+bob,13,3);
 // Oversized hands, arm movement gives visible animation even at rest.
 const ly=49+move, ry=47-move;
 poly("#203c37",[[10,42],[18,43],[14,65+move],[9,75+move],[2,73+move]]);
 poly("#203c37",[[54,43],[64,42],[69,71-move],[60,75-move],[57,60-move]]);
 poly("#5b8459",[[10,47],[17,47],[13,67+move],[6,70+move],[4,64+move]]);
 poly("#6c9462",[[55,47],[62,45],[68,67-move],[61,69-move],[58,60-move]]);
 p("#c5b07d",4,69+move,11,6);p("#c5b07d",59,68-move,11,6);
 for(let i=0;i<3;i++){
   p("#e0cf93",3+i*4,73+move,3,6);
   p("#e0cf93",60+i*4,72-move,3,6);
 }
 // Powerful broad frog head with cheeks and raised eyes.
 poly("#1b3031",[[4,27+bob],[8,17+bob],[18,12+bob],[53,12+bob],[65,18+bob],[69,34+bob],[61,43+bob],[12,43+bob],[4,36+bob]]);
 poly("#548357",[[7,26+bob],[13,17+bob],[27,15+bob],[49,15+bob],[62,20+bob],[66,32+bob],[58,39+bob],[14,39+bob],[8,34+bob]]);
 poly("#86a66a",[[14,25+bob],[27,21+bob],[48,20+bob],[59,26+bob],[58,34+bob],[16,35+bob]]);
 // Wide mouth, nostrils and glistening underlip.
 p("#29393a",14,34+bob,44,4);p("#b5b480",19,39+bob,33,3);
 p("#243532",29,28+bob,3,3);p("#243532",41,28+bob,3,3);
 // Pupil positions create eye movement; frame 4 blinks.
 const blink=frame===4;
 p("#233a39",14,20+bob,14,11);p("#233a39",47,20+bob,14,11);
 p("#c9bd82",17,21+bob,9,blink?3:8);p("#c9bd82",50,21+bob,9,blink?3:8);
 if(!blink){p("#292e36",21+(frame%2),23+bob,4,5);p("#292e36",54+(frame%2),23+bob,4,5);}
 p("#f8e6aa",17,22+bob,3,2);p("#f8e6aa",50,22+bob,3,2);
 // Ceremonial headband and horn-like crest, unmistakably tribal.
 p("#8e644b",15,14+bob,42,5);p("#d0b477",20,15+bob,34,3);
 poly("#ad7852",[[17,15+bob],[14,1+bob],[21,6+bob],[25,15+bob]]);
 poly("#b88a5e",[[47,15+bob],[53,4+bob],[59,1+bob],[57,16+bob]]);
 p("#e1c783",18,4+bob,3,8);p("#dfc17a",53,6+bob,4,7);
 p("#d8ba77",32,9+bob,9,8);
 p("#6dbcb2",35,10+bob,3,5);
 // Braided belt, medallion and body rune.
 p("#4d423b",17,63,39,7);p("#cba567",19,65,35,3);
 for(let i=0;i<7;i++)p(i%2?"#c9ae73":"#785949",21+i*5,65,3,4);
 poly("#344f50",[[36,46],[43,54],[36,62],[29,54]]);
 poly("#9fbc8b",[[36,49],[40,54],[36,59],[32,54]]);
 p("#e2d394",35,53,3,3);
 return cvs;
}
const tribalSprites=Array.from({length:6},(_,i)=>chiefAtlas(i));
drawBoss=function(){
 if(currentRoom!==1||!boss.alive||boss.defeated)return;
 ctx.save();ctx.imageSmoothingEnabled=false;
 const w=148,h=181,x=boss.x+boss.width/2-w/2,y=boss.y+boss.height-h;
 const frame=boss.state==="v9Tongue"||boss.state==="punchActive"?2:Math.floor(v9.time*6)%6;
 if(boss.hurtTimer>0)ctx.globalAlpha=.55;
 ctx.drawImage(tribalSprites[frame],Math.round(x),Math.round(y),w,h);
 ctx.globalAlpha=1;
 if(["punchTelegraph","punchActive","v9TongueWarn","v9Tongue"].includes(boss.state)){
   const attack=boss.state==="punchActive"||boss.state==="v9Tongue";
   const range=boss.state.startsWith("v9Tongue")?350:boss.punchRange;
   const originX=boss.x+boss.width/2+boss.facing*33;
   const length=attack?range:range*.34;
   const fistX=originX+boss.facing*length,armY=boss.y+37;
   ctx.fillStyle=attack?"#87ab74":"#beaa76";
   ctx.fillRect(Math.min(originX,fistX),armY,length,14);
   for(let i=0;i<length;i+=24){
     ctx.fillStyle=i%48?"#496c58":"#a7ba75";
     ctx.fillRect(Math.min(originX,fistX)+i,armY+4,12,4);
   }
   ctx.fillStyle="#3b634e";ctx.fillRect(fistX-16,armY-13,33,39);
   ctx.fillStyle="#b7bc78";ctx.fillRect(fistX-12,armY-9,25,12);
   if(!attack){
     ctx.strokeStyle="#e7b879";ctx.lineWidth=2;
     ctx.strokeRect(Math.min(originX,fistX),armY-10,length,34);
   }
 }
 ctx.restore();
};
// Legacy red test rectangle enemy becomes a beetle in the final region.
const baseDrawEnemyV9=drawEnemy;
drawEnemy=function(){
 if(currentRoom===0)return baseDrawEnemyV9();
 if(!enemy.alive)return;
 const sprite=buildSprite("besouro",Math.floor(v9.time*9)%4);
 ctx.save();ctx.imageSmoothingEnabled=false;
 if(enemy.hurtTimer>0)ctx.globalAlpha=.53;
 const flip=enemy.direction<0;
 if(flip){
   ctx.translate(enemy.x+enemy.width,enemy.y);ctx.scale(-1,1);
   ctx.drawImage(sprite,0,-12,enemy.width+16,enemy.height+24);
 }else ctx.drawImage(sprite,enemy.x-8,enemy.y-12,enemy.width+16,enemy.height+24);
 ctx.restore();
};
const hudV8=drawHUD;
drawHUD=function(){
 if(currentRoom!==1)return hudV8();
 ctx.save();
 ctx.fillStyle="rgba(7,18,23,.78)";ctx.fillRect(0,0,WIDTH,53);
 ctx.textBaseline="middle";ctx.textAlign="left";ctx.font="bold 16px sans-serif";
 ctx.fillStyle="#e6e8d8";ctx.fillText("TEMPLO DO CHEFE  •  CORRENTES",22,26);
 ctx.textAlign="right";ctx.fillStyle="#d6e9cf";ctx.font="bold 14px sans-serif";
 ctx.fillText("VIDA "+mac.hp+"/"+mac.maxHp,WIDTH-24,26);
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
 if(v9.rewardNotice&&v9.rewardNotice.life>0){
   ctx.save();
   const alpha=Math.min(1,v9.rewardNotice.life*1.6);
   ctx.globalAlpha=alpha;
   const w=Math.min(WIDTH-60,390),x=(WIDTH-w)/2;
   ctx.fillStyle="rgba(8,29,26,.88)";ctx.fillRect(x,80,w,42);
   ctx.strokeStyle="#9fdac0";ctx.lineWidth=2;ctx.strokeRect(x,80,w,42);
   ctx.fillStyle="#dbffe8";ctx.font="bold 15px sans-serif";ctx.textAlign="center";
   ctx.fillText(v9.rewardNotice.text,WIDTH/2,106);
   ctx.restore();
 }
 if(v9.fade>0){
   ctx.fillStyle="rgba(5,16,19,"+Math.min(.38,v9.fade*1.5)+")";
   ctx.fillRect(0,0,WIDTH,HEIGHT);
 }
};
})();
