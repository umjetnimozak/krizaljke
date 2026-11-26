// Generator „američke” križaljke: simetrični uzorak crnih polja + popunjavanje riječima (pretraga s povratkom).
// Riječi su nizovi znakova-polja (LJ, NJ, DŽ = jedno polje).
'use strict';
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}

// ---------- uzorak ----------
function runs(B,N){ // vrati sve nizove bijelih polja (vodoravno i okomito)
  const out=[];
  for(const d of['A','D'])for(let i=0;i<N;i++){let s=-1;for(let j=0;j<=N;j++){const r=d=='A'?i:j,c=d=='A'?j:i;const white=j<N&&!B[r*N+c];if(white&&s<0)s=j;if(!white&&s>=0){out.push({d,i,s,len:j-s});s=-1}}}
  return out;
}
function connected(B,N){let start=-1,white=0;for(let k=0;k<N*N;k++)if(!B[k]){white++;if(start<0)start=k}
  if(start<0)return false;const seen=new Uint8Array(N*N),st=[start];seen[start]=1;let n=0;
  while(st.length){const k=st.pop();n++;const r=(k/N)|0,c=k%N;for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=N||cc>=N)continue;const kk=rr*N+cc;if(!B[kk]&&!seen[kk]){seen[kk]=1;st.push(kk)}}}
  return n==white}
function lineRuns(B,N,d,i){const out=[];let s=-1;for(let j=0;j<=N;j++){const r=d=='A'?i:j,c=d=='A'?j:i;const w=j<N&&!B[r*N+c];if(w&&s<0)s=j;if(!w&&s>=0){out.push(j-s);s=-1}}return out}
function pattern(N,ratio,maxRun,r,minRun){
  minRun=minRun||2;
  for(let attempt=0;attempt<600;attempt++){
    const B=new Uint8Array(N*N);let blocks=0;const target=Math.round(N*N*ratio);
    for(let tries=0;tries<N*N*30&&blocks<target;tries++){
      const k=Math.floor(r()*N*N),k2=N*N-1-k;if(B[k])continue;
      B[k]=B[k2]=1;
      let ok=true;
      for(const kk of[k,k2]){const rr=(kk/N)|0,cc=kk%N;
        if(lineRuns(B,N,'A',rr).some(x=>x<minRun)||lineRuns(B,N,'D',cc).some(x=>x<minRun)){ok=false;break}}
      if(ok&&!connected(B,N))ok=false;
      if(!ok){B[k]=B[k2]=0;continue}
      blocks+=k==k2?1:2;
    }
    const R=runs(B,N);
    if(R.every(x=>x.len>=minRun&&x.len<=maxRun)&&connected(B,N))return B;
  }
  return null;
}

// ---------- popunjavanje ----------
function buildIndex(words){ // words: [{t:[...], key, score}]
  const byLen=new Map();
  for(const w of words){const L=w.t.length;if(!byLen.has(L))byLen.set(L,[]);byLen.get(L).push(w)}
  const idx=new Map();
  for(const[L,list]of byLen){
    const nw=Math.ceil(list.length/32);const pos=[];
    for(let p=0;p<L;p++){const m=new Map();list.forEach((w,i)=>{const ch=w.t[p];let bs=m.get(ch);if(!bs){bs=new Uint32Array(nw);m.set(ch,bs)}bs[i>>>5]|=1<<(i&31)});pos.push(m)}
    idx.set(L,{list,nw,pos});
  }
  return idx;
}
function fill(B,N,idx,opt,r){
  const slots=[];const cellSlots=Array.from({length:N*N},()=>[]);
  for(const x of runs(B,N)){const cells=[];for(let j=0;j<x.len;j++){const rr=x.d=='A'?x.i:x.s+j,cc=x.d=='A'?x.s+j:x.i;cells.push(rr*N+cc)}
    const s={d:x.d,cells,len:x.len,word:null};slots.push(s);cells.forEach((k,p)=>cellSlots[k].push({s,p}))}
  if(slots.some(s=>!idx.has(s.len)))return null;
  const grid=new Array(N*N).fill(null),used=new Set();
  const cand=s=>{const I=idx.get(s.len);let acc=null;
    for(let p=0;p<s.len;p++){const ch=grid[s.cells[p]];if(ch==null)continue;const bs=I.pos[p].get(ch);if(!bs)return{I,acc:new Uint32Array(I.nw),n:0};
      if(!acc)acc=bs.slice();else for(let i=0;i<I.nw;i++)acc[i]&=bs[i]}
    if(!acc){acc=new Uint32Array(I.nw).fill(0xFFFFFFFF);const extra=I.nw*32-I.list.length;if(extra)acc[I.nw-1]>>>=extra}
    let n=0;for(let i=0;i<I.nw;i++){let v=acc[i];while(v){v&=v-1;n++}}return{I,acc,n}};
  let nodes=0;const limit=opt.nodeLimit||200000;
  function pick(){let best=null,bk=1e18,bc=null,bn=0;const lp=opt.lenPow||0;for(const s of slots){if(s.word)continue;const c=cand(s);if(c.n==0)return{s,c,n:0};const key=c.n/Math.pow(s.len,lp);if(key<bk){bk=key;best=s;bc=c;bn=c.n}}return{s:best,c:bc,n:bn}}
  function solve(){
    if(++nodes>limit)return false;
    const{s,c,n}=pick();if(!s)return true;if(n==0)return false;
    // kandidati: tematske riječi prve, zatim po čestotnosti uz malo nasumičnosti
    const list=[];for(let i=0;i<c.I.nw;i++){let v=c.acc[i];while(v){const b=31-Math.clz32(v&-v);v&=v-1;const w=c.I.list[i*32+b];if(!used.has(w.key))list.push(w)}}
    list.forEach(w=>w._k=w.score+r()*opt.noise);list.sort((a,b)=>b._k-a._k);
    const tryN=Math.min(list.length,opt.branch||40);
    for(let t=0;t<tryN;t++){const w=list[t];const prev=s.cells.map(k=>grid[k]);
      s.cells.forEach((k,p)=>grid[k]=w.t[p]);s.word=w;used.add(w.key);
      // provjera unaprijed: svaki križni utor mora imati barem jednog kandidata
      let ok=true;for(const k of s.cells)for(const{s:o}of cellSlots[k]){if(o===s||o.word)continue;if(cand(o).n==0){ok=false;break}}if(!ok){}
      if(ok&&solve())return true;
      used.delete(w.key);s.word=null;s.cells.forEach((k,p)=>grid[k]=prev[p]);
      if(nodes>limit)return false;
    }
    return false;
  }
  // 1. faza: u dulje utore najprije stavi tematske riječi (dok ne dosegnemo ciljni udio slova)
  if(opt.themeIdx){
    const totalLetters=slots.reduce((a,s)=>a+s.len,0);let themeLetters=0;
    const order=slots.filter(s=>s.len>=(opt.themeMinLen||6)).sort((a,b)=>b.len-a.len+(r()-0.5)*3);
    for(const s of order){
      if(themeLetters>=opt.themeTarget*totalLetters)break;if(s.word)continue;
      const TI=opt.themeIdx;if(!TI.has(s.len))continue;
      const I=TI.get(s.len);let acc=new Uint32Array(I.nw).fill(0xFFFFFFFF);const ex=I.nw*32-I.list.length;if(ex)acc[I.nw-1]>>>=ex;
      for(let p=0;p<s.len;p++){const ch=grid[s.cells[p]];if(ch==null)continue;const bs=I.pos[p].get(ch);if(!bs){acc.fill(0);break}for(let i=0;i<I.nw;i++)acc[i]&=bs[i]}
      const list=[];for(let i=0;i<I.nw;i++){let v=acc[i];while(v){const b=31-Math.clz32(v&-v);v&=v-1;const w=I.list[i*32+b];if(!used.has(w.key))list.push(w)}}
      for(let i=list.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[list[i],list[j]]=[list[j],list[i]]}
      for(const w of list.slice(0,25)){const prev=s.cells.map(k=>grid[k]);s.cells.forEach((k,p)=>grid[k]=w.t[p]);
        // svaki križni utor mora i dalje imati dovoljno općih kandidata
        let ok=true;for(const k of s.cells)for(const{s:o}of cellSlots[k]){if(o===s||o.word)continue;if(cand(o).n<(opt.minCross||3)){ok=false;break}}
        if(ok){s.word=w;used.add(w.key);themeLetters+=s.len;break}
        s.cells.forEach((k,p)=>grid[k]=prev[p]);}
    }
  }
  return solve()?{slots,grid}:null;
}

// ---------- jedna križaljka ----------
function make({N,ratio,maxRun,words,themeWords,themeTarget,seed,nodeLimit,maxPatterns,seedTries,lenPow,minCross,themeMinLen,minRun}){
  const r=rng(seed);const idx=buildIndex(words);const themeIdx=themeWords&&themeWords.length?buildIndex(themeWords):null;
  for(let p=0;p<(maxPatterns||30);p++){
    const B=pattern(N,ratio,maxRun,r,minRun);if(!B)continue;
    for(let t=0;t<(seedTries||4);t++){
      const res=fill(B,N,idx,{noise:opt_noise,branch:30,nodeLimit,themeIdx,themeTarget:themeTarget||0.3,minCross:minCross||25,themeMinLen:themeMinLen||6,lenPow:lenPow==null?2:lenPow},r);
      if(res)return{N,B,...res};
    }
  }
  return null;
}
const opt_noise=3;
module.exports={pattern,runs,fill,make,buildIndex,rng,lineRuns};
