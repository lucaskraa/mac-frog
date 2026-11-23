// MAC FROG / AREA 1 — V7. Architectural pass for true nonlinear exploration.
// Works after scenario_room1_v6.js. NO art asset deleted or replaced.
// The player, abilities, enemy sprite sheets and animations remain in game_v25.html.

(function installMetroidvaniaV7() {
  "use strict";
  A1.mapVersion = "7.0";
  A1.roomHeight = 900;
  A1.fullMapOpen = false;

  // These flooded sectors are deliberately unreachable until the water ability.
  // Both directions of each affected doorway receive the same requirement.
  const floodedSector = new Set([
    "lago", "reservatorio", "eco", "bombas", "aqueduto",
    "calabouco", "eclusa", "saida", "arquivo", "canal_alto", "comporta"
  ]);

  function numberFrom(id) {
    let n = 5381;
    for (let i = 0; i < id.length; i++) n = ((n << 5) + n + id.charCodeAt(i)) | 0;
    return Math.abs(n);
  }
  const colorByZone = {
    red: { sky: "#101d24", fog: "#223f41", rock: "#324947", rim: "#81a28a" },
    green: { sky: "#0b1b1b", fog: "#234437", rock: "#344b35", rim: "#8eaf78" },
    purple: { sky: "#161827", fog: "#34314e", rock: "#34394e", rim: "#9d97c8" },
    deep: { sky: "#0a1724", fog: "#1b3d53", rock: "#314655", rim: "#84abc1" },
    blue: { sky: "#0c1924", fog: "#264458", rock: "#384a59", rim: "#8eb8cb" },
    teal: { sky: "#0a1d24", fog: "#20535c", rock: "#31575b", rim: "#86d0d0" },
    gold: { sky: "#1d1b22", fog: "#53433a", rock: "#53453c", rim: "#d0af7c" }
  };
  const layoutNames = {
    shaft: "poço vertical", flood: "câmara inundada",
    hall: "galeria ramificada", hub: "encruzilhada",
    gate: "fortificação"
  };

  // Individually assembled chambers: not copies of one floor + an upward staircase.
  for (const [id, room] of Object.entries(A1.rooms)) {
    const seed = numberFrom(id);
    const kind = room.kind || "hall";
    const width = [1392, 1536, 1680, 1824][seed % 4];
    room.width = width;
    room.layout = kind;
    room.visualSeed = seed;
    room.biome = colorByZone[room.zone] || colorByZone.blue;
    room.floorLevel = 760;
    const hasTop = room.exits.some(e => e.side === "top");
    const hasBottom = room.exits.some(e => e.side === "bottom");

    for (const ex of room.exits) {
      if (ex.dest === "__NEXT_AREA__") {
        ex.requiresWater = true;
      } else {
        ex.requiresWater = floodedSector.has(id) !== floodedSector.has(ex.dest);
      }
      // All top and bottom doorways have a real platform to stand on.
      if (ex.side === "top" || ex.side === "bottom") {
        ex.from = width - 380;
        ex.to = width - 95;
      } else {
        ex.from = 475;
        ex.to = 885;
      }
    }

    const blocks = [];
    const floors = [];
    const obstacles = [];
    const pits = [];
    const anchors = [];
    const surface = (x, y, w, style = "stone") => {
      const px = Math.round(Math.max(0, Math.min(width - 60, x)));
      blocks.push({ x:px, y:Math.round(y), width:Math.round(Math.min(w, width - px)), height:24, style });
    };
    const solid = (x, y, w, h) => obstacles.push({ x:Math.round(x), y:Math.round(y), width:Math.round(w), height:Math.round(h) });
    const ground = (x, w) => {
      if (w > 40) floors.push({ x:Math.round(x), y:760, width:Math.round(w), height:140 });
    };
    const hook = (x,y,kind="vine") => anchors.push({
      x:Math.round(x), y:Math.round(y), grabRange:340, kind
    });
    const gapX = Math.round(width * (.40 + (seed % 3) * .024));
    const gapW = kind === "shaft" ? 380 : kind === "flood" ? 265 : 174;
    const safeLeft = gapX;
    const safeRight = width - gapX - gapW;

    if (id === "entrada") {
      // Quiet introduction chamber: immediate choice of right or lower passage.
      ground(0, width);
      surface(275, 650, 235, "wood");
      surface(width-570, 560, 230, "moss");
      surface(width-365, 465, 215, "stone");
      solid(width*.56, 674, 75, 86);
    } else if (kind === "shaft") {
      // Vertical open cavity with staggered ledges; lower crossing is interrupted.
      ground(0, safeLeft);
      ground(gapX+gapW, safeRight);
      pits.push({x:gapX, width:gapW});
      surface(gapX-100, 682, 210, "stone");
      surface(gapX+105, 600, 210, "moss");
      surface(gapX+290, 520, 210, "wood");
      surface(width*.33, 438, 240, "stone");
      surface(width*.56, 345, 245, "moss");
      surface(width-385, 254, 275, "stone");
      surface(145, 570, 205, "wood");
      solid(width*.14, 630, 65, 130);
      hook(gapX+155, 485, "chain");
      hook(width*.56+140, 245, "root");
      hook(width-180, 158, "vine");
    } else if (kind === "flood") {
      // Wide inundated gap + two distinct paths: stepping stones and upper bridge.
      ground(0, safeLeft);
      ground(gapX+gapW, safeRight);
      pits.push({x:gapX, width:gapW});
      surface(gapX-80, 684, 145, "wood");
      surface(gapX+98, 646, 175, "stone");
      surface(gapX+gapW-10, 672, 180, "wood");
      surface(190, 548, 280, "moss");
      surface(490, 470, 235, "stone");
      surface(760, 390, 240, "moss");
      surface(width-405, 305, 275, "wood");
      hook(gapX+gapW/2, 455, "chain");
      hook(width-350, 215, "root");
      solid(width*.72, 674, 70, 86);
    } else if (kind === "hub") {
      // Open hub with multiple elevations and visible branch points.
      ground(0, width);
      surface(170, 645, 280, "moss");
      surface(width*.37, 540, 290, "stone");
      surface(width*.62, 640, 250, "wood");
      surface(width-395, 410, 250, "stone");
      surface(width-465, 245, 290, "moss");
      surface(130, 425, 210, "wood");
      hook(width*.43, 410);
      hook(width*.70, 285, "chain");
      solid(width*.28, 684, 70, 76);
      solid(width*.73, 700, 85, 60);
    } else if (kind === "gate") {
      // Last fortress: ground-level obstacle forces a climb, then a high bridge.
      ground(0, width);
      surface(240, 675, 250, "stone");
      surface(525, 580, 260, "wood");
      surface(830, 465, 245, "stone");
      surface(width-425, 365, 265, "moss");
      solid(width*.49, 625, 90, 135);
      hook(width*.64, 350,"chain");
      hook(width-210, 275,"chain");
    } else {
      // Galleries are deliberately NOT all straight: broken passages, alternate ledges.
      if (seed % 3 === 0) {
        ground(0, safeLeft);
        ground(gapX+gapW, safeRight);
        pits.push({x:gapX, width:gapW});
        surface(gapX-70, 686, 195, "wood");
        surface(gapX+gapW-50, 660, 185, "stone");
      } else ground(0, width);
      surface(185, 632, 245, "moss");
      surface(width*.30, 528, 240, "wood");
      surface(width*.53, 616, 280, "stone");
      surface(width-370, 478, 265, "moss");
      surface(width*.46, 372, 230, "stone");
      if (seed % 2 === 0) {
        solid(width*.62, 663, 65, 97);
        surface(width*.65, 300, 200, "wood");
      } else {
        solid(width*.34, 685, 70, 75);
        surface(175, 418, 210, "stone");
      }
      hook(width*.52, 285, "vine");
      hook(width-215, 320, "root");
    }

    if (hasTop) {
      // Dedicated ascending approach; successive offsets are short enough for jumps/grapples.
      // Top door sits over the final visible ledge, never floating in an inaccessible corner.
      const climb = [
        [width*.23, 645],[width*.36, 545],[width*.49, 445],
        [width*.62, 345],[width*.75, 250],[width-325, 198]
      ];
      climb.forEach(([x,y],i)=> surface(x, y, i===5?280:205, i%2?"stone":"wood"));
      hook(width*.48, 345,"root");
      hook(width*.78, 185,"vine");
    }
    if (hasBottom) {
      // Hatch uses ground on the right, never an unreachable mid-air trigger.
      ground(width - 400, 400);
      surface(width-370, 640, 260, "wood");
    }
    if (id === "santuario") {
      // Preserves existing water skill collectible in a traversable, elevated alcove.
      surface(width-510, 348, 300, "shrine");
      room.waterFly = {x:width-370,y:280};
      hook(width-350, 230,"root");
    }
    if (id === "hub") room.checkpoint = true;
    room.floors = floors;
    room.platforms = blocks;
    room.walls = obstacles;
    room.anchors = anchors;
    room.pits = pits;
    // More environmental differentiation: no identical enemy set in every chamber.
    if (id !== "entrada" && id !== "hub" && id !== "santuario") {
      const oldEnemy = room.enemies && room.enemies[0];
      const type = oldEnemy ? oldEnemy.type : "spider";
      const ex = Math.min(width-330, 380 + seed % 400);
      room.enemies = [{type, x:ex, surfaceY:760, min:ex-105, max:ex+185}];
    }
  }

  // Style and collision both use the same geometry. No old swamp images are painted.
  function paintParallax() {
    const r = a1CurrentRoom();
    if (!r) return;
    const colors = r.biome;
    const bg = ctx.createLinearGradient(0,0,0,HEIGHT);
    bg.addColorStop(0,colors.sky);
    bg.addColorStop(1,colors.fog);
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,WIDTH,HEIGHT);
    ctx.save();
    ctx.globalAlpha = .17;
    ctx.fillStyle = "#030b12";
    for (let i=-2;i<Math.ceil(WIDTH/220)+3;i++) {
      const x=i*220-(camera.x*.12%220);
      const h=125+(i*i*31+17)%135;
      ctx.fillRect(Math.round(x),HEIGHT-h,142,h);
      ctx.fillRect(Math.round(x+28),HEIGHT-h-58,84,60);
    }
    ctx.globalAlpha=.06;
    ctx.strokeStyle="#dbecdd";
    ctx.lineWidth=1;
    const offset=(camera.x*.06)%128;
    for(let x=-offset;x<WIDTH;x+=128) {
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,HEIGHT);ctx.stroke();
    }
    ctx.restore();
  }

  function paintTerrain(c, r, item, style="stone") {
    if (!item || item.width<=0 || item.height<=0) return;
    const y=Math.round(item.y), x=Math.round(item.x), w=Math.round(item.width), h=Math.round(item.height);
    const earthy=style==="moss"||style==="root";
    const wood=style==="wood";
    c.fillStyle=wood?"#433e35":r.biome.rock;
    c.fillRect(x,y,w,h);
    c.fillStyle=wood?"#af9670":r.biome.rim;
    c.fillRect(x,y,w,7);
    c.fillStyle="rgba(6,14,20,.27)";
    c.fillRect(x,y+9,w,Math.max(0,h-9));
    // Uneven masonry/strata; draw inside actual solid outlines.
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    c.strokeStyle="rgba(173,202,195,.15)";
    c.lineWidth=2;
    for(let yy=y+28;yy<y+h;yy+=35){
      c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke();
      for(let xx=x+(Math.floor(yy/35)%2)*31;xx<x+w;xx+=67){
        c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,Math.min(yy+29,y+h));c.stroke();
      }
    }
    if(earthy) {
      c.fillStyle="rgba(73,135,92,.72)";
      for(let xx=x+13;xx<x+w;xx+=43) {
        const vine=10+((xx*19+y*7)%27);
        c.fillRect(xx,y+4,6,vine);
      }
    }
    if(wood) {
      c.strokeStyle="rgba(237,206,145,.22)";
      for(let xx=x+18;xx<x+w;xx+=38) {
        c.beginPath();c.moveTo(xx,y+5);c.lineTo(xx,y+h);c.stroke();
      }
    }
    c.restore();
  }

  function roomArchitecture(c,r) {
    const w=r.width, seed=r.visualSeed;
    c.save();
    // Background pillars, roots and carved vaults create depth, without gameplay collision.
    c.globalAlpha=.55;
    for(let i=0;i<Math.ceil(w/260);i++){
      const x=80+i*260+(seed%43);
      const th=110+(i*31+seed)%110;
      c.fillStyle="rgba(5,15,21,.40)";
      c.fillRect(x,150,32,610);
      c.fillRect(x-16,150,64,24);
      c.fillRect(x-12,150+th,56,9);
      c.strokeStyle="rgba(135,171,165,.13)";
      c.lineWidth=3;
      c.strokeRect(x,150,32,610);
    }
    if(r.zone==="green"||r.zone==="red"){
      c.strokeStyle="#19372c";c.lineWidth=13;
      for(let i=0;i<6;i++){
        const x=90+i*(w/6);
        c.beginPath();c.moveTo(x,-30);c.bezierCurveTo(x-95,110,x+120,210,x+32,335);c.stroke();
      }
    } else if(r.zone==="purple"||r.zone==="gold"){
      c.strokeStyle="rgba(145,137,153,.16)";c.lineWidth=7;
      for(let i=0;i<5;i++){
        const x=150+i*(w/5);
        c.beginPath();c.arc(x,370,70,Math.PI,2*Math.PI);c.stroke();
        c.strokeRect(x-68,370,136,230);
      }
    } else {
      c.fillStyle="rgba(98,155,164,.10)";
      for(let i=0;i<5;i++)c.fillRect(i*w/5,460+(i%2)*55,120,265);
    }
    c.restore();
  }

  function buildDetailedRoom() {
    const r=a1CurrentRoom();
    if(!r || !A1.roomCacheCtx) return;
    const c=A1.roomCacheCtx;
    if(A1.roomCache.width!==r.width||A1.roomCache.height!==A1.roomHeight){
      A1.roomCache.width=r.width;A1.roomCache.height=A1.roomHeight;
    }
    c.clearRect(0,0,r.width,A1.roomHeight);
    c.imageSmoothingEnabled=false;
    roomArchitecture(c,r);
    for(const f of r.floors)paintTerrain(c,r,f,"moss");
    for(const platform of r.platforms)paintTerrain(c,r,platform,platform.style);
    for(const wall of r.walls)paintTerrain(c,r,wall,"stone");
    for(const ex of r.exits){
      if(ex.side==="left"||ex.side==="right")continue;
      const x=Math.max(0,(ex.from+ex.to)/2-46);
      const y=ex.side==="top"?35:737;
      c.fillStyle="rgba(5,13,22,.65)";c.fillRect(x,y,92,20);
      c.strokeStyle=r.biome.rim;c.lineWidth=3;c.strokeRect(x,y,92,20);
      c.fillStyle=r.biome.rim;
      for(let s=0;s<5;s++)c.fillRect(x+11+s*16,y+4,7,12);
    }
    A1.roomCacheDirty=false;
  }

  function paintGate(ex){
    const r=a1CurrentRoom(), blocked=ex.requiresWater&&!mac.waterPower;
    const color=blocked?"#b5e8ff":r.biome.rim;
    if(ex.side==="left"||ex.side==="right"){
      const x=ex.side==="left"?9:r.width-44;
      const cy=(ex.from+ex.to)/2;
      ctx.save();
      ctx.fillStyle="rgba(7,15,21,.76)";
      ctx.fillRect(x,cy-78,35,156);
      ctx.strokeStyle=color;ctx.lineWidth=4;ctx.strokeRect(x,cy-78,35,156);
      if(blocked) {
        ctx.fillStyle="rgba(68,181,215,.42)";ctx.fillRect(x+4,cy-74,27,148);
        for(let j=0;j<6;j++){ctx.fillStyle="rgba(195,241,250,.38)";ctx.fillRect(x+8,cy-66+j*23,18,4);}
      }
      ctx.restore();
    }else{
      const x=(ex.from+ex.to)/2;
      const y=ex.side==="top"?61:715;
      ctx.save();ctx.strokeStyle=color;ctx.lineWidth=4;
      ctx.strokeRect(x-47,y,94,24);
      if(blocked){ctx.fillStyle="rgba(70,190,215,.45)";ctx.fillRect(x-43,y+4,86,16);}
      ctx.restore();
    }
  }

  // Runtime hook replacement: actual platforms, walls and flood hazards stay collidable.
  a1DrawParallax=paintParallax;
  a1BuildRoomCache=buildDetailedRoom;
  a1DrawExitCue=paintGate;
  a1DrawForeground=function(){
    const vignette=ctx.createRadialGradient(WIDTH*.5,HEIGHT*.5,HEIGHT*.3,WIDTH*.5,HEIGHT*.5,WIDTH*.9);
    vignette.addColorStop(0,"rgba(0,0,0,0)");
    vignette.addColorStop(1,"rgba(0,0,0,.30)");
    ctx.fillStyle=vignette;ctx.fillRect(0,0,WIDTH,HEIGHT);
  };

  // Classic exploration map: hallways are wide, wells are tall, hubs are larger.
  // Unexplored rooms are silhouettes; visited rooms inherit the biome palette.
  a1DrawMap=function(){
    if(currentRoom!==0)return;
    const full=A1.fullMapOpen;
    const cellsX=10, cellsY=6;
    const cw=full?Math.min(97,Math.floor((WIDTH-120)/cellsX)):22;
    const ch=full?Math.min(60,Math.floor((HEIGHT-170)/cellsY)):17;
    const mapWidth=cw*cellsX+28, mapHeight=ch*cellsY+28;
    const x0=full?(WIDTH-mapWidth)/2:WIDTH-mapWidth-12;
    const y0=full?(HEIGHT-mapHeight)/2+12:64;
    const offset=(r)=>{
      const [col,row]=r.map;
      return {x:x0+14+(col+.5)*cw,y:y0+14+(row-1+.5)*ch};
    };
    function shape(r){
      if(r.kind==="shaft")return [cw*.52,ch*.91];
      if(r.kind==="hub")return [cw*.87,ch*.84];
      if(r.kind==="flood")return [cw*.94,ch*.44];
      if(r.kind==="gate")return [cw*.70,ch*.65];
      return [cw*.94,ch*.51];
    }
    ctx.save();
    if(full){
      ctx.fillStyle="rgba(3,9,16,.97)";
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.fillStyle="#edf1ee";ctx.textAlign="center";ctx.font="bold 23px sans-serif";
      ctx.fillText("MAC FROG  /  MANGUE DAS RUÍNAS",WIDTH/2,Math.max(35,y0-31));
      ctx.font="13px sans-serif";ctx.fillStyle="#9cabb4";
      ctx.fillText("Mapa de exploração  •  M: fechar  •  Passagens azuis exigem poder da água",WIDTH/2,Math.max(54,y0-11));
    }
    ctx.fillStyle="rgba(9,17,24,.93)";
    ctx.fillRect(x0,y0,mapWidth,mapHeight);
    ctx.strokeStyle="rgba(153,181,192,.23)";
    ctx.lineWidth=1;ctx.strokeRect(x0+.5,y0+.5,mapWidth-1,mapHeight-1);

    // Corridors and vertical shafts are connected before rooms are drawn.
    const done=new Set();
    for(const [id,room] of Object.entries(A1.rooms)){
      const a=offset(room);
      for(const ex of room.exits){
        if(ex.dest==="__NEXT_AREA__")continue;
        const key=[id,ex.dest].sort().join("/");
        if(done.has(key))continue;
        done.add(key);
        const other=A1.rooms[ex.dest];
        if(!other)continue;
        const b=offset(other);
        const visible=full || A1.discovered.has(id) || A1.discovered.has(ex.dest);
        if(!visible)continue;
        ctx.strokeStyle=ex.requiresWater?"#5599b7":"#61757f";
        ctx.lineWidth=full?8:3;
        ctx.globalAlpha=full?(ex.requiresWater?.79:.56):.47;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        ctx.globalAlpha=1;
        if(full&&ex.requiresWater&&!mac.waterPower){
          ctx.fillStyle="#9ac9e2";
          ctx.fillRect((a.x+b.x)/2-3,(a.y+b.y)/2-3,6,6);
        }
      }
    }
    for(const [id,room] of Object.entries(A1.rooms)){
      const seen=A1.discovered.has(id);
      const near=room.exits.some(ex=>A1.discovered.has(ex.dest));
      if(!full&&!seen&&!near)continue;
      const pos=offset(room),[rw,rh]=shape(room);
      const colors=room.biome;
      ctx.globalAlpha=seen?(id===A1.node?1:.75):(full?.83:.36);
      ctx.fillStyle=seen?colors.rock:"#1b2833";
      ctx.fillRect(pos.x-rw/2,pos.y-rh/2,rw,rh);
      ctx.globalAlpha=1;
      ctx.strokeStyle=id===A1.node?"#f4edc0":(seen?colors.rim:"#49606c");
      ctx.lineWidth=id===A1.node?(full?3:2):1;
      ctx.strokeRect(pos.x-rw/2,pos.y-rh/2,rw,rh);
      // Tiles make the room silhouette read like an architectural floor plan.
      if(full&&seen){
        ctx.fillStyle="rgba(4,9,14,.50)";
        if(room.kind==="shaft"){
          ctx.fillRect(pos.x-4,pos.y-rh/2+5,8,rh-10);
        }else{
          ctx.fillRect(pos.x-rw/2+5,pos.y-2,rw-10,4);
        }
        if(room.checkpoint){ctx.fillStyle="#efc87d";ctx.fillRect(pos.x-4,pos.y-4,8,8);}
        if(id==="santuario"&&!mac.waterPower){ctx.fillStyle="#80e9ff";ctx.fillRect(pos.x-4,pos.y-4,8,8);}
      }
      if(id===A1.node){
        ctx.fillStyle="#fff8d3";ctx.beginPath();
        ctx.arc(pos.x,pos.y,full?5:3,0,Math.PI*2);ctx.fill();
      }
    }
    if(full){
      const room=a1CurrentRoom();
      ctx.textAlign="center";
      ctx.fillStyle="#edf0e9";ctx.font="bold 14px sans-serif";
      ctx.fillText(room.name+" • "+(layoutNames[room.kind]||"exploração"),WIDTH/2,Math.min(HEIGHT-50,y0+mapHeight+26));
      ctx.fillStyle="#a8bfc5";ctx.font="12px sans-serif";
      ctx.fillText(A1.discovered.size+" / "+A1.mapRoomTotal+" salas descobertas  ·  claro: explorado  ·  escuro: desconhecido",WIDTH/2,Math.min(HEIGHT-29,y0+mapHeight+45));
    } else {
      ctx.textAlign="right";ctx.fillStyle="#c1d8dd";ctx.font="11px sans-serif";
      ctx.fillText("M  ·  MAPA",WIDTH-13,y0-7);
    }
    ctx.restore();
  };

  // Open map stops movement and combat; prevents damage while reading the route.
  const updateGameV7=update;
  update=function(dt){
    if(currentRoom===0&&A1.fullMapOpen)return;
    updateGameV7(dt);
  };

  window.MacFrogMapV7=Object.freeze({
    info:()=>({version:A1.mapVersion,rooms:Object.keys(A1.rooms).length,visited:A1.discovered.size,room:A1.node}),
    room:()=>({name:a1CurrentRoom().name,kind:a1CurrentRoom().kind,platforms:a1CurrentRoom().platforms.length,exits:a1CurrentRoom().exits}),
    validate:()=>{
      const errors=[];
      for(const [id,r] of Object.entries(A1.rooms)){
        if(!r.floors.length)errors.push("Sem chão: "+id);
        for(const ex of r.exits){
          if(ex.dest==="__NEXT_AREA__")continue;
          const b=A1.rooms[ex.dest];
          const reverse=b&&b.exits.find(e=>e.dest===id);
          if(!reverse || reverse.requiresWater!==ex.requiresWater)errors.push("Conexão: "+id+" > "+ex.dest);
        }
      }
      return {ok:errors.length===0,errors};
    }
  });

  // Clear existing cache, which still has the older room size and art.
  A1.roomCacheId=null;
  A1.roomCacheDirty=true;
  A1.discovered=new Set(["entrada"]);
  A1.lastWaterPower=mac.waterPower;
  a1LoadNode("entrada","left",false);
})();
