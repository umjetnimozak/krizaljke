// Gradi popis općih riječi: osnovni oblici iz Hunspell rječnika (hr) koji su česti u korpusu titlova.
const fs=require('fs');const G=require('../stranica/gen.js');
const stems=new Map();
for(const line of fs.readFileSync('dhr/package/index.dic','utf8').split('\n').slice(1)){
  const w=line.split('/')[0].trim();if(!w||/[^A-Za-zČĆĐŠŽčćđšž]/.test(w))continue;
  const lc=w.toLocaleLowerCase('hr');const proper=w[0]!==w[0].toLocaleLowerCase('hr');
  if(!stems.has(lc))stems.set(lc,proper);else if(!proper)stems.set(lc,false);
}
const freq=new Map();
for(const line of fs.readFileSync('fw/content/2018/hr/hr_full.txt','utf8').split('\n')){const [w,n]=line.split(' ');if(w&&n)freq.set(w,+n)}
const out=[];
for(const [lc,proper] of stems){const f=freq.get(lc)||0;if(f<20)continue;const A=G.norm(lc);if(!G.ALLOWED.test(A))continue;const L=G.tok(A).length;if(L<2||L>13)continue;out.push({a:A,f,proper,len:L})}
out.sort((x,y)=>y.f-x.f);
fs.writeFileSync('lex_raw.json',JSON.stringify(out));
const byLen={};out.forEach(o=>byLen[o.len]=(byLen[o.len]||0)+1);
console.log('ukupno',out.length,'vlastitih',out.filter(o=>o.proper).length,'po duljini',JSON.stringify(byLen));
console.log('primjeri vrh:',out.slice(0,40).map(o=>o.a).join(' '));
console.log('primjeri 3000.:',out.slice(3000,3040).map(o=>o.a).join(' '));
console.log('primjeri 12000.:',out.slice(12000,12040).map(o=>o.a).join(' '));
