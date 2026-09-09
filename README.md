# Un mosaico al giorno

Sito statico, bilingue (IT/EN), che mostra **un mosaico al giorno** con una grande
foto e una descrizione. Nessun framework, nessun build: sono solo file HTML/CSS/JS
pronti per **GitHub Pages**.

- `index.html` — il mosaico di oggi (rotazione automatica in base alla data)
- `archivio.html` — griglia dei mosaici **già pubblicati** (le date future non si vedono)
- `mosaico.html?id=…` — scheda del singolo mosaico
- `data/mosaics.json` — **l'elenco dei mosaici** (l'unico file che aggiorni di solito)
- `assets/config.js` — nome del sito, lingua di default, pubblicità
- `assets/app.js`, `assets/style.css` — logica e stile (di norma non si toccano)

Ogni mosaico ha una **data** (`date`). Il mosaico di oggi è quello con la data
più recente fino a oggi; l'archivio elenca solo quelli con data passata o
odierna. Puoi caricare in anticipo mosaici con date future: compariranno da soli,
uno al giorno. Vedi **[Il campo `date`](#il-campo-date--è-così-che-funziona-la-pubblicazione)**.

---

## Aggiungere un mosaico

Apri `data/mosaics.json` e aggiungi un blocco in fondo all'elenco (prima della `]`):

```json
{
  "id": "identificativo-univoco-senza-spazi",
  "date": "2026-09-15",
  "commonsFile": "Nome esatto del file su Wikimedia Commons.jpg",
  "credit": "Nome Autore — CC BY-SA 4.0",
  "license": "CC BY-SA 4.0",
  "title":       { "it": "Titolo",            "en": "Title" },
  "place":       { "it": "Luogo, città",      "en": "Place, city" },
  "period":      { "it": "II secolo d.C.",    "en": "2nd century AD" },
  "description": { "it": "Testo in italiano (60–120 parole).",
                   "en": "Text in English (60–120 words)." }
}
```

Ricordati la **virgola** tra un blocco e l'altro.

### Il campo `date` — è così che funziona la pubblicazione

- `date` è il **giorno in cui il mosaico diventa pubblico** (formato `AAAA-MM-GG`).
- Il **mosaico di oggi** = quello con la data più recente **fino a oggi compreso**.
- L'**archivio mostra solo i mosaici con data passata o odierna**: quelli con
  data futura restano invisibili finché non arriva il loro giorno.
- Il **numero** (N. 1, N. 2, …) è assegnato in automatico in base all'ordine
  delle date: non devi gestirlo tu.

Quindi puoi **preparare in anticipo** dieci mosaici con dieci date future, fare
un solo push, e il sito ne scoprirà uno al giorno da solo. L'ordine dei blocchi
dentro il file non conta: conta solo `date`.

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

Per rivedere i mosaici dei giorni scorsi: `index.html?d=-1`, `index.html?d=-2`, …
(oppure usa l'archivio). Per forzare la lingua: `?lang=en`.

Per **provare come apparirà un giorno futuro** senza cambiare l'orologio del
computer, apri la console del browser e imposta una data fittizia prima di
ricaricare — oppure, più semplice, dai a un mosaico la data di oggi per vederlo
subito in prima pagina.
