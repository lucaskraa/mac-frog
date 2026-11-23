'use strict';
// Reversible extraction of five embedded original WebP atlases.
// Usage: node tools/extract-atlases.cjs
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'game_v25.html'),'utf8');
const out=path.join(root,'assets','extracted');
fs.mkdirSync(out,{recursive:true});
const names=['windAtlas','waterAttackAtlas','aquaticAtlas','macAtlas','flyAtlas'];
const manifest={format:'webp',source:'game_v25.html',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),atlases:[],animationMeta:{}};
for(const name of names){
 const regex=new RegExp('\\b'+name+'\\.src\\s*=\\s*"data:image\\/webp;base64,([A-Za-z0-9+/=]+)"');
 const match=source.match(regex);
 if(!match)throw Error('Atlas not found in original HTML: '+name);
 const bytes=Buffer.from(match[1],'base64');
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'){
   throw Error('Invalid WebP signature: '+name);
 }
 const basename=name.replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase()+'.webp';
 fs.writeFileSync(path.join(out,basename),bytes);
 manifest.atlases.push({name,filename:basename,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),sourceEncoding:'data:image/webp;base64'});
}
for(const m of source.matchAll(/const ([A-Z_]+_ATLAS_META)\s*=\s*(\{[^\n;]*\});/g)){
 try{manifest.animationMeta[m[1]]=JSON.parse(m[2])}
 catch(e){throw Error('Cannot parse atlas frame metadata: '+m[1])}
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Extracted',manifest.atlases.length,'WebP atlases,',Object.keys(manifest.animationMeta).length,'animation tables');
console.log(JSON.stringify(manifest.atlases,null,2));
