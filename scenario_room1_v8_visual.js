// Mac Frog V8: procedural scene while original pixel character sprites remain loaded.
// Rendering is separate from collision and world layout for future tileset replacement.
(function installV8Visuals(){
  "use strict";
  const rooms=A1.rooms;
  function rect(c,r,ledge,colors) {
    c.save();c.beginPath();c.rect(r.x,r.y,r.width,r.height);c.clip();
    c.fillStyle=ledge?"#535049":colors[2];c.fillRect(r.x,r.y,r.width,r.height);
    c.fillStyle=ledge?"#ac9e7b":colors[3];c.fillRect(r.x,r.y,r.width,8);
    c.fillStyle="rgba(0,9,16,.17)";c.fillRect(r.x,r.y+12,r.width,r.height-12);
    c.strokeStyle="rgba(199,222,208,.14)";c.lineWidth=2;
    for(let y=r.y+32;y<r.y+r.height;y+=39){
      c.beginPath();c.moveTo(r.x,y);c.lineTo(r.x+r.width,y);c.stroke();
      for(let x=r.x+((y/39|0)%2)*38;x<r.x+r.width;x+=91) {
        c.beginPath();c.moveTo(x,y);c.lineTo(x,y+28);c.stroke();
      }
    }
    if(ledge&&r.width>80) {
      c.fillStyle="rgba(62,126,88,.32)";
      for(let x=r.x+18;x<r.x+r.width;x+=54)c.fillRect(x,r.y+9,4,14);
    }
    c.restore();
  }
  a1DrawParallax=function(){
    const room=rooms[A1.node];const p=room.biome;
    const grd=ctx.createLinearGradient(0,0,0,HEIGHT);
    grd.addColorStop(0,p[0]);grd.addColorStop(1,p[1]);
    ctx.fillStyle=grd;ctx.fillRect(0,0,WIDTH,HEIGHT);
    ctx.save();
    ctx.fillStyle="rgba(1,9,14,.20)";
    const shift=(camera.x*.18)%275;
    for(let i=-1;i<WIDTH/275+3;i++){
      const x=Math.round(i*275-shift);
      ctx.fillRect(x,0,31,HEIGHT);
      ctx.fillRect(x-23,HEIGHT*.17,83,20);
      if(room.zone==="red"||room.zone==="green"){
        ctx.lineWidth=12;ctx.strokeStyle="#1b352b";ctx.beginPath();
        ctx.moveTo(x,0);ctx.quadraticCurveTo(x+105,HEIGHT*.35,x-12,HEIGHT*.67);ctx.stroke();
      }
    }
    ctx.restore();
  };
  a1BuildRoomCache=function(){
    const room=rooms[A1.node],c=A1.roomCacheCtx;
    if(!c)return;
    c.clearRect(0,0,room.width,room.height);
    c.imageSmoothingEnabled=false;
    // High architectural silhouettes; zero collision.
    c.fillStyle="rgba(1,9,15,.22)";
    for(let x=135;x<room.width;x+=310) {
      c.fillRect(x,0,42,room.height);
      c.fillRect(x-23,210,90,28);
      c.fillRect(x-16,550,76,18);
    }
    for(const f of room.floors)rect(c,f,false,room.biome);
    for(const w of room.walls)rect(c,w,false,room.biome);
    for(const plat of room.platforms)rect(c,plat,true,room.biome);
    A1.roomCacheDirty=false;
  };
  a1DrawWater=function(room){
    const t=performance.now()*.001;
    for(const pool of room.water){
      ctx.fillStyle="rgba(25,86,112,.68)";ctx.fillRect(pool.x,pool.y,pool.width,pool.height);
      ctx.strokeStyle="rgba(137,202,218,.65)";ctx.lineWidth=3;ctx.beginPath();
      for(let x=pool.x;x<=pool.x+pool.width;x+=14) {
        const y=pool.y+9+3*Math.sin(t*2+x*.02);
        if(x===pool.x)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  };
  a1DrawExitCue=function(ex){
    const r=rooms[A1.node],blocked=!a1CanUseExit(ex);
    const horizontal=ex.side==="left"||ex.side==="right";
    const x=horizontal?(ex.side==="left"?5:r.width-37):((ex.from+ex.to)/2-62);
    const y=horizontal?(r.height-300):(ex.side==="top"?24:r.height-110);
    const w=horizontal?32:124,h=horizontal?208:32;
    ctx.save();
    ctx.fillStyle=blocked?"rgba(46,152,179,.52)":"rgba(5,15,20,.62)";
    ctx.strokeStyle=blocked?"#b0e9fa":r.biome[3];
    ctx.lineWidth=3;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);
    if(blocked){
      ctx.globalAlpha=.57;ctx.fillStyle="#b0e9fa";
      for(let k=0;k<6;k++) {
        if(horizontal)ctx.fillRect(x+7,y+8+k*32,w-14,5);
        else ctx.fillRect(x+12+k*18,y+7,6,h-14);
      }
    }
    ctx.restore();
  };
  a1DrawBlockedExit=function(){}; // The gate visual above matches the actual collider.
  a1DrawForeground=function(){
    const v=ctx.createRadialGradient(WIDTH/2,HEIGHT/2,HEIGHT*.3,WIDTH/2,HEIGHT/2,WIDTH*.82);
    v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,5,12,.30)");
    ctx.fillStyle=v;ctx.fillRect(0,0,WIDTH,HEIGHT);
  };
  const baseHUD=drawHUD;
  a1DrawMap=function(){
    const full=A1.fullMapOpen,roomsX=10,roomsY=6;
    const stepX=full?Math.min(95,(WIDTH-120)/roomsX):21;
    const stepY=full?Math.min(58,(HEIGHT-170)/roomsY):16;
    const width=roomsX*stepX+26,height=roomsY*stepY+26;
    const left=full?(WIDTH-width)/2:WIDTH-width-14;
    const top=full?(HEIGHT-height)/2+12:72;
    const loc=r=>({x:left+13+(r.map[0]+.5)*stepX,y:top+13+(r.map[1]-.5)*stepY});
    ctx.save();
    if(full){
      ctx.fillStyle="rgba(4,10,17,.96)";ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.fillStyle="#edf0e8";ctx.font="bold 22px sans-serif";ctx.textAlign="center";
      ctx.fillText("MAC FROG  •  MANGUE DAS RUÍNAS",WIDTH/2,Math.max(30,top-28));
    }
    ctx.fillStyle="rgba(12,22,29,.89)";
    ctx.fillRect(left,top,width,height);
    ctx.strokeStyle="rgba(148,180,183,.40)";ctx.strokeRect(left+.5,top+.5,width-1,height-1);
    const drawn=new Set();
    for(const [id,r] of Object.entries(rooms))for(const ex of r.exits) {
      if(!rooms[ex.dest])continue;
      const key=[id,ex.dest].sort().join("~");if(drawn.has(key))continue;drawn.add(key);
      // Never disclose undiscovered world topology, even with the large map open.
      if(!A1.discovered.has(id)&&!A1.discovered.has(ex.dest))continue;
      const a=loc(r),b=loc(rooms[ex.dest]);
      ctx.strokeStyle=ex.requiresWater?"#599cba":"#647a78";ctx.lineWidth=full?8:3;
      ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1;
    }
    for(const [id,r] of Object.entries(rooms)){
      const explored=A1.discovered.has(id);
      // Discover adjacent silhouettes only; distant unexplored rooms remain hidden.
      if(!explored&&!r.exits.some(ex=>A1.discovered.has(ex.dest)))continue;
      const p=loc(r),tall=r.height>1450;
      const rw=stepX*(tall?.48:.81),rh=stepY*(tall?.96:.55);
      ctx.fillStyle=explored?r.biome[2]:"#1a2b34";ctx.globalAlpha=explored?1:.44;
      ctx.fillRect(p.x-rw/2,p.y-rh/2,rw,rh);ctx.globalAlpha=1;
      ctx.lineWidth=id===A1.node?2.5:1;ctx.strokeStyle=id===A1.node?"#fae9ba":r.biome[3];
      ctx.strokeRect(p.x-rw/2,p.y-rh/2,rw,rh);
      if(id===A1.node){
        ctx.beginPath();ctx.arc(p.x,p.y,full?4:2.5,0,Math.PI*2);
        ctx.fillStyle="#ffefcb";ctx.fill();
      }
      if(full&&r.checkpoint&&explored){
        ctx.fillStyle="#f1ca7b";ctx.fillRect(p.x-3,p.y-3,6,6);
      }
    }
    if(full) {
      ctx.textAlign="center";ctx.font="14px sans-serif";ctx.fillStyle="#e2e9e5";
      ctx.fillText(rooms[A1.node].name+" • "+A1.discovered.size+"/"+Object.keys(rooms).length+" descobertas",WIDTH/2,Math.min(HEIGHT-40,top+height+26));
      ctx.font="12px sans-serif";ctx.fillStyle="#a8bfc5";
      ctx.fillText("M: fechar   •   azul: passagem de água   •   salas altas: poços e torres",WIDTH/2,Math.min(HEIGHT-18,top+height+45));
    }
    ctx.restore();
  };
  drawHUD=function(){
    if(currentRoom!==0){baseHUD();return;}
    const r=rooms[A1.node],hp=Math.max(0,Math.min(1,mac.hp/mac.maxHp));
    ctx.save();
    ctx.fillStyle="rgba(8,16,22,.76)";ctx.fillRect(0,0,WIDTH,49);
    ctx.textBaseline="middle";ctx.textAlign="left";ctx.font="bold 16px sans-serif";ctx.fillStyle="#e3e9de";
    ctx.fillText(r.name,20,24);
    ctx.font="12px sans-serif";ctx.fillStyle="#9ec1b3";
    ctx.fillText("ÁREA 1",20,63);
    // Keep health and map label inside top header, away from the minimap at y=72.
    ctx.textAlign="right";ctx.fillStyle="#d4e6e4";ctx.fillText("M: MAPA",WIDTH-22,25);
    ctx.font="12px sans-serif";
    const barX=Math.max(200,WIDTH-380), barW=140;
    ctx.textAlign="left";ctx.fillStyle="#c3d0ce";ctx.fillText("VIDA "+mac.hp+"/"+mac.maxHp,barX-82,24);
    ctx.fillStyle="#182830";ctx.fillRect(barX,20,barW,11);
    ctx.fillStyle=hp>.3?"#8ebe9e":"#be826d";ctx.fillRect(barX,20,barW*hp,11);
    if(checkpointMessageTimer>0){
      ctx.textAlign="left";ctx.fillStyle="#a3dcb0";ctx.fillText("CHECKPOINT SALVO",20,88);
    }
    if(!mac.waterPower&&waterFly.alive){
      ctx.textAlign="left";ctx.fillStyle="#cfe0d6";ctx.fillText("C  •  Mosca da Água",20,88);
    }
    ctx.restore();
    a1DrawMap();
  };
})();