# Križaljke

Stranica za rješavanje klasičnih (gustih, „američkih”) križaljki na hrvatskom: simetrične mreže s malo crnih polja, tri težine (lagana, srednja, teška) i tri veličine (mala 11 × 11, srednja 13 × 13, velika 15 × 15). Pojmovi su uglavnom opći, a svaka križaljka ima i nekoliko pojmova iz jednog područja (opća kultura, filmska kultura, rock&roll, povijest, astronomija, automoto, kozmetika) kao „začin”.

Stranica: **https://mojekrizaljke.eu**

## Kako je složeno

- `stranica/` – objavljena stranica (`index.html`, `gen.js`) i križaljke u `stranica/data/klasicne.json`.
- `klasicna/` – generator gustih mreža (`gen2.js`), skripte za popis riječi i serije te opće riječi s pitanjima u `klasicna/opce/` (oblik `ODGOVOR|pitanje|L/S/T`; L lagana, S srednja, T teška; `odbijeno.lst` su riječi koje se ne koriste).
- `pojmovi/` – pojmovi i pitanja po područjima (odjeljci `[opca]`, `[teska]`, `[strucna]` odgovaraju težinama lagana, srednja, teška).
- `.github/workflows/objava.yml` – automatska objava na GitHub Pages pri svakoj promjeni.

LJ, NJ i DŽ zauzimaju jedno polje.

## Izvori riječi

Popis kandidata za opće riječi izrađen je iz Hunspell rječnika za hrvatski (paket `dictionary-hr`, licenca LGPL-2.1 ili SISSL) i popisa čestotnosti riječi (hermitdave/FrequencyWords, sadržaj CC BY-SA 4.0). Izvorni popisi nisu u repozitoriju; u mrežu ulaze samo riječi kojima je ručno napisano pitanje.
