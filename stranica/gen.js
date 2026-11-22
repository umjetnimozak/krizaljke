// Generator križaljki (slobodna mreža). Radi u pregledniku i u Nodeu.
(function (root) {
  const ALLOWED = /^[A-ZČĆĐŠŽ+]+$/;
  // LJ, NJ i DŽ su jedno slovo (jedno polje); znak + ih razdvaja kad treba
  function tok(s) { const o = []; for (let i = 0; i < s.length; i++) { const c = s[i], n = s[i + 1]; if (c === '+') continue; if ((c === 'L' || c === 'N') && n === 'J' || c === 'D' && n === 'Ž') { o.push(c + n); i++; } else o.push(c); } return o; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function norm(s) { return String(s).toLocaleUpperCase('hr').replace(/[\s\-.'’]/g, ''); }

  // jedan pokušaj slaganja
  function attempt(words, opt, r) {
    const { maxCells, maxW, maxH } = opt;
    const K = (rr, cc) => (rr + 512) * 2048 + (cc + 512);
    const cell = new Map(); // key -> {ch, h, v}
    const idx = new Map(); // slovo -> [[r,c]]
    const placed = [];
    let r0 = 0, r1 = -1, c0 = 0, c1 = -1;
    const put = (w, row, col, d) => {
      for (let i = 0; i < w.a.length; i++) {
        const rr = row + (d === 'D' ? i : 0), cc = col + (d === 'A' ? i : 0), k = K(rr, cc);
        let o = cell.get(k);
        if (!o) { o = { ch: w.a[i], h: false, v: false }; cell.set(k, o); if (!idx.has(o.ch)) idx.set(o.ch, []); idx.get(o.ch).push([rr, cc]); }
        if (d === 'A') o.h = true; else o.v = true;
      }
      placed.push({ w, r: row, c: col, d });
      const er = row + (d === 'D' ? w.a.length - 1 : 0), ec = col + (d === 'A' ? w.a.length - 1 : 0);
      if (placed.length === 1) { r0 = row; c0 = col; r1 = er; c1 = ec; } else { r0 = Math.min(r0, row); c0 = Math.min(c0, col); r1 = Math.max(r1, er); c1 = Math.max(c1, ec); }
    };
    const check = (a, row, col, d) => {
      const dr = d === 'D' ? 1 : 0, dc = d === 'A' ? 1 : 0, L = a.length;
      if (cell.has(K(row - dr, col - dc)) || cell.has(K(row + dr * L, col + dc * L))) return null;
      let cross = 0, fresh = 0;
      for (let i = 0; i < L; i++) {
        const rr = row + dr * i, cc = col + dc * i, o = cell.get(K(rr, cc));
        if (o) { if (o.ch !== a[i] || (d === 'A' ? o.h : o.v)) return null; cross++; }
        else { if (cell.has(K(rr + dc, cc + dr)) || cell.has(K(rr - dc, cc - dr))) return null; fresh++; }
      }
      if (!cross) return null;
      const nr0 = Math.min(r0, row), nc0 = Math.min(c0, col), nr1 = Math.max(r1, row + dr * (L - 1)), nc1 = Math.max(c1, col + dc * (L - 1));
      const W = nc1 - nc0 + 1, H = nr1 - nr0 + 1;
      if (W > maxW || H > maxH) return null;
      return { cross, fresh, area: W * H, W, H };
    };
    const order = words.slice();
    // prva riječ: duga, ali ne preduga
    const fi = order.findIndex(w => w.a.length >= 6 && w.a.length <= Math.min(maxW, 11));
    const first = order.splice(fi >= 0 ? fi : 0, 1)[0];
    if (first.a.length > maxW || first.a.length > maxCells) return null;
    put(first, 0, 0, 'A');
    let cells = first.a.length;
    for (let pass = 0; pass < 3 && cells < maxCells; pass++) {
      for (let wi = 0; wi < order.length; wi++) {
        const w = order[wi]; if (!w) continue;
        if (cells + 1 > maxCells) break;
        let best = null;
        for (let i = 0; i < w.a.length; i++) {
          const ps = idx.get(w.a[i]); if (!ps) continue;
          for (const [pr, pc] of ps) for (const d of ['A', 'D']) {
            const row = d === 'D' ? pr - i : pr, col = d === 'A' ? pc - i : pc;
            const s = check(w.a, row, col, d); if (!s) continue;
            if (cells + s.fresh > maxCells) continue;
            const sc = s.cross * 30 - s.area * 0.6 - Math.abs(s.W - s.H) * 2 + r() * 6;
            if (!best || sc > best.sc) best = { sc, row, col, d, fresh: s.fresh };
          }
        }
        if (best) { put(w, best.row, best.col, best.d); cells += best.fresh; order[wi] = null; }
      }
    }
    return { placed, cells, r0, c0, W: c1 - c0 + 1, H: r1 - r0 + 1 };
  }

  function build(words, opt, seed) {
    const r = rng(seed);
    const clean = []; const seen = new Set();
    for (const w of words) { const src = norm(w.a); if (!ALLOWED.test(src) || seen.has(src)) continue; const a = tok(src); if (a.length < 2) continue; seen.add(src); clean.push({ a, src, q: w.q, t: w.t, low: w.low }); }
    let best = null;
    const tries = opt.tries || 12;
    for (let t = 0; t < tries; t++) {
      // prioritetni dio ostaje sprijeda, ali se lagano miješa
      const pri = clean.filter(w => !w.low), low = clean.filter(w => w.low);
      const list = shuffle(pri, r).concat(shuffle(low, r));
      const res = attempt(list, opt, r); if (!res) continue;
      const score = res.cells * 10 - res.W * res.H * 1.5 + res.placed.length * 4;
      if (!best || score > best.score) best = Object.assign(res, { score });
    }
    if (!best) return null;
    const ws = best.placed.map(p => ({ r: p.r - best.r0, c: p.c - best.c0, d: p.d, a: p.w.src, q: p.w.q, t: p.w.t }));
    const starts = [...new Set(ws.map(w => w.r * 1000 + w.c))].sort((a, b) => a - b);
    ws.forEach(w => { w.n = starts.indexOf(w.r * 1000 + w.c) + 1; });
    ws.sort((a, b) => a.n - b.n || (a.d < b.d ? -1 : 1));
    return { w: best.W, h: best.H, cells: best.cells, words: ws };
  }

  // ---- čitanje datoteke s novom verzijom (zajedničko za stranicu i GitHub skriptu) ----
  const SIZES = { mala: { maxCells: 150, maxW: 15, maxH: 17 }, srednja: { maxCells: 250, maxW: 21, maxH: 23 }, velika: { maxCells: 400, maxW: 28, maxH: 30 } };
  const THEMES = ['o', 'f', 'r', 'p', 'a', 'm', 'k'];
  const ALIAS = { 'opća kultura': 'o', 'opca kultura': 'o', 'opća': 'o', 'opca': 'o', 'filmska kultura': 'f', 'film': 'f', 'filmska': 'f', 'rock&roll': 'r', 'rock and roll': 'r', 'rock': 'r', 'rocknroll': 'r', 'povijest': 'p', 'astronomija': 'a', 'automoto': 'm', 'auto-moto': 'm', 'auto moto': 'm', 'kozmetika': 'k' };
  const DAL = { 'opća': 'opca', 'opca': 'opca', 'teška': 'teska', 'teska': 'teska', 'stručna': 'strucna', 'strucna': 'strucna' };
  function parse(txt) {
    const meta = {}, rows = [], errs = [];
    String(txt).replace(/^\uFEFF/, '').split(/\r?\n/).forEach((line, i) => {
      const L = line.trim(); if (!L || L.startsWith('#')) return;
      const m = L.match(/^(područja|podrucja|teme|tema|težina|tezina|veličina|velicina|naziv)\s*:\s*(.+)$/i);
      if (m) { meta[m[1].toLowerCase().replace('č', 'c').replace('ž', 'z').replace('đ', 'd')] = m[2].trim(); return; }
      const parts = L.split(/\s*[|;]\s*/);
      if (parts.length < 2 || !parts[1]) { errs.push('Redak ' + (i + 1) + ': nedostaje pitanje.'); return; }
      const a = norm(parts[0]);
      if (!ALLOWED.test(a) || tok(a).length < 2) { errs.push('Redak ' + (i + 1) + ': „' + parts[0] + '” sadrži nedopušten znak ili je prekratak.'); return; }
      rows.push({ a, q: parts.slice(1).join('; ') });
    });
    const tRaw = meta['podrucja'] || meta['teme'] || meta['tema'] || '';
    const t = [...new Set(tRaw.split(',').map(x => ALIAS[x.trim().toLowerCase()]).filter(Boolean))];
    if (!t.length) errs.push('Nedostaje ili nije prepoznat redak „područja:”.');
    if (tRaw.split(',').some(x => x.trim() && !ALIAS[x.trim().toLowerCase()])) errs.push('Neko područje nije prepoznato: ' + tRaw);
    const d = DAL[(meta['tezina'] || '').toLowerCase()]; if (!d) errs.push('Težina mora biti opća, teška ili stručna.');
    const s = (meta['velicina'] || '').toLowerCase(); if (!SIZES[s]) errs.push('Veličina mora biti mala, srednja ili velika.');
    if (rows.length < 5) errs.push('Potrebno je barem 5 pojmova.');
    return { t, d, s, naziv: meta['naziv'] || '', rows, errs };
  }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  // iz teksta datoteke napravi gotovu križaljku; isti tekst uvijek daje istu mrežu
  function fromText(txt, id) {
    const p = parse(txt); if (p.errs.length) return { errs: p.errs };
    const cw = build(p.rows, Object.assign({ tries: 25 }, SIZES[p.s]), hash(txt));
    if (!cw) return { errs: ['Od ovih pojmova nije moguće složiti mrežu. Dodaj još pojmova koji dijele slova.'] };
    const tk = THEMES.filter(k => p.t.includes(k)).join('');
    return { errs: [], left: p.rows.length - cw.words.length, cw: { id, naziv: p.naziv, teme: p.t, tk, tezina: p.d, velicina: p.s, w: cw.w, h: cw.h, cells: cw.cells, words: cw.words.map(w => [w.n, w.r, w.c, w.d, w.a, w.q]) } };
  }
  const api = { build, rng, shuffle, norm, tok, ALLOWED, parse, fromText, hash, SIZES, THEMES };
  if (typeof module !== 'undefined') module.exports = api; else root.KrizGen = api;
})(this);
