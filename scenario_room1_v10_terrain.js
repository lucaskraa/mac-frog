// MAC FROG V10: original authored-look pixel environment tiles.
// 7 palettes × 4 materials × 4 tile variants; cached, true pixel-scale textures.
// Visual geometry ONLY: NEVER creates/removes any solid, ledge, door or physics entity.
(function installMacFrogV10Terrain(){
"use strict";
const TS=64, cache=new Map();
const licensed=new Image();
licensed.decoding="async";
let licensedReady=false;
licensed.onload=()=>{licensedReady=true;A1.roomCacheDirty=true;};
licensed.onerror=()=>console.warn("V10 CC0 swamp vegetation tile atlas missing; fall back to original procedural pixels");
fetch("./assets/gothicvania-swamp/tileset.b64",{cache:"force-cache"})
 .then(r=>{if(!r.ok)throw Error("Missing swamp pixel atlas "+r.status);return r.text();})
 .then(base64=>licensed.src="data:image/png;base64,"+base64.trim().replace(/\s+/g,""))
 .catch(e=>console.warn("V10 optional CC0 vegetation:",e));
const PALETTES={
  mangue:{rock:["#202a29","#35433c","#536052","#79816a","#b2ad76"],soil:["#201d20","#45392f","#62503b","#85714b","#c1b874"],leaf:["#31593a","#557c4a","#98aa55","#c6ce74"],glow:"#e4b46d",sky:"#0d2625"},
  raizes:{rock:["#1d2c29","#34483b","#4a5d48","#758566","#b0b68b"],soil:["#271e20","#463a2d","#635137","#8d6a40","#c5a86f"],leaf:["#244f37","#46764a","#87ab6b","#d0d995"],glow:"#b7df90",sky:"#0d2924"},
  cripta:{rock:["#181f2b","#343444","#54536a","#8b808a","#b0aaad"],soil:["#25232c","#443947","#665260","#99807d","#c0a99d"],leaf:["#344759","#53726f","#739585","#b5cbb2"],glow:"#b2a0cc",sky:"#121626"},
  abismo:{rock:["#152632","#274552","#45616a","#6f9297","#b9d0c4"],soil:["#182b31","#284a4c","#426966","#70a1a0","#a2d9ce"],leaf:["#21525a","#3c8182","#69b6ae","#b2ece0"],glow:"#68d9e3",sky:"#081b2c"},
  ruinas:{rock:["#1a2e34","#34515a","#576a68","#8c9784","#c8b990"],soil:["#292725","#463d36","#735c44","#ac8960","#d8bc85"],leaf:["#2b5a46","#4b7e5d","#8da46c","#c4c886"],glow:"#dfb27d",sky:"#0f2532"},
  aqueduto:{rock:["#15353c","#2e5660","#4d7b7e","#85b7ab","#c4d7bd"],soil:["#273339","#3f5251","#5b7770","#8bb8a1","#bfddd3"],leaf:["#2e5d5b","#478f7c","#7fc3a1","#cbebcf"],glow:"#a0e5c9",sky:"#0e2b33"},
  templo:{rock:["#2b272f","#574841","#836950","#b6a077","#ead2a2"],soil:["#2e2a25","#524132","#7a5838","#b18753","#edc685"],leaf:["#545d3a","#798054","#a4ab69","#c8ce8b"],glow:"#efbd76",sky:"#27232c"}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function rng(seed){
 let n=seed>>>0;
 return ()=>{n=(Math.imul(n^n>>>15,1|n)+0x6D2B79F5)>>>0;let z=n;z=Math.imul(z^(z>>>7),61|z);return ((z^(z>>>14))>>>0)/4294967296;};
}
function rect(c,col,x,y,w,h){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function polygon(c,pts,col){
 c.fillStyle=col;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
 c.closePath();c.fill();
}
function line(c,col,pts,width=2){
 c.strokeStyle=col;c.lineWidth=width;c.lineCap="square";c.lineJoin="miter";
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
 c.stroke();
}
function makeTile(theme,material,variant,top=false){
 const key=[theme,material,variant,top?"top":"body"].join("/");
 if(cache.has(key))return cache.get(key);
 const p=PALETTES[theme]||PALETTES.ruinas,cvs=document.createElement("canvas");
 cvs.width=TS;cvs.height=TS;
 const c=cvs.getContext("2d");c.imageSmoothingEnabled=false;
 const r=rng(1517+variant*419+material.length*83+theme.length*263);
 const stone=material==="wood"?p.soil:p.rock,leaf=p.leaf;
 rect(c,stone[0],0,0,TS,TS);
 if(material==="wood"){
   // Battered timber: alternating end grain, aged slats, dark joints and nails.
   rect(c,stone[1],0,0,64,64);
   for(let j=0;j<4;j++){
     const y=j*17,offset=(j+variant)%2?8:0;
     rect(c,stone[3],offset,y+1,64-offset,3);
     rect(c,stone[2],0,y+4,64,11);
     rect(c,stone[0],0,y+14,64,3);
     for(let x=offset-29;x<64;x+=31){
       rect(c,stone[0],x,y+2,3,11);
       rect(c,stone[4],x+7,y+6,2,2);
       rect(c,stone[0],x+8,y+7,1,1);
       if(r()>.5)line(c,stone[1],[[x+12,y+9],[x+25,y+9],[x+27,y+10]],2);
     }
   }
   for(let j=0;j<8;j++){
     const x=Math.floor(r()*60),y=Math.floor(r()*60);
     rect(c,stone[r()>.52?3:1],x,y,3+Math.floor(r()*7),2);
   }
 }else{
   // Staggered, hand-chipped masonry or earthy irregular boulders.
   rect(c,stone[1],0,0,TS,TS);
   for(let row=0;row<4;row++){
     const sy=row*17+(variant%2?3:0);
     const offset=(row+variant)%2?19:-15;
     for(let x=offset;x<64;x+=32){
       const by=sy+2+Math.floor(r()*2);
       const pts=[[x+3,by],[x+26,by],[x+30,by+3],[x+29,by+13],[x+23,by+15],[x+1,by+14],[x-2,by+9]];
       polygon(c,pts,stone[2+Math.floor(r()*2)]);
       rect(c,stone[4],x+5,by+1,17,2);
       rect(c,stone[0],x+24,by+7,5,6);
       if(r()>.51)line(c,stone[1],[[x+11,by+3],[x+15,by+7],[x+13,by+10],[x+16,by+13]],1);
       if(r()>.8)rect(c,stone[0],x+6,by+7,6,4);
     }
     rect(c,stone[0],0,sy+16,64,2);
   }
   for(let j=0;j<15;j++){
     const x=Math.floor(r()*64),y=Math.floor(r()*62);
     rect(c,r()>.4?stone[3]:stone[0],x,y,1+Math.floor(r()*3),1+Math.floor(r()*2));
   }
 }
 if(material==="moss"||material==="earth"){
   // Tufts grow in rock joints and never resemble a flat green outline.
   for(let k=0;k<14;k++){
     const x=Math.floor(r()*62),y=Math.floor(r()*58);
     rect(c,leaf[k%3],x,y,3+Math.floor(r()*6),2+Math.floor(r()*3));
     if(k%4===0){rect(c,leaf[0],x+2,y+3,2,5+Math.floor(r()*7));rect(c,leaf[1],x+1,y+5,1,4);}
   }
 }
 if(material==="shrine"){
   // Original frog-ruin motifs: carved medallions and repeating cross marks.
   for(let x=9;x<64;x+=35){
     rect(c,stone[0],x,18,23,27);
     rect(c,stone[4],x+2,20,19,2);
     rect(c,stone[3],x+5,25,4,6);rect(c,stone[3],x+14,25,4,6);
     rect(c,stone[1],x+9,34,5,4);rect(c,stone[4],x+6,38,12,2);
   }
 }
 if(top){
   // Upper 15 pixels painted separately. Small sprouts and trailing moss, not a uniform grass cap.
   rect(c,stone[0],0,0,64,18);
   rect(c,stone[4],0,0,64,3);
   rect(c,stone[2],0,3,64,8);
   rect(c,stone[1],0,11,64,7);
   for(let k=0;k<14;k++){
     const x=Math.floor(r()*61),h=3+Math.floor(r()*9);
     rect(c,leaf[k%3],x,3,2,h);
     if(k%3===0){rect(c,leaf[2],x-2,1,5,3);rect(c,leaf[1],x+1,11,2,7+Math.floor(r()*7));}
   }
   for(let k=0;k<7;k++){
     const x=Math.floor(r()*58);
     rect(c,stone[4],x,8,2,2);
   }
   if(material==="wood"){
     for(let x=11;x<64;x+=29){rect(c,"#322726",x,1,3,12);rect(c,stone[4],x+1,3,2,2);}
   }
 }
 cache.set(key,cvs);
 return cvs;
}
function drawTileRange(c,source,x,y,width,height){
 for(let xx=x;xx<x+width;xx+=TS){
   for(let yy=y;yy<y+height;yy+=TS){
     const w=Math.min(TS,x+width-xx),h=Math.min(TS,y+height-yy);
     c.drawImage(source,0,0,w,h,xx,yy,w,h);
   }
 }
}
function paintTerrain(c,r,material,room,seed){
 if(!r||r.width<=0||r.height<=0)return;
 const theme=room.v9Theme||"ruinas",p=PALETTES[theme]||PALETTES.ruinas;
 const kind=material==="wood"?"wood":material==="shrine"?"shrine":material==="moss"?"moss":"earth";
 c.save();c.beginPath();c.rect(r.x,r.y,r.width,r.height);c.clip();
 for(let dx=0;dx<r.width;dx+=TS){
  const i=Math.floor(dx/TS),w=Math.min(TS,r.width-dx);
  for(let dy=0;dy<r.height;dy+=TS){
   const j=Math.floor(dy/TS),h=Math.min(TS,r.height-dy);
   const variant=Math.abs((seed+i*7+j*13)%4);
   const tile=makeTile(theme,kind,variant,false);
   c.drawImage(tile,0,0,w,h,r.x+dx,r.y+dy,w,h);
  }
  const tile=makeTile(theme,kind,Math.abs((seed+i*11)%4),true);
  c.drawImage(tile,0,0,w,21,r.x+dx,r.y,w,21);
 }
 // Solid side caps distinguish floating ledges from block boundaries.
 rect(c,p.rock[0],r.x,r.y,5,r.height);
 rect(c,p.rock[0],r.x+r.width-5,r.y,5,r.height);
 rect(c,p.rock[4],r.x+5,r.y+5,2,Math.min(14,r.height-7));
 rect(c,p.rock[3],r.x+r.width-9,r.y+5,2,Math.min(14,r.height-7));
 if(r.height<55){
  // Graded weight: shadow lip is decorative, not a new collider.
  rect(c,p.rock[0],r.x,r.y+r.height-4,r.width,4);
  for(let x=r.x+12;x<r.x+r.width;x+=51){
   const length=12+Math.abs(seed+x|0)%16;
   rect(c,p.soil[1],x,r.y+15,7,Math.min(r.height-19,length));
  }
 }
 c.restore();
 if(r.height<48){
  // Hanging roots outside the collision shape, no solid physics.
  const rootSeed=rng(seed*37+room.width+(r.x|0));
  for(let x=r.x+26;x<r.x+r.width-18;x+=42){
   if(rootSeed()>.45){
    const length=19+Math.floor(rootSeed()*26);
    line(c,p.leaf[0],[[x,r.y+r.height-1],[x+3,r.y+r.height+length*.46],[x-2,r.y+r.height+length]],3);
    rect(c,p.leaf[2],x-2,r.y+r.height+length-3,4,3);
   }
  }
 }
}
function sculptColumn(c,x,base,height,p,seed){
 const r=rng(seed);
 c.save();c.globalAlpha=.24;
 const material=p.rock;
 polygon(c,[[x-22,base],[x-25,base-height+17],[x-14,base-height],[x+26,base-height],[x+31,base-height+17],[x+31,base]],material[1]);
 for(let yy=base-height+22;yy<base-20;yy+=37){
  rect(c,material[0],x-19,yy,50,4);
  rect(c,material[4],x-15,yy+3,42,2);
  rect(c,material[2],x-12,yy+7,38,23);
  for(let j=0;j<2;j++){rect(c,material[0],x-5+j*24,yy+10,3,19);}
 }
 rect(c,material[0],x-36,base-height-12,79,14);
 rect(c,material[3],x-30,base-height-10,66,3);
 rect(c,material[0],x-39,base-height+14,83,9);
 c.restore();
}
function sculptRoot(c,x,y,height,p,seed){
 const r=rng(seed);
 c.save();c.globalAlpha=.42;
 for(let i=0;i<3;i++){
  const xx=x+i*22;
  line(c,p.soil[0],[[xx,y+height],[xx-17,y+height*.78],[xx+18,y+height*.35],[xx+7,y]],17-i*4);
  line(c,p.soil[2],[[xx-6,y+height],[xx-20,y+height*.75],[xx+14,y+height*.32],[xx+3,y]],5);
  for(let j=0;j<4;j++){
   const xx2=xx+10+j%2*16,yy=y+height*.24+j*29;
   line(c,p.leaf[0],[[xx2,yy],[xx2+23+r()*19,yy-21],[xx2+32,yy-57]],4);
   rect(c,p.leaf[1],xx2+18,yy-30,9,5);
  }
 }
 c.restore();
}
function frogRelief(c,x,y,p){
 // Recessed frog guardian mask in four values: eyes, cheeks, throat, and crest.
 c.save();c.globalAlpha=.28;
 rect(c,p.rock[0],x,y,58,52);
 rect(c,p.rock[3],x+4,y+5,50,43);
 rect(c,p.rock[1],x+7,y+9,44,36);
 rect(c,p.rock[4],x+10,y+13,12,9);rect(c,p.rock[4],x+36,y+13,12,9);
 rect(c,p.rock[0],x+15,y+14,5,5);rect(c,p.rock[0],x+39,y+14,5,5);
 rect(c,p.rock[3],x+21,y+26,18,7);
 rect(c,p.rock[0],x+17,y+37,29,5);
 c.restore();
}
function vignetteProps(c,room,p){
 const W=room.width,H=room.height,seed=room.v9Seed||111;
 const forest=room.v9Theme==="mangue"||room.v9Theme==="raizes";
 for(let x=275;x<W;x+=495){
  const h=Math.min(H-320,350+((x*7+seed)%150));
  if(forest)sculptRoot(c,x,H-h-90,h,p,seed+x);
  else sculptColumn(c,x,H-90,h,p,seed+x);
  if(!forest&&x%3===2)frogRelief(c,x+65,Math.min(H-200,250),p);
 }
 // Directional lanterns indicate pathways without overpowering gameplay.
 for(let x=405;x<W;x+=710){
  const y=clamp(285+(x+seed)%225,160,H-300);
  c.save();c.globalAlpha=.36;
  line(c,p.rock[1],[[x,y-90],[x,y-24]],4);
  rect(c,p.rock[0],x-17,y-24,34,10);
  rect(c,p.rock[3],x-11,y-14,22,30);
  rect(c,p.glow,x-6,y-9,12,17);
  rect(c,"#f2dec0",x-2,y-8,4,9);
  rect(c,p.rock[0],x-16,y+16,32,7);
  c.restore();
 }
}
function drawDoorFrame(c,room,e,p){
 const theme=room.v9Theme;
 c.save();
 const open=!(e.requiresWater&&!mac.waterPower);
 const col=open?p.rock[3]:p.glow;
 if(e.side==="left"||e.side==="right"){
  const xx=e.side==="left"?0:room.width-45, yy=e.from-12;
  rect(c,p.rock[0],xx,yy,48,e.to-e.from+22);
  rect(c,p.rock[2],xx+5,yy+6,38,e.to-e.from+10);
  rect(c,p.sky,xx+12,yy+20,24,e.to-e.from-16);
  rect(c,col,xx+7,yy+12,4,e.to-e.from);
  rect(c,p.rock[4],xx+9,yy+6,29,5);
  for(let y=yy+40;y<yy+e.to-e.from;y+=46){
   if(!open)rect(c,p.glow,xx+15,y,20,4);
  }
 }else if(e.side==="top"){
  const x=e.from,y=0,w=e.to-e.from;
  rect(c,p.rock[0],x,0,w,36);
  rect(c,p.rock[3],x+8,0,w-16,6);
  rect(c,p.sky,x+17,6,w-34,24);
 }else if(e.side==="bottom"&&room.v9Shaft){
  const shaft=room.v9Shaft,y=room.height-96;
  rect(c,p.rock[0],shaft.x-12,y,12,96);
  rect(c,p.rock[0],shaft.x+shaft.width,y,12,96);
  rect(c,p.rock[4],shaft.x-12,y,shaft.width+24,6);
  rect(c,p.sky,shaft.x+5,y+10,shaft.width-10,86);
  // Thin descending guide lines, visually distinct from an ordinary hazard pit.
  for(let i=0;i<5;i++){
   rect(c,p.leaf[i%3],shaft.x+18+i*82,y+12,3,20+(i%2)*17);
  }
  if(!open)rect(c,p.glow,shaft.x+10,y+60,shaft.width-20,5);
 }
 c.restore();
}
const pixelMotifs=new Image();let pixelMotifsReady=false;
pixelMotifs.decoding="async";
pixelMotifs.onload=()=>{pixelMotifsReady=true;A1.roomCacheDirty=true;};
pixelMotifs.onerror=()=>console.warn("V10 authored pixel-art motif PNG failed to decode");
pixelMotifs.src="data:image/png;base64,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";
function paintMotifs(c,room,p){
 if(!pixelMotifsReady)return;
 const count=Math.max(1,Math.ceil(room.width/900));
 const choice=room.v9Theme==="mangue"?[0,3,10]:
  room.v9Theme==="raizes"?[3,10,0]:
  room.v9Theme==="templo"?[1,6,9]:
  room.v9Theme==="cripta"?[4,6,8]:
  room.v9Theme==="aqueduto"?[9,6,2]:
  room.v9Theme==="abismo"?[8,10,11]:[6,11,9];
 for(let i=0;i<count;i++){
  const index=choice[(i+room.v9Seed)%choice.length],x=280+i*850;
  const y=clamp(room.height-730-((i*17+room.v9Seed)%180),210,room.height-350);
  const boxW=286,boxH=288;
  c.save();
  c.globalAlpha=.27;
  // Architectural masonry window: generated scene art has a real clipping boundary
  // rather than a rectangle pasted directly onto a gameplay platform.
  c.beginPath();c.moveTo(x,y+boxH);c.lineTo(x,y+62);
  c.quadraticCurveTo(x+boxW/2,y-35,x+boxW,y+62);
  c.lineTo(x+boxW,y+boxH);c.closePath();c.clip();
  c.drawImage(pixelMotifs,(index%4)*20,Math.floor(index/4)*20,20,20,x,y,boxW,boxH);
  c.restore();
  c.save();c.globalAlpha=.33;
  c.strokeStyle=p.rock[3];c.lineWidth=12;
  c.beginPath();c.moveTo(x,y+boxH);c.lineTo(x,y+62);
  c.quadraticCurveTo(x+boxW/2,y-35,x+boxW,y+62);
  c.lineTo(x+boxW,y+boxH);c.stroke();
  c.restore();
 }
}
const original=a1BuildRoomCache;
a1BuildRoomCache=function(){
 const r=A1.rooms[A1.node],c=A1.roomCacheCtx;
 if(!r||!c)return original();
 const p=PALETTES[r.v9Theme]||PALETTES.ruinas;
 const seed=r.v9Seed||r.width*17;
 c.clearRect(0,0,r.width,r.height);c.imageSmoothingEnabled=false;
 vignetteProps(c,r,p);
 paintMotifs(c,r,p);
 for(const wall of r.walls)paintTerrain(c,wall,"shrine",r,seed);
 for(const floor of r.floors)paintTerrain(c,floor,"moss",r,seed+floor.x);
 for(const platform of r.platforms) {
  const mat=platform.style==="wood"?"wood":platform.style==="shrine"?"shrine":
    platform.style==="moss"?"moss":"stone";
  paintTerrain(c,platform,mat,r,seed+platform.x+(platform.y|0));
 }
 // Actual CC0 pixel source adds carefully spaced fern and lichen clusters.
 // This augments the original authored pixels instead of using a stretched image
 // as a complete platform; only a few plants grow from broad surfaces.
 if(licensedReady){
  c.save();c.imageSmoothingEnabled=false;
  for(const [index,platform] of [...r.platforms,...r.floors].entries()){
   if(platform.width<180)continue;
   const count=Math.max(1,Math.floor(platform.width/340));
   for(let n=0;n<count;n++){
    const x=platform.x+75+n*(platform.width-130)/count;
    const y=platform.y-28;
    if((seed+index+n)%4===0) {
     c.globalAlpha=.80;
     c.drawImage(licensed,0,71,68,36,x,y,67,37);
    }else if((seed+index+n)%5===0){
     c.globalAlpha=.65;
     c.drawImage(licensed,152,72,57,39,x,y-3,64,43);
    }
   }
  }
  if(r.v9Theme==="templo"||r.v9Theme==="cripta"){
   // Reliefs are embedded in non-colliding background walls only.
   c.globalAlpha=.26;
   for(let x=650;x<r.width-100;x+=1100){
    c.drawImage(licensed,112,0,96,67,x,190,192,134);
   }
  }
  c.restore();
 }
 if(r.v9Shaft){
  const down=r.exits.find(e=>e.side==="bottom");
  if(down)drawDoorFrame(c,r,down,p);
 }
 for(const e of r.exits){
  if(e.side!=="bottom")drawDoorFrame(c,r,e,p);
 }
 A1.roomCacheDirty=false;
};
A1.roomCacheDirty=true;
window.MacFrogV10Terrain=Object.freeze({
 version:"10.1",themes:Object.keys(PALETTES),materials:["stone","wood","moss","shrine"],
 textureCount:()=>cache.size,licensedPixelsReady:()=>licensedReady,motifsReady:()=>pixelMotifsReady,
 validate:()=>({ok:Object.keys(PALETTES).length===7,variants:4,pixelTileSize:TS})
});
})();