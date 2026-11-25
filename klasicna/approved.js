const fs=require('fs');const G=require('../repo/stranica/gen.js');
function load(){const m=new Map();for(const f of fs.readdirSync(__dirname+'/opce').sort()){if(!f.endsWith('.txt'))continue;for(const l of fs.readFileSync(__dirname+'/opce/'+f,'utf8').split('\n')){if(!l.trim()||l.startsWith('#'))continue;const [a,q,lv]=l.split('|');if(!q)continue;m.set(a,{a,q,lv})}}return m}
module.exports={load};
