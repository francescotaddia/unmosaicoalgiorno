# Un mosaico al giorno

Sito statico, bilingue (IT/EN), che mostra **un mosaico al giorno** con una grande
foto e una descrizione. Nessun framework, nessun build: sono solo file HTML/CSS/JS
pronti per **GitHub Pages**.

- `index.html` — il mosaico di oggi (rotazione automatica in base alla data)
- `archivio.html` — griglia di tutti i mosaici
- `mosaico.html?id=…` — scheda del singolo mosaico
- `data/mosaics.json` — **l'elenco dei mosaici** (l'unico file che aggiorni di solito)
- `assets/config.js` — nome del sito, lingua di default, pubblicità
- `assets/app.js`, `assets/style.css` — logica e stile (di norma non si toccano)

Il mosaico del giorno è scelto così:
`indice = (giorni trascorsi da assets/config.js → epoch) % numero di mosaici`.
È uguale per tutti i visitatori e la rotazione si allunga da sola man mano che
aggiungi mosaici.

---

## Aggiungere un mosaico

Apri `data/mosaics.json` e aggiungi un blocco in fondo all'elenco (prima della `]`):

```json
{
  "id": "identificativo-univoco-senza-spazi",
  "commonsFile": "Nome esatto del file su Wikimedia Commons.jpg",
  "credit": "Foto: Nome Autore — CC BY-SA 4.0",
  "license": "CC BY-SA 4.0",
  "title":       { "it": "Titolo",            "en": "Title" },
  "place":       { "it": "Luogo, città",      "en": "Place, city" },
  "period":      { "it": "II secolo d.C.",    "en": "2nd century AD" },
  "description": { "it": "Testo in italiano (60–120 parole).",
                   "en": "Text in English (60–120 words)." }
}
```

Ricordati la **virgola** tra un blocco e l'altro.

### Come trovare `commonsFile`, `credit` e `license`

1. Vai su <https://commons.wikimedia.org> e cerca un mosaico.
2. Apri l'immagine: il titolo della pagina è `File:NOME.jpg` → copia `NOME.jpg`
   dentro `commonsFile` (con gli spazi così come sono, il sito li gestisce).
3. Nella stessa pagina, sotto "Licenza", trovi autore e sigla (es. `CC BY-SA 4.0`
   oppure `Pubblico dominio`). Mettili in `credit` e `license`.

Usa **solo** immagini con licenza libera (CC BY, CC BY-SA, CC0, pubblico dominio).
Il credito viene mostrato automaticamente sotto ogni foto, con link alla scheda
originale: è ciò che richiedono quelle licenze.

> Le immagini non vengono copiate nel repo: vengono caricate al volo da Wikimedia
> Commons tramite `Special:FilePath`, che serve una versione ridimensionata.

Dopo la modifica: salva, fai commit e push. GitHub Pages si aggiorna in 1–2 minuti.

---

## Pubblicare su GitHub Pages

1. Crea un repository su GitHub (es. `un-mosaico-al-giorno`).
2. Dalla cartella del progetto:

   ```bash
   git add -A
   git commit -m "Sito mosaico del giorno"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/un-mosaico-al-giorno.git
   git push -u origin main
   ```

3. Su GitHub: **Settings → Pages → Build and deployment**
   - Source: *Deploy from a branch*
   - Branch: `main` / `/ (root)` → **Save**
4. Dopo qualche minuto il sito è online su
   `https://TUO-UTENTE.github.io/un-mosaico-al-giorno/`.

### Dominio personalizzato (più avanti)

Quando compri un dominio (es. su Namecheap, Porkbun, Aruba):

1. Crea un file `CNAME` nella cartella principale con dentro solo il dominio
   (es. `unmosaicoalgiorno.it`).
2. Dal pannello DNS del dominio aggiungi i record che GitHub indica in
   *Settings → Pages → Custom domain*.
3. Spunta **Enforce HTTPS**.

---

## Pubblicità

Gli spazi sono già nel layout (`.ad-slot`). Finché non li attivi mostrano un
riquadro tratteggiato "Spazio pubblicitario".

Per attivarli, in `assets/config.js`:

```js
ads: {
  enabled: true,
  headHtml: "<script src=\"...rete pubblicitaria...\"></script>",
  slotHtml: "<ins class=\"...\"></ins><script>...</script>"
}
```

`headHtml` viene inserito una volta sola; `slotHtml` viene ripetuto in ogni spazio.
Funziona con qualunque rete che dia codice HTML/JS.

### In pratica (aspettative realistiche)

- **Google AdSense** rende di più ma **richiede un dominio proprio** (non accetta
  i sottodomini `github.io`), contenuti sufficienti e un'approvazione che può
  richiedere settimane.
- Le **reti contestuali alternative** approvano più in fretta e alcune accettano
  anche `github.io`, ma con poco traffico i guadagni sono molto bassi.
- Con un sito nuovo e senza traffico, **nessuna rete paga cifre significative**:
  la priorità è pubblicare mosaici con costanza e far crescere le visite. Gli
  spazi restano pronti per quando deciderai il dominio e la rete.

---

## Provare in locale

```bash
python3 -m http.server 8000
```

poi apri <http://localhost:8000>. (Serve un server locale: aprendo il file
direttamente, il browser blocca il caricamento di `mosaics.json`.)

Per vedere i mosaici successivi/precedenti nella rotazione:
`index.html?d=1`, `index.html?d=2`, … Per forzare la lingua: `?lang=en`.
