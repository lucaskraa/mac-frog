// Mac Frog V10 — layered swamp parallax combining existing CC0 2D pixel assets
// with V10's new material-specific terrain and generated original ruin motifs.
// Assets by Ansimuz / Luis Zuno, GothicVania Swamp, CC0 1.0.
// World rendering only, never alters physics, collision, combat or camera state.
(function installV10SwampParallax(){
"use strict";
const defs=[
 {key:"background",speed:.03,scale:4.0,alpha:.91,offset:0},
 {key:"mid-layer-02",speed:.07,scale:3.2,alpha:.29,offset:70},
 {key:"mid-layer-01",speed:.13,scale:3.2,alpha:.27,offset:50},
 {key:"trees",speed:.22,scale:3.1,alpha:.62,offset:58}
];
const sprites=new Map();
for(const d of defs){
 const img=new Image();img.decoding="async";
 img.onload=()=>sprites.set(d.key,img);
 img.onerror=()=>console.warn("V10 pixel parallax file failed",d.key);
 fetch("./assets/gothicvania-swamp/"+d.key+".b64",{cache:"force-cache"})
  .then(r=>r.ok?r.text():Promise.reject(Error(r.status+" "+d.key)))
  .then(b64=>img.src="data:image/png;base64,"+b64.trim().replace(/\s+/g,""))
  .catch(e=>console.warn("V10 CC0 pixel parallax load",d.key,e));
}
const old=a1DrawParallax;
const colors={
 mangue:["#122b25","#274634","#436f4c","#7ca56a"],
 raizes:["#0b2425","#1a4d35","#456d4b","#7fac60"]
};
function parallaxLayer(img,opts,opacity,theme){
 if(!img?.naturalWidth||!img?.naturalHeight)return;
 const scale=opts.scale,
  width=img.naturalWidth*scale,
  height=img.naturalHeight*scale,
  off=((camera.x*opts.speed)%width+width)%width;
 // Height's excess is cropped naturally by the Canvas viewport.
 const baseY=HEIGHT-height+opts.offset-(camera.y||0)*opts.speed*.14;
 ctx.globalAlpha=opts.alpha*opacity;
 for(let x=-width-off;x<WIDTH+width;x+=width){
  ctx.drawImage(img,Math.round(x),Math.round(baseY),Math.ceil(width),Math.ceil(height));
 }
}
a1DrawParallax=function(){
 const room=A1.rooms[A1.node];
 if(!room||!(room.v9Theme in colors)||!sprites.has("background")){old();return;}
 const pal=colors[room.v9Theme],dark=room.v9Theme==="raizes"?.83:1;
 ctx.save();ctx.imageSmoothingEnabled=false;
 const g=ctx.createLinearGradient(0,0,0,HEIGHT);
 g.addColorStop(0,pal[0]);g.addColorStop(.72,pal[1]);g.addColorStop(1,"#0d1f1b");
 ctx.fillStyle=g;ctx.fillRect(0,0,WIDTH,HEIGHT);
 for(const d of defs)parallaxLayer(sprites.get(d.key),d,dark,room.v9Theme);
 // Cool foreground haze lets silhouettes pop without flattening pixel details.
 const haze=ctx.createLinearGradient(0,0,0,HEIGHT);
 haze.addColorStop(0,"rgba(1,14,15,.22)");
 haze.addColorStop(.5,"rgba(3,23,17,.08)");
 haze.addColorStop(1,"rgba(2,12,13,.31)");
 ctx.globalAlpha=1;ctx.fillStyle=haze;ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.restore();
};
window.MacFrogV10Parallax=Object.freeze({
 assets:()=>[...sprites.keys()],
 ready:()=>sprites.size===defs.length,
 license:"CC0 1.0 / Ansimuz GothicVania Swamp",
 themes:["mangue","raizes"]
});
})();