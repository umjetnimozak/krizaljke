# Križaljke

Stranica za rješavanje klasičnih (gustih, „američkih”) križaljki na hrvatskom: simetrične mreže s malo crnih polja, tri težine (lagana, srednja, teška) i tri veličine (mala 11 × 11, srednja 13 × 13, velika 15 × 15). Bira se jedno do tri područja (opća kultura, filmska kultura, rock&roll, povijest, astronomija, automoto, kozmetika): pojmovi su uglavnom opći, a pojmovi iz odabranih područja dolaze kao „začin”. Za svaku od 567 kombinacija (3 težine × 3 veličine × 63 skupa područja) postoje zasebne križaljke.

Nove križaljke slaže GitHub Actions svake noći (oko 3:17 po našem vremenu) u 9 usporednih poslova (težina × veličina), po 5 novih u svakom, za kombinacije koje ih imaju najmanje. Ručno se pokreće pod **Actions → Nove križaljke → Run workflow** (može se zadati broj, vrijeme i najmanji broj po kombinaciji).

Stranica: **https://mojekrizaljke.eu**

## Kako je složeno

- `stranica/` – objavljena stranica (`index.html`, `gen.js`) i križaljke u `stranica/data/{težina}-{veličina}-{područja}.json` (područja kao slova o, f, r, p, a, m, k, npr. `opca-mala-fr.json`).
- `klasicna/` – generator gustih mreža (`gen2.js`), skripte za popis riječi i serije te opće riječi s pitanjima u `klasicna/opce/` (oblik `ODGOVOR|pitanje|L/S/T`; L lagana, S srednja, T teška; `odbijeno.lst` su riječi koje se ne koriste).
- `pojmovi/` – pojmovi i pitanja po područjima (odjeljci `[opca]`, `[teska]`, `[strucna]` odgovaraju težinama lagana, srednja, teška).
- `.github/workflows/objava.yml` – automatska objava na GitHub Pages pri svakoj promjeni.

LJ, NJ i DŽ zauzimaju jedno polje.

## Izvori riječi

Popis kandidata za opće riječi izrađen je iz Hunspell rječnika za hrvatski (paket `dictionary-hr`, licenca LGPL-2.1 ili SISSL) i popisa čestotnosti riječi (hermitdave/FrequencyWords, sadržaj CC BY-SA 4.0). Izvorni popisi nisu u repozitoriju; u mrežu ulaze samo riječi kojima je napisano pitanje (`klasicna/opce`), a `klasicna/frek.json` čuva samo čestotnost tih riječi.
