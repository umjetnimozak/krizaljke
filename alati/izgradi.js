const fs=require('fs'),path=require('path');const G=require('../stranica/gen.js');
const T=['o','f','r','p','a','m','k'],DIFF=['opca','teska','strucna'];
const SIZE={mala:{maxCells:150,maxW:15,maxH:17,min:120},srednja:{maxCells:250,maxW:21,maxH:23,min:205},velika:{maxCells:400,maxW:28,maxH:30,min:330}};
const bank={};
for(const t of T){bank[t]={};let cur=null;const txt=fs.readdirSync('pojmovi').filter(f=>new RegExp('^'+t+'\\d*\\.txt$').test(f)).sort().map(f=>fs.readFileSync('pojmovi/'+f,'utf8')).join('\n');for(const line of txt.split('\n')){const m=line.match(/^\[(\w+)\]/);if(m){cur=m[1];bank[t][cur]=bank[t][cur]||[];continue}if(!line.trim())continue;const [a,q]=line.split('|');if(!q)throw line;const A=G.norm(a);if(!G.ALLOWED.test(A))throw 'bad '+a;bank[t][cur].push({a:A,q:q.trim(),t})}}
for(const t of T)console.log(t,DIFF.map(d=>bank[t][d].length).join(' '));
// provjera duplikata unutar banke
for(const t of T)for(const d of DIFF){const s=new Set();for(const w of bank[t][d]){if(s.has(w.a))console.log('DUP',t,d,w.a);s.add(w.a)}}
const combos=[];for(let m=1;m<128;m++)combos.push(T.filter((_,i)=>m&(1<<i)));
const only=process.argv[2];
const out={},stats=[];let seed=1;
for(const d of DIFF)for(const [sz,o] of Object.entries(SIZE)){
  if(only&&only!==d+'-'+sz)continue;
  const files={};
  for(const th of combos){
    const used=new Map();
    for(let v=1;v<=3;v++){
      const id0=`${d}-${sz}-${th.join('')}-${v}`;
      // stare kombinacije (bez automoto) zadržavaju isti slijed pa se ne mijenjaju
      const old=!th.includes('m')&&!th.includes('k');const s1=old?seed++:G.hash(id0);const r=G.rng(s1*7919);
      // ravnomjerno miješanje tema
      const lists=th.map(t=>G.shuffle(bank[t][d],r));const pool=[];const L=Math.max(...lists.map(l=>l.length));
      for(let i=0;i<L;i++)for(const l of lists)if(l[i])pool.push(l[i]);
      const words=pool.map(w=>Object.assign({},w,{low:(used.get(w.a)||0)>0}));
      const cw=G.build(words,Object.assign({tries:10},o),old?seed*131:s1*131+7);
      cw.words.forEach(w=>used.set(w.a,(used.get(w.a)||0)+1));
      const id=`${d}-${sz}-${th.join('')}-${v}`;
      (files[th[0]]=files[th[0]]||{})[id]={id,teme:th,tezina:d,velicina:sz,verzija:v,w:cw.w,h:cw.h,words:cw.words.map(w=>[w.n,w.r,w.c,w.d,w.a,w.q])};
      stats.push({id,cells:cw.cells,w:cw.w,h:cw.h,n:cw.words.length,ok:cw.cells>=o.min});
    }
  }
  fs.mkdirSync('stranica/data',{recursive:true});
  for(const g in files)fs.writeFileSync(`stranica/data/${d}-${sz}-${g}.json`,JSON.stringify(files[g]));
}
const bad=stats.filter(s=>!s.ok);
console.log('ukupno',stats.length,'ispod minimuma',bad.length);
for(const sz of Object.keys(SIZE)){const s=stats.filter(x=>x.id.includes('-'+sz+'-'));if(!s.length)continue;const c=s.map(x=>x.cells);console.log(sz,'polja min',Math.min(...c),'max',Math.max(...c),'prosjek',(c.reduce((a,b)=>a+b)/c.length).toFixed(0),'dim max',Math.max(...s.map(x=>x.w)),'x',Math.max(...s.map(x=>x.h)))}
console.log(bad.slice(0,30).map(b=>b.id+':'+b.cells).join(' '));
