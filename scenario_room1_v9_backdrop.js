// MAC FROG V9 — original pixel-environment backdrop, cached at native low resolution.
// Replaces only the V9 blocky parallax. All gameplay collision and sprite systems untouched.
(function installV9Backdrop(){
"use strict";
const palettes={
  mangue:{sky:["#112725","#28473c"],far:"#253f39",mid:"#1b332e",near:"#122924",light:"#8eba84",accent:"#ca9760"},
  raizes:{sky:["#0d2928","#264a3b"],far:"#29463b",mid:"#1a352f",near:"#122b28",light:"#91b97a",accent:"#a7d89b"},
  cripta:{sky:["#191c2b","#393445"],far:"#36364a",mid:"#272b3b",near:"#1b2332",light:"#a59bc0",accent:"#c0a275"},
  abismo:{sky:["#0b1b2c","#1e3e52"],far:"#25495a",mid:"#173346",near:"#102636",light:"#75c1ca",accent:"#83d8c7"},
  ruinas:{sky:["#112533","#324a51"],far:"#2b4a4e",mid:"#203b42",near:"#152c34",light:"#a2c1a3",accent:"#c7ac78"},
  aqueduto:{sky:["#0d2730","#2a5860"],far:"#28545c",mid:"#1c414a",near:"#143139",light:"#77c7ca",accent:"#bdd1a6"},
  templo:{sky:["#27242e","#58483c"],far:"#554a48",mid:"#403a3e",near:"#282c33",light:"#d5b88b",accent:"#e0bd78"}
};
const W=510,H=295,SCALE=3,cache=new Map();
function rand(n){n=(n|0)^0x9e3779b9;n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return ((n^(n>>>16))>>>0)/4294967296;}
function fillPoly(c,points,color){
  c.fillStyle=color;c.beginPath();c.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);
  c.closePath();c.fill();
}
function pixelRoot(c,x,y,depth,thickness,seed,color){
  c.save();c.strokeStyle=color;c.lineCap="square";c.lineWidth=thickness;
  c.beginPath();c.moveTo(x,y);
  c.bezierCurveTo(x-15-depth*.2,y-depth*.32,x+depth*.28,y-depth*.64,x+depth*.18,y-depth);
  c.stroke();
  c.lineWidth=Math.max(2,thickness*.47);
  for(let k=0;k<4;k++){
    const high=y-depth*(.28+k*.17),xx=x+depth*.18*(.25+k*.22);
    const direction=k%2?-1:1;
    c.beginPath();c.moveTo(xx,high);c.quadraticCurveTo(xx+direction*16,high-13,xx+direction*(32+seed%18),high-32-k*4);c.stroke();
    if(k%2===0){
      // Leaf islands are intentionally blocky at low resolution.
      c.fillStyle=color;
      for(let j=0;j<9;j++){
        const lx=xx+direction*(18+j%5*6),ly=high-32-k*4+(j%3)*3;
        c.fillRect(Math.floor(lx),Math.floor(ly),4+(j%3)*2,3+(j%2)*3);
      }
    }
  }
  c.restore();
}
function ruin(c,x,base,height,p,layer,seed){
  const width=36+seed%34;
  c.fillStyle=p;c.fillRect(x,base-height,width,height);
  c.fillRect(x-5,base-height+12,width+10,7);
  c.fillRect(x-7,base-height+26,width+14,5);
  c.fillRect(x+4,base-height-13,width-8,16);
  // Arch and recessed windows; no accidental overlap with gameplay colliders.
  c.fillStyle=layer===0?"rgba(6,17,28,.22)":"rgba(5,15,23,.55)";
  for(let row=0;row<3;row++){
    const wy=base-height+39+row*47;
    if(wy+30>base)break;
    c.fillRect(x+11,wy,15,25);
    c.fillRect(x+14,wy-5,9,7);
    if(width>52)c.fillRect(x+width-25,wy+6,10,20);
  }
  c.fillStyle=layer===0?"rgba(182,198,181,.08)":"rgba(186,200,180,.12)";
  for(let j=0;j<9;j++){
    const yy=base-height+17+j*23;
    if(yy>=base)break;
    c.fillRect(x+(j%3)*12,yy,19,2);
  }
}
function cave(c,x,base,h,p,seed,layer){
  fillPoly(c,[[x,base],[x+18,base-h*.50],[x+39,base-h],[x+52,base-h*.72],
    [x+74,base-h*.84],[x+98,base-h*.30],[x+113,base]],p);
  c.fillStyle=layer===0?"rgba(126,185,175,.09)":"rgba(8,20,29,.26)";
  c.fillRect(x+48,base-h*.54,11,24);
}
function drawLantern(c,x,y,p,layer){
  c.fillStyle=layer===0?"rgba(232,181,109,.08)":"rgba(231,179,115,.26)";
  c.fillRect(x-10,y-10,26,25);
  c.fillStyle=p.accent;c.fillRect(x,y,7,11);
  c.fillStyle="#fff0bd";c.fillRect(x+2,y+1,3,4);
  c.fillStyle="#342e2d";c.fillRect(x-3,y-4,13,3);c.fillRect(x-3,y+11,13,2);
}
function paintLow(theme,layer){
  const p=palettes[theme]||palettes.ruinas;
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;
  const c=cv.getContext("2d");c.imageSmoothingEnabled=false;
  const g=c.createLinearGradient(0,0,0,H);
  const bg=layer===0?p.sky:layer===1?[p.sky[0],p.far]:[p.sky[0],p.mid];
  g.addColorStop(0,bg[0]);g.addColorStop(1,bg[1]);
  c.fillStyle=g;c.fillRect(0,0,W,H);
  if(layer===0){
    // Soft light shafts, distant overcast and bands of mist built into the pixel layer.
    c.fillStyle="rgba(191,223,195,.045)";
    fillPoly(c,[[W*.56,0],[W*.66,0],[W*.95,H],[W*.77,H]],"rgba(197,234,198,.05)");
    fillPoly(c,[[W*.12,0],[W*.19,0],[W*.39,H],[W*.29,H]],"rgba(174,224,206,.04)");
  }
  const fg=layer===0?p.far:layer===1?p.mid:p.near;
  const base=H+(layer===0?60:layer===1?32:10);
  const density=theme==="mangue"||theme==="raizes"?93:104;
  for(let i=-2;i<Math.ceil(W/density)+2;i++){
    const x=i*density+((i*17+layer*21)%29);
    const seed=Math.floor(rand(i*47+layer*219+theme.length*381)*1000);
    const h=layer===0?84+seed%105:layer===1?120+seed%126:145+seed%110;
    if(["mangue","raizes"].includes(theme)){
      pixelRoot(c,x+45,base,h,(layer===2?15:layer===1?12:9),seed,fg);
      c.fillStyle=fg;
      // Interlaced mangrove canopy instead of crude rectangular tree crowns.
      for(let j=0;j<18;j++){
        const xx=x+((j*29+seed)%117)-11,yy=base-h-40+((j*17+seed)%53);
        c.fillRect(xx,yy,12+(j%3)*4,6+(j%2)*5);
      }
      c.strokeStyle=fg;c.lineWidth=2;
      for(let j=0;j<4;j++){
        const vx=x+26+j*19,top=base-h*.85+j%2*14;
        c.beginPath();c.moveTo(vx,top);c.lineTo(vx-3,top+32+j*9);c.stroke();
      }
    }else if(["abismo","aqueduto"].includes(theme)){
      cave(c,x,base,h,fg,seed,layer);
      if(theme==="aqueduto"&&layer>0){
        c.strokeStyle=p.light;c.globalAlpha=.18;c.lineWidth=3;
        c.beginPath();c.arc(x+43,base-h*.42,26,Math.PI,2*Math.PI);c.stroke();
        c.globalAlpha=1;
      }
    }else{
      ruin(c,x+5,base,h,fg,layer,seed);
      if(layer>=1&&i%2===0){
        c.strokeStyle=fg;c.lineWidth=5;c.beginPath();
        c.moveTo(x+70,base-h*.32);c.quadraticCurveTo(x+112,base-h*.70,x+93,base-h*.95);c.stroke();
      }
    }
  }
  // The near layer is a foreground framing element, never solid collision geometry.
  if(layer===2){
    c.fillStyle="rgba(4,12,17,.32)";
    for(let i=0;i<18;i++){
      const x=(i*37+23)%W,y=H-20+(i%3)*7;
      c.fillRect(x,y,7+(i%3)*9,2+(i%2)*7);
    }
  }
  if(["mangue","cripta","templo"].includes(theme)){
    for(let i=0;i<4;i++){
      const x=(57+i*131+theme.length*11)%W;
      const y=H-84-((i*47)%89);
      drawLantern(c,x,y,p,layer);
    }
  }
  // Floating spores / dust. Small enough not to obscure sprites in the foreground.
  c.fillStyle=p.light;c.globalAlpha=layer===2?.24:layer===1?.13:.08;
  for(let i=0;i<26;i++){
    const x=Math.floor(rand(i*333+theme.length*23+layer*31)*W);
    const y=Math.floor(rand(i*778+theme.length*61+layer*41)*H);
    c.fillRect(x,y,i%4===0?2:1,i%5===0?2:1);
  }
  c.globalAlpha=1;
  return cv;
}
function getLayer(theme,layer){
  const key=theme+":"+layer;
  if(!cache.has(key))cache.set(key,paintLow(theme,layer));
  return cache.get(key);
}
const previousParallax=a1DrawParallax;
a1DrawParallax=function(){
  const room=A1.rooms[A1.node];
  if(!room){previousParallax();return;}
  const theme=room.v9Theme||"ruinas";
  ctx.save();
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle=(palettes[theme]||palettes.ruinas).sky[0];
  ctx.fillRect(0,0,WIDTH,HEIGHT);
  for(let layer=0;layer<3;layer++){
    const source=getLayer(theme,layer);
    const tw=source.width*SCALE,th=source.height*SCALE;
    const speed=[.035,.12,.24][layer];
    const scroll=((camera.x*speed)%tw+tw)%tw;
    const vertical=Math.round((camera.y||0)*[.02,.05,.09][layer]);
    const y=HEIGHT-th+125-vertical;
    ctx.globalAlpha=[.84,.66,.43][layer];
    for(let x=-scroll-tw;x<WIDTH+tw;x+=tw)ctx.drawImage(source,Math.round(x),y,tw,th);
  }
  ctx.restore();
};
window.MacFrogV9Backdrop=Object.freeze({
  themes:Object.keys(palettes), layers:3, size:{width:W,height:H,scale:SCALE}
});
})();