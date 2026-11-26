# Klasična (gusta) križaljka

- `gen2.js` — generator američke mreže: simetrični uzorak crnih polja + popunjavanje s povratkom.
- `batch.js` — slaže seriju (3 težine × 3 veličine × 3 križaljke) u `serija.json`; `izvoz.js` je pretvara u `stranica/data/klasicne.json`.
- `opce/` — opće riječi s pitanjima: `ODGOVOR|pitanje|težina` (L lagana, S srednja, T teška); `odbijeno.lst` su riječi koje se ne koriste.
- `lex.js`, `words.js`, `approved.js` — popis kandidata iz Hunspell rječnika (dictionary-hr, LGPL-2.1/SISSL)
  i popisa čestotnosti (hermitdave/FrequencyWords, CC BY-SA 4.0). Izvorni popisi nisu u repozitoriju.
