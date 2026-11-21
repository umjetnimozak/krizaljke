// Pretvara datoteke iz mape „nove” u križaljke (stranica/data/uploads.json).
// Pokreće se automatski na GitHubu pri svakoj promjeni; može i ručno: node alati/nove.js
const fs = require('fs'), path = require('path');
const G = require('../stranica/gen.js');
const DIR = path.join(__dirname, '..', 'nove'), OUT = path.join(__dirname, '..', 'stranica', 'data', 'uploads.json');
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => /\.(txt|csv)$/i.test(f)).sort((a, b) => a.localeCompare(b, 'hr')) : [];
const out = []; let bad = 0;
for (const f of files) {
  const id = 'u-' + f.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const r = G.fromText(fs.readFileSync(path.join(DIR, f), 'utf8'), id);
  if (r.errs.length) { bad++; console.log(`::error file=nove/${f}::${r.errs.join(' ')}`); continue; }
  if (!r.cw.naziv) r.cw.naziv = f.replace(/\.[^.]+$/, '');
  out.push(r.cw);
  console.log(`✓ ${f}: ${r.cw.words.length} pojmova, ${r.cw.cells} polja` + (r.left ? ` (${r.left} pojmova nije stalo u mrežu)` : ''));
  if (r.left) console.log(`::warning file=nove/${f}::${r.left} pojmova nije stalo u mrežu.`);
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`Gotovo: ${out.length} verzija spremljeno${bad ? `, ${bad} datoteka s greškama preskočeno` : ''}.`);
