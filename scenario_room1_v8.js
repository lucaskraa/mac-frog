// Mac Frog V8 / handcrafted multi-screen map. Loaded after V6 and its blueprint data.
// All 5 original sprite atlases, animation logic and combat remain untouched.
(function installV8() {
  "use strict";
  const UNIT=96, A1_SAVE="mac_frog_a1_v8";
  const flooded=new Set(["lago","reservatorio","eco","bombas","aqueduto","calabouco","eclusa","saida","arquivo","canal_alto","comporta"]);
  const original={load:a1LoadNode, update:update, save:saveGame, loadSaved:loadSavedGame, respawn:respawnMac, clamp:a1ClampToRoom};
  const rooms=A1.rooms;
  A1.mapVersion="8.0";
  A1.usedDoors=new Set();
  A1.fullMapOpen=false;
  const palette={
    red:["#111e21","#25433c","#3e4d43","#95ae85"],green:["#10221b","#244435","#385044","#9cbd80"],
    purple:["#191b2c","#34364d","#47465c","#a7a1bb"],deep:["#101b2a","#284455","#374b59","#8aafc0"],
    blue:["#101f2c","#2b4556","#384d5b","#89b6c9"],teal:["#10242a","#1e4e55","#36565b","#8bcbcb"],
    gold:["#262026","#594638","#584b41","#ceb183"]
  };
  function rectangles(room){return [...room.floors,...room.platforms];}
  function nearest(room,x,y) {
    return rectangles(room).filter(r=>r.width>0).sort((a,b)=>
      Math.abs(a.y-y)+Math.abs(a.x+a.width/2-x) -
      Math.abs(b.y-y)-Math.abs(b.x+b.width/2-x))[0];
  }
  function compile(id,grid) {
    const room=rooms[id];
    if(!room||!grid||grid.length<10)throw Error("Sala inválida V8: "+id);
    const W=Math.max(...grid.map(row=>row.length))*UNIT;
    const H=grid.length*UNIT;
    const platforms=[],floors=[],walls=[],anchors=[],water=[];
    grid.forEach((line,row)=>{
      let col=0;
      while(col<line.length) {
        const ch=line[col];
        if(ch==="o")anchors.push({x:col*UNIT+48,y:row*UNIT+48,grabRange:340,kind:"vine"});
        if(!"#=~".includes(ch)){col++;continue;}
        let end=col+1;while(end<line.length&&line[end]===ch)end++;
        const r={x:col*UNIT,y:row*UNIT,width:(end-col)*UNIT,height:ch==="="?22:UNIT};
        if(ch==="~")water.push(r);
        else if(ch==="=")platforms.push({...r,style:row%2?"wood":"stone"});
        else if(row===grid.length-1)floors.push(r);
        else walls.push(r);
        col=end;
      }
    });
    // Entrances have a small safety ledge; all remaining terrain is explicitly authored.
    platforms.push({x:150,y:H-2*UNIT,width:230,height:22,style:"wood"});
    platforms.push({x:W-380,y:H-2*UNIT,width:250,height:22,style:"stone"});
    if(room.exits.some(e=>e.side==="top"))platforms.push({x:W-345,y:180,width:275,height:22,style:"shrine"});
    if(room.exits.some(e=>e.side==="bottom"))platforms.push({x:W-360,y:H-3*UNIT,width:270,height:22,style:"wood"});
    room.width=W;room.height=H;room.roomKey=id;room.tiles=grid;
    room.platforms=platforms;room.floors=floors;room.walls=walls;
    room.anchors=anchors;room.water=water;room.pits=[];
    room.biome=palette[room.zone]||palette.blue;
    for(const door of room.exits) {
      door.requiresWater=door.dest==="__NEXT_AREA__" || (flooded.has(id)!==flooded.has(door.dest));
      if(door.side==="left"||door.side==="right"){
        door.from=H-320;door.to=H-55;
      } else {
        door.from=W-345;door.to=W-55;
      }
      door.id=id+":"+door.side+":"+door.dest;
    }
    if(id==="santuario")room.waterFly={x:W-318,y:240};
    if(id==="hub")room.checkpoint=true;
    for(const enemyDef of room.enemies||[]) {
      const platform=nearest(room,W*.55,H-200);
      if(!platform)continue;
      enemyDef.x=Math.max(platform.x+30,Math.min(W*.55,platform.x+platform.width-78));
      enemyDef.surfaceY=platform.y;
      enemyDef.y=platform.y-68;
      enemyDef.min=Math.max(platform.x+10,enemyDef.x-60);
      enemyDef.max=Math.min(platform.x+platform.width-10,enemyDef.x+145);
    }
  }
  const ids=Object.keys(rooms).sort(),blues=Object.keys(A1_V8_BLUEPRINTS).sort();
  if(ids.join(",")!==blues.join(","))throw Error("V8 não possui todos os blueprints");
  for(const id of ids)compile(id,A1_V8_BLUEPRINTS[id]);

  // The old collider used the fixed y=760 and y=820 for all areas.
  a1RoomGeometry=function(room){
    solids.length=0;platforms.length=0;walls.length=0;
    platforms.push(...room.platforms);walls.push(...room.walls);
    solids.push(...room.floors,...platforms,...walls);
    for(const door of room.exits){
      if(!door.requiresWater||mac.waterPower)continue;
      if(door.side==="left")solids.push({x:0,y:door.from,width:45,height:door.to-door.from});
      if(door.side==="right")solids.push({x:room.width-45,y:door.from,width:45,height:door.to-door.from});
      if(door.side==="top")solids.push({x:door.from,y:0,width:door.to-door.from,height:42});
      if(door.side==="bottom")solids.push({x:door.from,y:room.height-48,width:door.to-door.from,height:48});
    }
    if(!room.exits.some(e=>e.side==="left"))solids.push({x:0,y:0,width:25,height:room.height});
    if(!room.exits.some(e=>e.side==="right"))solids.push({x:room.width-25,y:0,width:25,height:room.height});
  };
  function arrival(room,door) {
    const side=door?.side||"left";
    const x=side==="left"?90:side==="right"?room.width-115:room.width-195;
    let wantedY=room.height-120;
    if(side==="top")wantedY=180;
    const ledge=nearest(room,x,wantedY);
    const y=Math.max(12,(ledge?ledge.y:wantedY)-mac.normalHeight-1);
    return {x,y};
  }
  a1EntryPosition=function(room,entryDir){
    const reverse=room.exits.find(e=>e.dest===A1.previousNode);
    return arrival(room,reverse||{side:entryDir});
  };
  a1LoadNode=function(id,entryDir="left",preserveMac=false){
    const room=rooms[id];if(!room)throw Error("Room ID not found: "+id);
    A1.roomHeight=room.height;
    original.load(id,entryDir,preserveMac);
    A1.roomHeight=room.height;
    if(!A1.roomCache||A1.roomCache.width!==room.width||A1.roomCache.height!==room.height){
      A1.roomCache=document.createElement("canvas");
      A1.roomCache.width=room.width;A1.roomCache.height=room.height;
      A1.roomCacheCtx=A1.roomCache.getContext("2d");A1.roomCacheCtx.imageSmoothingEnabled=false;
    }
    A1.roomCacheId=id;A1.roomCacheDirty=true;
    if(room.checkpoint){
      const ledge=nearest(room,A1.checkpointX,room.height-120);
      checkpoints[0].y=(ledge?ledge.y:room.height-96)-75;
    }
    if(!preserveMac){
      const rev=room.exits.find(e=>e.dest===A1.previousNode);
      const p=arrival(room,rev||{side:entryDir});
      mac.x=p.x;mac.y=p.y;mac.vx=0;mac.vy=0;mac.grounded=false;
    }
    snapCameraToMac();
  };
  // KeyW and KeyS are the engine's real keyboard codes, not "w"/"s".
  a1CheckTransitions=function(dt){
    if(currentRoom!==0||A1.fullMapOpen)return;
    A1.transitionCooldown=Math.max(0,A1.transitionCooldown-dt);
    if(A1.transitionCooldown>0)return;
    const r=rooms[A1.node],cx=mac.x+mac.width/2,cy=mac.y+mac.height/2;
    for(const door of r.exits) {
      let hit=false;
      if(door.side==="left")hit=mac.x<=12&&cy>=door.from&&cy<=door.to;
      if(door.side==="right")hit=mac.x+mac.width>=r.width-12&&cy>=door.from&&cy<=door.to;
      if(door.side==="top")hit=mac.y<=160&&cx>=door.from&&cx<=door.to&&(keys.KeyW||keys.ArrowUp);
      if(door.side==="bottom")hit=mac.grounded&&mac.y+mac.height>=r.height-3*UNIT&&cx>=door.from&&cx<=door.to&&(keys.KeyS||keys.ArrowDown);
      if(!hit)continue;
      if(!a1CanUseExit(door)){mac.vx=0;return;}
      A1.usedDoors.add(door.id);
      a1Transition(door);
      persist();
      return;
    }
  };
  a1ClampToRoom=function(){
    original.clamp();
    const r=rooms[A1.node];
    if(mac.y>r.height+70){
      damageMac(10,mac.x);
      const p=arrival(r,{side:"left"});mac.x=p.x;mac.y=p.y;mac.vx=0;mac.vy=0;
      snapCameraToMac();
    }
  };

  // A separate V8 save prevents overwriting legacy save formats.
  function read(){
    try{const raw=localStorage.getItem(A1_SAVE);const s=raw&&JSON.parse(raw);
      return s&&s.version===8&&rooms[s.room]?s:null;
    }catch(e){console.warn("V8 save read",e);return null;}
  }
  function persist(){
    try{
      if(currentRoom!==0)return;
      localStorage.setItem(A1_SAVE,JSON.stringify({
        version:8,room:A1.node,discovered:[...A1.discovered],doors:[...A1.usedDoors],
        x:mac.x,y:mac.y,checkpoint:A1.checkpointNode
      }));
    }catch(e){console.warn("V8 save write",e);}
  }
  saveGame=function(){original.save();persist();};
  loadSavedGame=function(){
    const loaded=original.loadSaved();
    const stored=read();
    if(stored&&currentRoom===0){
      A1.discovered=new Set((stored.discovered||[]).filter(id=>!!rooms[id]));
      A1.usedDoors=new Set(stored.doors||[]);
      if(A1.discovered.size===0)A1.discovered.add("entrada");
      a1LoadNode(stored.room,"left",false);
      if(Number.isFinite(stored.x)&&Number.isFinite(stored.y)){
        const hit={x:stored.x,y:stored.y,width:mac.width,height:mac.height};
        if(hit.x>=0&&hit.x+hit.width<=rooms[stored.room].width&&hit.y>=0&&hit.y+hit.height<=rooms[stored.room].height&&!solids.some(s=>rectsOverlap(s,hit))){
          mac.x=stored.x;mac.y=stored.y;
        }
      }
      snapCameraToMac();
    }
    return loaded||!!stored;
  };
  respawnMac=function(){
    original.respawn();
    if(currentRoom!==0)return;
    const stored=read();
    a1LoadNode(stored&&rooms[stored.checkpoint]?stored.checkpoint:"entrada","left",false);
    mac.hp=mac.maxHp;mac.dead=false;mac.invulnerableTimer=1;
  };
  update=function(dt){
    if(currentRoom===0&&A1.fullMapOpen)return;
    original.update(dt);
  };
  window.MacFrogV8=Object.freeze({
    info:()=>({version:A1.mapVersion,current:A1.node,rooms:ids.length,discovered:A1.discovered.size,height:A1.roomHeight}),
    validate:()=>{
      const errors=[];
      for(const [id,r] of Object.entries(rooms)){
        if(!r.floors.length)errors.push(id+": no floor");
        for(const d of r.exits){
          if(d.dest==="__NEXT_AREA__")continue;
          const back=rooms[d.dest]?.exits.find(x=>x.dest===id);
          if(!back||back.requiresWater!==d.requiresWater)errors.push(id+" -> "+d.dest);
        }
      }
      return {ok:errors.length===0,errors};
    }
  });
  A1.lastWaterPower=mac.waterPower;
  A1.discovered=new Set(["entrada"]);
  a1LoadNode("entrada","left",false);
})();