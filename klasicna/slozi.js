// Slaže klasične guste križaljke samo od riječi s napisanim pitanjem (klasicna/opce) i pojmova područja (pojmovi/).
// Koristi ga noćno dodavanje (nocna.js); radi bez izvornih popisa rječnika.
const fs=require('fs'),path=require('path');
const G2=require('./gen2.js'),G=require('../stranica/gen.js'),{BLOCK}=require('./words.js');
const SIZES={mala:{N:11,ratio:0.2,maxRun:8},srednja:{N:13,ratio:0.22,maxRun:7},velika:{N:15,ratio:0.24,maxRun:7}};
const DIFF={opca:{lv:'LS'},teska:{lv:'LST'},strucna:{lv:'LST'}};
const THEMES=['o','f','r','p','a','m','k'];
const DATA=path.join(__dirname,'../stranica/data');

function approved(){
  const A=require('./approved.js').load(),F=JSON.parse(fs.readFileSync(path.join(__dirname,'frek.json')));
  const rej=new Set(fs.readFileSync(path.join(__dirname,'opce/odbijeno.lst'),'utf8').split('\n').map(x=>x.trim()).filter(Boolean));
  return [...A.values()].filter(w=>!rej.has(w.a)&&!BLOCK.test(w.a)).map(w=>({...w,f:F[w.a]||10}));
}
function themeWords(t,d){
  const out=[],dir=path.join(__dirname,'../pojmovi');let cur;
  for(const f of fs.readdirSync(dir).filter(f=>new RegExp('^'+t+'\\d*\\.txt$').test(f)))
    for(const l of fs.readFileSync(path.join(dir,f),'utf8').split('\n')){
      const m=l.match(/^\[(\w+)\]/);if(m){cur=m[1];continue}
      if(cur!=d||!l.trim())continue;const[a,q]=l.split('|');const a2=G.norm(a),tk=G.tok(a2);
      if(tk.length<3||!q)continue;out.push({a:a2,t:tk,key:a2,score:+process.env.TEMA_BOD||12,q:q.trim(),theme:t});
    }
  return out;
}
const file=(d,s,t)=>path.join(DATA,`${d}-${s}-${t}.json`);
const readCombo=(d,s,t)=>fs.existsSync(file(d,s,t))?JSON.parse(fs.readFileSync(file(d,s,t))):[];

// složi jednu križaljku; recent = riječi iz nedavnih križaljki iste kombinacije (dobivaju manju prednost)
function make({d,s,t,seed,limit=240000,general,recent=new Set()}){
  const D=DIFF[d],S=SIZES[s];
  const th=themeWords(t,d),keys=new Set(th.map(x=>x.key));
  const words=general.filter(w=>!keys.has(w.a)&&D.lv.includes(w.lv)).map(w=>({a:w.a,t:G.tok(w.a),key:w.a,q:w.q,score:Math.log10(w.f)-(recent.has(w.a)?2:0)}));
  const rr=G2.rng(seed),idx=G2.buildIndex([...th,...words]),t0=Date.now();let res=null;
  while(!res&&Date.now()-t0<limit){const B=G2.pattern(S.N,S.ratio,S.maxRun,rr,3);if(!B)continue;res=G2.fill(B,S.N,idx,{noise:3,branch:30,nodeLimit:2000,lenPow:2},rr);if(res)res.B=B}
  if(!res)return null;
  const N=S.N,slots=res.slots,starts=new Map();let n=0;
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){const k=r*N+c;if(!res.B[k]&&slots.some(x=>x.cells[0]==k))starts.set(k,++n)}
  const ws=slots.map(x=>({n:starts.get(x.cells[0]),r:(x.cells[0]/N)|0,c:x.cells[0]%N,d:x.d,a:x.word.a,q:x.word.q,theme:x.word.theme||null}))
    .sort((a,b)=>a.n-b.n||(a.d<b.d?-1:1));
  return {w:N,h:N,ms:Date.now()-t0,words:ws};
}
// provjera: nema sukoba, nema bijelih nizova bez pitanja, nema ponavljanja
function check(p){
  const g=Array.from({length:p.h},()=>Array(p.w).fill(null)),seen=new Set(),set=new Set();
  for(const w of p.words){if(seen.has(w.a)||!w.q)return false;seen.add(w.a);set.add(w.d+w.r+','+w.c);
    for(const[i,ch]of G.tok(w.a).entries()){const r=w.r+(w.d=='D'?i:0),c=w.c+(w.d=='A'?i:0);if(g[r][c]&&g[r][c]!=ch)return false;g[r][c]=ch}}
  for(const d of['A','D'])for(let r=0;r<p.h;r++)for(let c=0;c<p.w;c++){if(!g[r][c])continue;
    if(d=='A'?(c>0&&g[r][c-1]):(r>0&&g[r-1][c]))continue;let L=0;while(d=='A'?(c+L<p.w&&g[r][c+L]):(r+L<p.h&&g[r+L][c]))L++;
    if(L>=2&&!set.has(d+r+','+c))return false}
  return true;
}
function add(d,s,t,p,extra={}){
  const list=readCombo(d,s,t),v=list.length+1;
  list.push({id:`${d}-${s}-${t}-${v}`,v,datum:extra.datum||new Date().toISOString().slice(0,10),w:p.w,h:p.h,words:p.words.map(w=>[w.n,w.r,w.c,w.d,w.a,w.q])});
  fs.mkdirSync(DATA,{recursive:true});fs.writeFileSync(file(d,s,t),JSON.stringify(list));return v;
}
module.exports={SIZES,DIFF,THEMES,approved,themeWords,readCombo,make,check,add,file};
