# Klasična (gusta) križaljka

- `gen2.js` — generator američke mreže: simetrični uzorak crnih polja + popunjavanje s povratkom.
- `slozi.js` — slaganje i provjera jedne križaljke samo od riječi s pitanjem; `nocna.js` — noćno dodavanje (`node klasicna/nocna.js 12`).
- `batch.js`, `izvoz.js`, `serija.json` — prva serija (studeni 2026); za rad trebaju izvorni popisi koji nisu u repozitoriju.
- `opce/` — opće riječi s pitanjima: `ODGOVOR|pitanje|težina` (L lagana, S srednja, T teška); `odbijeno.lst` su riječi koje se ne koriste.
- `lex.js`, `words.js`, `approved.js` — popis kandidata iz Hunspell rječnika (dictionary-hr, LGPL-2.1/SISSL)
  i popisa čestotnosti (hermitdave/FrequencyWords, CC BY-SA 4.0). Izvorni popisi nisu u repozitoriju.
