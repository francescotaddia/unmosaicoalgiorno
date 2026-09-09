/* ============================================================
   CONFIGURAZIONE DEL SITO — modifica solo questo file
   SITE CONFIG — edit only this file
   ============================================================ */

window.SITE_CONFIG = {
  /* Titolo mostrato nell'intestazione / Title shown in the header */
  siteName: "Un mosaico al giorno",

  /* Lingua di default: "it" oppure "en" */
  defaultLang: "it",

  /* Data di partenza della rotazione (NON cambiarla dopo il lancio).
     Start date of the daily rotation (do NOT change after launch). */
  epoch: "2026-01-01",

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

  /* Link facoltativi nel footer / Optional footer links */
  links: {
    about: "",      /* es. "pagina-chi-siamo.html" */
    contact: ""     /* es. "mailto:tuo@email.it" */
  }
};
