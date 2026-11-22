# Križaljke

Stranica za rješavanje križaljki na hrvatskom: tri težine (opća, teška, stručna), tri veličine (mala do 150, srednja do 250 i velika do 400 polja) i šest područja koja se mogu spajati (opća kultura, filmska kultura, rock&roll, povijest, astronomija, automoto). Za svaku od 567 kombinacija unaprijed su složene tri verzije, ukupno 1701 križaljka.

Stranica: **https://umjetnimozak.github.io/krizaljke/**

## Kako dodati novu verziju križaljke

1. Napravi tekstualnu datoteku (.txt) u ovom obliku:

   ```
   područja: povijest, rock&roll
   težina: teška
   veličina: mala
   naziv: Jesenska verzija
   GUBEC | Matija ..., vođa seljačke bune 1573.
   HENDRIX | Jimi ..., gitarist koji je zatvorio Woodstock
   STRUMMER | Joe ..., pjevač Clasha
   ```

   - **područja**: jedno ili više, odvojena zarezom: opća kultura, filmska kultura, rock&roll, povijest, astronomija, automoto
   - **težina**: opća, teška ili stručna
   - **veličina**: mala, srednja ili velika
   - **naziv** nije obavezan
   - Svaki pojam je u svom retku: `ODGOVOR | pitanje`. Umjesto `|` može i `;`.
   - LJ, NJ i DŽ automatski idu u jedno polje. Ako u nekoj riječi moraju ostati dva slova, stavi `+` između njih (npr. `KON+JUNKTURA`).
   - Stavi više pojmova nego što stane u mrežu: generator odabire one koji se najbolje križaju.

2. Na GitHubu otvori mapu **nove**, odaberi **Add file → Upload files**, ubaci datoteku i potvrdi s **Commit changes**.

3. Za minutu-dvije nova verzija pojavit će se na stranici kao verzija 4, 5… za tu kombinaciju. Redoslijed verzija ide po imenu datoteke, pa je zgodno ime započeti datumom, npr. `2026-11-21-jesen.txt`.

Ako datoteka ima grešku, ona se preskače, a ostatak stranice se svejedno objavi. Grešku vidiš u kartici **Actions**: otvori zadnje pokretanje, a poruka je označena imenom datoteke.

**Brisanje ili ispravak verzije:** obriši ili uredi datoteku u mapi `nove` (ikona olovke za uređivanje, ili ⋯ → Delete file). Isti tekst uvijek daje istu mrežu, pa se ostale verzije ne mijenjaju.

## Kako urediti ugrađene pojmove

Pojmovi su u mapi `pojmovi` (po jedna datoteka za svako područje, s odjeljcima `[opca]`, `[teska]` i `[strucna]`). Nakon izmjene treba ponovno složiti 1701 križaljku. Za to je potreban Node.js na računalu:

```
node alati/izgradi.js      # ponovno složi sve križaljke u stranica/data
node alati/provjeri.js     # provjeri da su sve mreže ispravne
node alati/nove.js         # (po želji) lokalno složi verzije iz mape nove
```

Zatim pošalji promijenjene datoteke iz `stranica/data` na GitHub. Križaljke postojećih kombinacija ostaju iste dok se ne promijene njihove baze pojmova; promjena baze mijenja križaljke tog područja i poništava korisnicima napredak na njima.

## Sadržaj repozitorija

- `stranica/` – sama stranica (to se objavljuje)
- `stranica/data/` – 1701 unaprijed složena križaljka
- `nove/` – ovdje dodaješ nove verzije
- `pojmovi/` – baze pojmova i pitanja
- `alati/` – skripte za slaganje i provjeru
- `.github/workflows/objava.yml` – automatska objava na GitHub Pages
