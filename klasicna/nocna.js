// Noćno dodavanje: složi nekoliko novih križaljki za kombinacije (težina × veličina × područje) koje ih imaju najmanje.
// node klasicna/nocna.js [broj] — vrijeme ograničava MINUTA (zadano 25).
const S=require('./slozi.js');
const COUNT=+process.argv[2]||12,END=Date.now()+(+process.env.MINUTA||25)*60000,MIN=+process.env.NAJMANJE||0;
const general=S.approved(),day=Math.floor(Date.now()/864e5);
const combos=[];for(const d of Object.keys(S.DIFF).filter(d=>!process.env.TEZINA||d==process.env.TEZINA))for(const s of Object.keys(S.SIZES))for(const t of S.THEMES)combos.push({d,s,t,n:S.readCombo(d,s,t).length});
let made=0,tries=0;
while(made<COUNT&&Date.now()<END){
  combos.sort((a,b)=>a.n-b.n||((a.d+a.s+a.t+day).length%3)-((b.d+b.s+b.t+day).length%3)||Math.random()-.5);
  const c=combos[0];if(MIN&&c.n>=MIN)break;
  const list=S.readCombo(c.d,c.s,c.t),recent=new Set(list.slice(-6).flatMap(p=>p.words.map(w=>w[4])));
  const p=S.make({...c,general,recent,seed:day*7919+c.n*104729+(tries++)*31+c.d.length*7+c.s.length,limit:Math.min(240000,END-Date.now())});
  if(!p||!S.check(p)){console.log(`${c.d}-${c.s}-${c.t} neuspjeh`);c.n+=0.5;continue}
  const v=S.add(c.d,c.s,c.t,p);c.n=v;made++;
  console.log(`${c.d}-${c.s}-${c.t}-${v} ok ${p.ms} ms, ${p.words.length} riječi, tema ${p.words.filter(w=>w.theme).length}`);
}
console.log('novih križaljki:',made);
