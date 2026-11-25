const fs=require('fs');const G=require('../repo/stranica/gen.js');
// vulgarne i uvredljive riječi ne ulaze u križaljke
const BLOCK=/^(PIČK|KUR[AC]|KURČ|JEB|PIZD|ŠUPAK|GOVN|SRAN|SRAT|DROLJ|KURV|PEDER|CIGAN|CRNČ|RETARD|SERONJ|PRDE|DUPENC|GUZ|SISA|SISE|KITA$|MRŠ|ŠMRK|DOP|KOKAIN|HEROIN|DRK|MAMOJEB|PEDERČIN|LEZBA|FUFA|KUČK|NAKAZ|IDIOT|DEBIL|KRETEN|MORON|GLUPAN|BUDAL|KOMUNJAR|ČETNI|USTAŠ|PEDOFIL|SILOVA|UBI)/;
function general(){
  const raw=JSON.parse(fs.readFileSync(__dirname+'/lex_raw.json'));
  return raw.filter(o=>!BLOCK.test(o.a)).map((o,i)=>({a:o.a,t:G.tok(o.a),key:o.a,f:o.f,rank:i,proper:o.proper}));
}
module.exports={general,BLOCK};
