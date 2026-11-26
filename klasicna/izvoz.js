// serija.json -> ../stranica/data/klasicne.json
const fs=require('fs'),A=require('./approved.js').load();
const S=JSON.parse(fs.readFileSync('serija.json','utf8'));const out=[];let bad=[];
for(const p of Object.values(S)){
 const words=p.words.map(w=>{const q=w.theme?w.q:(A.get(w.a)||{}).q;if(!q)bad.push(p.id+':'+w.a);return [w.n,w.r,w.c,w.d,w.a,q||'?']});
 out.push({id:p.id,tezina:p.tezina,velicina:p.velicina,verzija:p.verzija,tema:p.tema,w:p.w,h:p.h,words});
}
if(bad.length){console.error('BEZ PITANJA:',bad.join(' '));if(!process.env.FORCE)process.exit(1)}
fs.writeFileSync('../stranica/data/klasicne.json',JSON.stringify(out));console.log(out.length,'križaljki');
