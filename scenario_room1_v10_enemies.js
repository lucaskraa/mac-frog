// V10 original pixel sprite atlas: 4 animation frames per insect archetype.
// Rows: beetle, larva, fly, centipede. These are real transparent PNG frames
// downsampled from original artwork; they replace the V9 geometric insects.
(function installV10EnemySprites(){
"use strict";
const S=32,v9=window.MacFrogV9State;
const sprite=new Image();let ready=false;
sprite.decoding="async";
sprite.onload=()=>{ready=true;};
sprite.onerror=()=>console.warn("V10 insect PNG atlas failed to decode");
sprite.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAkFBMVEUAAABVMi5oVCtkIx8yHySUaU5pYRRsUklWLipZMCyNXy+elGdsa2SasYxqXiBpWiA0ICYyHSSdUylZOUR0j3L/AACRNSuYTi6VmV2MOi2WVS3OlWSeYE6QmWSrxZyRl2VtU0X8/ACdmhVzjXGINzNvWkmTbEeNiB6GOi1gA190ilyQbUrOb05zoRqPqojTbSp1X7aqAAAAMHRSTlMA8/UW9fcS+F6c8/IK+FuhnV8a+SIBIF4fXqX5E136n6IBFFz1Xl34mAT3nfYUnhiIEm9LAAAN5UlEQVR42u1bi3bbOA4FSVF8SNbLb8VJ7NR2kqZN///v9gKUH0mcmdltp3POjpk2dkSKuLwAKQKEiK7lWq7lrEyp+9bPo12S4T/elx9E32Lfz8nkKL9cek6rFfVRB/X045MWP/qolJod2v+yYlJ/Js7nMca6jm2V13F1EsFk5HlHfd/HEKvW51Wd/5cIDHUxMvZ5d+FOg2t5rXXUKEorhY/62G4lv2tdRdSjbjzmZvn01M90NZv3cUafcwN+Z0+9D3Wt63f1G7OvTJnn6PNRCwBnLX9WxyYdbkH94+MjA0C11L/hoOt175vgTf5wiZu8yuc18CvHg3hLn7l3DLCqmzT8bDy29lsUBKnZS202eQ3sGS5mAoARHEeSUzef6aEuMrL3tp1XVaI3Q99o8oaEvW2ohIqpQQcMAL18+wYECgi+DwDRBWWaf1TmHKqt1B/mQhdrTSAnUwL9zQA3U9rkwI+bM7QAgihNjrOs0ApW+ExBqbFDGQtKq6PKNAvY22BKtGtBvkY9erHSQB3MBPRp1o4eA5217xFQztO2GSsnd1NE1+DAHKqdGlNpTAt8LgHAONTWYcaJGby4sYGV+lQ9dlkahOJ6EfNS5WI7qE0Ua3U0YHx0Lx7yg0K9dQLRcWtPBxJwE34HxejsGG14iGTHbA8aMK0at1BEphiBdQxgTNvtludDjTuhoUo3WaadLTJmmfXoqTwM0Nbm7HbogYvSwRxIqgFq51ELBVmLNpDAY5X56IlVG6hk9WQCwHFP+KfVWJRnFVVMcKagzEP3Srouac8MG1oFZlbbgu1AmmA1NTBNblXV3CPL5D6KYsDIkCE7AVwzQbBPaws7VGcyZwIAwkYNqyfdM9QmDecW9WMPihiwstLCxaz1srTlOfNkctw01qxzUKCTbJHAfArATIwDAAd4Sg2NEsDxWhhTPEUydI/S0hFAJratYDXoUu5EU8zwlx2Zgw17XI3gkrvkdkpHtkSd0QEg6LZbJeNWomdpnDWeVyjUKghoLEbYYBKrwcAxh2AkTTMQhh5d1jaCX9F+Z1b7ci8SDInliHw2AbSGcF7y0lMi93zTjUArXOoOtp61aZxYwri+2QMUrigYk5HnCyiGkjdQENe3waqmgbSmpVy1tLJ2Va6HxTCwdEzE1loV2paH4VtoK6R6r7jwiFHv24YakGStJ0o69BnWYFJNy5SZJoOc52EF4AtZQ603XrXVvqx4Vd/bqn2xdl2Vx6dhxo0yIFMBf0E2JhJP/VQP2UGJ6Wolo+a/oYU017CGpouHztDV+UoMorAwmYZW692uyk253+W0f1lXeVUmZT1jRKkhJYlN1g5AEgFAJ1IBJYliib4Z+1+2I2iGz2z4s4XpnK6n74DTpAuD7qlR09+xTzMnQts3e5jNAe+1XMu1XMu1XMu/pTwQu3QVnXb8vzFygj08waPDP6rM3yMDO9jqUddVL77zR/+6ira4sRFesa3fVZtu/tR18zl13U/tO+oUIICM6t34p908wKthBDeFLgpx24/+Z7dcGhNMVUP8JQRT03XLp35GgIjbHi4J36CijhF+LY+wcPXDm9iDmdXsDjOCmxt3Q0eE0shjw1uniEFFn+7RABEIRHx+cdsVMXiMD71HjPKR1fBw3H1VLNoOpbiB+51Xtck30hfbBDwZewOPvnrXOysL/2fz5bLSL8zxRfVPcwL1sSiSnILsEMJI9j5/Yr/FslfNzmlRiHsdj2EAYzr2POyNtu8QiLHkEtOrlC4sR0liuuthem5JVc19AwCrmf+j+6ruE1vzJxPYW7Nwv5QEkFwBZYGxIsE07Dio6ApXaA6aHHp++E4P6bMS30LdSGgJLAwthnbJxJJ4oICDziB0ChKB3yV7RuK5in8UWVVohs7QYS5BtGWQ5rhW1PQ+VPZIGj8EF9fewL/XYuR5ZaDiTdKxmUHHIL9gH9cyFY6tne0x6XgWfM8dMgYO3HAUwUooweUSg/LJeQMnNxzZGiZI/pBUXtcVSoCSCqYPJgTGH+NZGG6uub8b0a1iT1+n6aYLZxJE+QiqNYMg7bRTWkIXaRAzVGjmTp8CeNAFA/gOA8ipY/8ZQ3JCXuJrWFG63tcSWLFaCdWaLY4HiebuSCjmOtMdMO3IBxV8CJ6/DyWwFXH3Gj9WdJfn37/DCOocELoQQhTwwh63iRAgCnsyIDDjyFU2AIisTVaBG6bN9JPw7ukPIJIAK4Z3w+aeUJ8iiXMoErDT6BimrBsJgaHuKagY4GIr/MAtTX2JyYULoo0p0XGJYvLDNAisIVEOZitw12Z6XOJSCMIwZdInZpLoGr0H6X8685QHBgJOQUcJozL4Egz91QcPt+ObIATK8dLP2zUvl64DtdCd4hbA1F23GH+9lJPyTy5cy7Vcy7X85DpDt/e3Zwv3d8KFovidEAqUL8PTA0+wxX0xGv1WAPcjFiiPsAVtbiF+NLr/rSpIIvk5Tw/3o7s74Fmkyslk8uW08pvVYjGZ/GoAG+oKljmiHPKL0R0Q3B0IKBf3ST5+PdwWwPW/A0j9TG7v728X07cVC6Gg2PEXQLk7EgB7xLUvtMDftyMh5h0Avvl2cGImo1c03HwOYUKvo6K4XQizZ49UbBuhheLrumLzQxN0+X2oW5TF6OtkA8tk1dwfrx/KAgCKCRCgO771/nIEYYPLk1cM7fWWx/AFZVKW5+R0t7xX4/nw+DgavW7KA2YeOCgoWDPFYrL4wCtYKzpuzuQB+uKi+88M3t0ls1osbm/ftVrtaM47d/cVpWCJ5WGADOCgo+L1kgXc36H9hMR4PyGAHnL08zrJ6bWQcr/gje1ZA+91lHNSrXd0Bq9clKPCrTFRCwZGHxhIEF+ZADaexQcA5jmlRzhX16xGwGQrEB0cx09zO7ZWSQaBruDKnNtHDWYgnQHclpPL60iR54B3d3dLkwtb5i5Kx07MCwZWTr7Ql3Mup7SN6hupVHQ6Uz2EFuoYY/JVPw9R3cMdKMS8Pzbw3tTxEd4gnzxTXaGjiZRTW2zZ/XA0KOei5+f/T1v7TdwUrWBJ3y9HmIjzMxyftucfYyNwFuw25adkGVVl/bCRWXgO1SQHtxmOhM9O39kRTEfFSn12TAePRHNKAcrCfBw/zRRt5WAbEjgcUV6g0aye4K/4rFFNk72RhN4VH6O+u/xOy2ObAggffSn2mOCFpaE1JS8ADOADCMPeUtYQpDRZe8YAfCj/TE1jjueFHwNhtFR8tB3axlyiB66jYWcaq/Bu96W8PAb25nxmQkYiyZxVPfOBMKfofB5lJN801IRLLeQ2EyRl4I+irByEMI1Xn1DcNp8TkFzmpqXweZDutKz8EQbIaD71iNs/edK13OKn47ifjvIPep52Uvn8T20ozeUQym+U3s07MqWh/B/CsFx2y47oUhB4+ifK+/kyW+I/5vmT8ZczDGd/7znGbCkCPGeXxbcZhsKI1Bvz9+nfGPo/KdMp/ctL183oWq7lWq7lX1ym9GO5nC3nn9WvZktUmkvbDXkadsuxs6PCvsnH59rZ0qS02fkcAubzblVe3jh2yyX27k+zlMb/ccczmwHCxQOe4TzRwbEu+BxRn46ORX66/wlfHtLh/erSvhz98+H606zv5z+m757wS95ywWcK8/5Hd/b8N6fnZ8UpwwqeqTo/HJ/ysRe7W8Q4ct1rXa/DeH3BO5kl5zj4OtZvUxcMj5xPLLHlqvr+JL08bUlAAJzf2MiZnXJBjvRkOyQndfBzduTrOGS/Z86FsKOcDq9tpMHM+FhYyTsLJ71w97LjYhkqcGW1k9gaA+GN8AAA3c17SgAylQ+bU1Ss+QyYaMRxD6fGTnHGsRsr944EA7qCtSPLWhQlTo/KESkmqOGlDjBoJJyV87s+B6hm3rP/q1kR/CpOJyGxH736WmzBgLUs3XIasJKUbOe8hOXO7Dw4nQ7khwjDgvasmQSAgI7hydsnMjQ+3D17h4Etw/MBPggIU4IlGTPt+lpFtY1MLiSPtyn+IRj4jQbqu9X0SIGyUQ3v1nBvK+r62B2MvNtarazwAy0a6lJy/3kyxsZwkgusEC74vI89ZpsHcfNM3RBFkZpx/MRFzSn8TELo+66cHuJTnJfQZKJFkBPUGgqfH6yk59pUqezY8ZsITom9mbMAD5+9c7Z/xTTWD2nLHBhAkCx4kOfACYYCQ1DjsRMOh1SKuTdsRpoz8HMTnbxLwPVTVlTnqY4U5MwZt7IZWQ6GHPOqp3x4zy+9QH5geuRQXOTHSJKf3RivyVV8Oq51pGzLKf/rZ9qVgxI7P2vRmmM4nFSfshTkYF1MHSYnZ+Nfmb4xGzW/TpDefeFGgZMPBAG/IXM4dfeeej8EaYz3z6EMAIW2X2UgOuVfDKsGdZzgkAk7+EX87fAWCCdQ+GBql16TgD6dHO9nKZSFOcQcaWFF7uZXCQw9m2N+Q5nmLlbmSuZLOrznaNwxvd6oBty4ZKUsiGWY49K98obP5ZXkNMibHZwLMBzvMz7p9WDj6pDbYQ5xc+i6XFeGnw1QBs8PfpMBXO+PIRTj+f0LGWHCp+W9uulxnslca9nQ1JJJFYoHgNCtLAT8mlTUjWQq+JO/XHHcs3RhtaK1ubV2HTAZ8PRwhS1PIR5OCoHsrVbbwN9RThkiiUFPs0DtkJxgzlxEyZ9ogg7buuFgGCcwHO81uTd5uV/5vbU7yb5xuyEpy7nVuacpsaSU/SAz7C8nUAxPHZNufe+y8mtWqxf7sj9IXa8h+eUFn+trDsC1XMu1oPwH00yz7sbOTtsAAAAASUVORK5CYII=";
const rowFor={besouro:0,larva:1,mosca:2};
const oldEnemy=a1DrawEnemy;
a1DrawEnemy=function(e){
 if(!ready)return oldEnemy(e);
 if(!e.alive)return;
 const row=rowFor[e.role]??0,frame=Math.floor(v9.time*(row===2?14:row===1?9:10))%4;
 const width=e.w+20,height=e.h+18;
 ctx.save();ctx.imageSmoothingEnabled=false;
 if(e.hurtTimer>0)ctx.globalAlpha=.65;
 if(e.dir<0){
  ctx.translate(Math.round(e.x+e.w),Math.round(e.y-8));ctx.scale(-1,1);
  ctx.drawImage(sprite,frame*S,row*S,S,S,0,0,width,height);
 }else{
  ctx.drawImage(sprite,frame*S,row*S,S,S,Math.round(e.x-10),Math.round(e.y-8),width,height);
 }
 ctx.restore();
 const hp=Math.max(0,e.hp/e.maxHp);
 ctx.fillStyle="rgba(6,12,15,.65)";ctx.fillRect(e.x,e.y-10,e.w,4);
 ctx.fillStyle="#a5c985";ctx.fillRect(e.x,e.y-10,e.w*hp,4);
};
function drawMini(b){
 if(!b||!b.alive||A1.node!=="mina")return;
 const frame=Math.floor(v9.time*9)%4,w=b.w+24,h=b.h+39;
 const x=b.x-12,y=b.y-28;
 ctx.save();ctx.imageSmoothingEnabled=false;
 if(b.flash>0)ctx.globalAlpha=.52;
 ctx.drawImage(sprite,frame*S,3*S,S,S,x,y,w,h);
 ctx.restore();
 if(b.state==="warn"||b.state==="slamWarn"){
  const rect=b.state==="warn"?
   {x:b.dir<0?b.x-(b.phase===2?330:270):b.x+b.w,
   y:b.y+24,w:b.phase===2?330:270,h:73}:
   {x:b.x-88,y:b.y+5,w:b.w+176,h:b.h+55};
  ctx.save();
  ctx.fillStyle="rgba(242,167,95,.14)";
  ctx.fillRect(rect.x,rect.y,rect.w,rect.h);
  ctx.strokeStyle="#f3ad75";ctx.lineWidth=3;
  ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);
  ctx.restore();
 }
 if(b.state==="slam"){
  ctx.save();ctx.fillStyle="rgba(164,233,176,.29)";
  ctx.fillRect(b.x-88,b.y+5,b.w+176,b.h+55);
  ctx.strokeStyle="#c5f4c6";ctx.lineWidth=4;
  ctx.strokeRect(b.x-88,b.y+5,b.w+176,b.h+55);
  ctx.restore();
 }
}
window.MacFrogV10EnemyArt=Object.freeze({
 ready:()=>ready,
 frames:4,
 enemyTypes:["besouro","larva","mosca"],
 miniboss:"Lacraia das Profundezas",
 atlasSize:[128,128],
 drawMini
});
})();