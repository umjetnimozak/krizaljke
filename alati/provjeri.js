const D0=require('path').join(__dirname,'../stranica/data');
const fs=require('fs');const G=require('../stranica/gen.js');let n=0,bad=0;const lim={mala:150,srednja:250,velika:400};let overlap=[];
for(const f of fs.readdirSync(D0).filter(f=>f!=='uploads.json')){const D=JSON.parse(fs.readFileSync(D0+'/'+f));
 for(const p of Object.values(D)){n++;const g={};let err='';const set=new Set();
  for(const [num,r,c,d,src] of p.words){const a=G.tok(src);if(set.has(src))err+='dup '+src;set.add(src);for(let i=0;i<a.length;i++){const k=(r+(d=='D'?i:0))+','+(c+(d=='A'?i:0));if(g[k]&&g[k]!=a[i])err+=' conflict';g[k]=a[i]}}
  const cells=Object.keys(g).length;if(cells>lim[p.velicina])err+=' too many '+cells;
  const starts=new Set(p.words.map(w=>w[1]+','+w[2]+','+w[3]));
  for(let r=0;r<p.h;r++)for(let c=0;c<p.w;c++){if(!g[r+','+c])continue;
   if(!g[r+','+(c-1)]&&g[r+','+(c+1)]&&!starts.has(r+','+c+',A'))err+=' stray A@'+r+','+c;
   if(!g[(r-1)+','+c]&&g[(r+1)+','+c]&&!starts.has(r+','+c+',D'))err+=' stray D@'+r+','+c;}
  if(err){bad++;if(bad<5)console.log(p.id,err)}}
 // preklapanje verzija
 const ids=Object.keys(D).filter(i=>i.endsWith('-1'));for(const i of ids){const b=i.slice(0,-1);const s=[1,2,3].map(v=>new Set(D[b+v].words.map(w=>w[4])));const inter=[...s[0]].filter(x=>s[1].has(x)).length/s[0].size;overlap.push([b,inter])}}
console.log('provjereno',n,'neispravnih',bad);
const single=overlap.filter(([b])=>/-[ofrpa]-$/.test(b));const multi=overlap.filter(([b])=>!/-[ofrpa]-$/.test(b));
const avg=a=>(a.reduce((s,x)=>s+x[1],0)/a.length*100).toFixed(0)+'%';
console.log('preklapanje v1/v2 jedno područje',avg(single),'više područja',avg(multi));
for(const sz of ['mala','srednja','velika'])console.log(sz,avg(overlap.filter(([b])=>b.includes(sz)&&/-[ofrpa]-$/.test(b))));
