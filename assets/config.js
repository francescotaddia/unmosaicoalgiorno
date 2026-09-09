/* ============================================================
   CONFIGURAZIONE DEL SITO — modifica solo questo file
   SITE CONFIG — edit only this file
   ============================================================ */

window.SITE_CONFIG = {
  /* Titolo mostrato nell'intestazione / Title shown in the header.
     Puoi mettere una stringa unica, oppure { it: "...", en: "..." }. */
  siteName: { it: "Un mosaico al giorno", en: "A Mosaic a Day" },

  /* Lingua di default: "it" oppure "en" */
  defaultLang: "it",

  /* ----------------------------------------------------------
     PUBBLICITÀ / ADVERTISING
     ----------------------------------------------------------
     Finché "enabled" è false vengono mostrati dei riquadri
     segnaposto. Per attivare una rete pubblicitaria:
       1) enabled: true
       2) incolla lo/gli script della rete in "headHtml"
       3) incolla il codice del singolo banner in "slotHtml"
     Funziona con qualsiasi rete che fornisce codice HTML/JS
     (es. reti contestuali, Ethical Ads, ecc.).
     ---------------------------------------------------------- */
  ads: {
    enabled: false,

    /* Codice da iniettare una volta sola nella pagina (es. <script src=...>) */
    headHtml: "",

    /* Codice del banner ripetuto in ogni spazio pubblicitario */
    slotHtml: "",

    /* Testo del segnaposto quando la pubblicità è disattivata */
    placeholder: { it: "Spazio pubblicitario", en: "Advertising space" }
  },

  /* ----------------------------------------------------------
     AFFILIAZIONE / AFFILIATE LINKS
     ----------------------------------------------------------
     Sotto ogni mosaico compare un riquadro "Approfondimenti"
     con: link a Wikipedia (sempre), ricerca libri su Amazon,
     e — se compilato — ricerca visite/biglietti.
     ---------------------------------------------------------- */
  affiliates: {
    /* Il tuo ID affiliato Amazon, es. "unmosaico-21".
       Vuoto = il link ad Amazon resta una ricerca normale (nessuna commissione). */
    amazonTag: "",
    /* Sito Amazon su cui mandare la ricerca libri */
    amazonDomain: "www.amazon.it",

    /* ID partner GetYourGuide (visite guidate e biglietti).
       Vuoto = nessun link "visite" mostrato. */
    getYourGuidePartner: ""
  },

  /* ----------------------------------------------------------
     DONAZIONI / SUPPORT
     ---------------------------------------------------------- */
  support: {
    /* Link a Ko-fi, Buy Me a Coffee, PayPal.me, ecc.
       Vuoto = nessun bottone. */
    url: "",
    label: { it: "Offri un caffè", en: "Buy me a coffee" }
  },

  /* Link facoltativi nel footer / Optional footer links */
  links: {
    about: "",      /* es. "pagina-chi-siamo.html" */
    contact: ""     /* es. "mailto:tuo@email.it" */
  }
};
