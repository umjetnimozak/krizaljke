// Prva serija klasičnih križaljki: 3 težine × 3 veličine × 3 križaljke, svaka s jednim područjem kao „začinom”.
const fs=require('fs');const G2=require('./gen2.js');const W=require('./words.js');const A=require('./approved.js').load();const G=require('../stranica/gen.js');
const SIZES={mala:{N:11,ratio:0.2,maxRun:8},srednja:{N:13,ratio:0.22,maxRun:7},velika:{N:15,ratio:0.24,maxRun:7}};
const DIFF={opca:{lv:'LS',top:10000},teska:{lv:'LST',top:15000},strucna:{lv:'LST',top:20000}};
const THEMES=['o','f','r','p','a','m','k'];
function themeWords(t,d){const out=[];let cur;for(const f of fs.readdirSync('../pojmovi').filter(f=>new RegExp('^'+t+'\\d*\\.txt$').test(f))){for(const l of fs.readFileSync('../pojmovi/'+f,'utf8').split('\n')){const m=l.match(/^\[(\w+)\]/);if(m){cur=m[1];continue}if(cur!=d||!l.trim())continue;const[a,q]=l.split('|');const A2=G.norm(a);const tk=G.tok(A2);if(tk.length<3)continue;out.push({a:A2,t:tk,key:A2,score:12,q,theme:t})}}return out}
const gen=W.general();
const only=process.argv[2];const out=fs.existsSync('serija.json')?JSON.parse(fs.readFileSync('serija.json')):{};
let k=0;
for(const d of Object.keys(DIFF))for(const sz of Object.keys(SIZES))for(let v=1;v<=3;v++){
  const id=`${d}-${sz}-${v}`;if(only&&!id.startsWith(only))continue;
  if(out[id]&&out[id].words.every(w=>w.theme||A.has(w.a)))continue;
  if(out[id]&&process.env.NOREGEN)continue;
  const t=THEMES[(k++*3+v)%7];const D=DIFF[d],S=SIZES[sz];
  const th=themeWords(t,d);const keys=new Set(th.map(x=>x.key));
  const words=gen.filter(w=>!keys.has(w.a)&&((w.t.length<5&&A.has(w.a)&&D.lv.includes(A.get(w.a).lv))||(w.t.length>=5&&(process.env.ONLYAPP?(A.has(w.a)&&D.lv.includes(A.get(w.a).lv)):w.rank<D.top))))
  .map(w=>({...w,score:Math.log10(w.f)+(A.has(w.a)?3:0)}));
  const t0=Date.now();let res=null;const rr=G2.rng(k*1000+v*31);const idx=G2.buildIndex([...th,...words]);
  while(!res&&Date.now()-t0<(+process.env.LIMIT||300000)){const B=G2.pattern(S.N,S.ratio,S.maxRun,rr,3);if(!B)continue;res=G2.fill(B,S.N,idx,{noise:3,branch:30,nodeLimit:2000,lenPow:2},rr);if(res)res.B=B}
  if(!res){console.log(id,'NEUSPJEH',Date.now()-t0,'ms');continue}
  const N=S.N,slots=res.slots;
  // numeriranje kao u novinama
  const starts=new Map();let n=0;for(let r=0;r<N;r++)for(let c=0;c<N;c++){const k2=r*N+c;if(res.B[k2])continue;if(slots.some(s=>s.cells[0]==k2)){starts.set(k2,++n)}}
  const words2=slots.map(s=>({n:starts.get(s.cells[0]),r:(s.cells[0]/N)|0,c:s.cells[0]%N,d:s.d,a:s.word.a,theme:s.word.theme||null,q:s.word.q||null})).sort((a,b)=>a.n-b.n||(a.d<b.d?-1:1));
  out[id]={id,tezina:d,velicina:sz,verzija:v,tema:t,w:N,h:N,words:words2};
  const tl=words2.filter(w=>w.theme).reduce((a,w)=>a+G.tok(w.a).length,0),al=words2.reduce((a,w)=>a+G.tok(w.a).length,0);
  console.log(id,'tema',t,'ok',Date.now()-t0,'ms riječi',words2.length,'tema slova',Math.round(tl/al*100)+'%');
  fs.writeFileSync('serija.json',JSON.stringify(out));
}
