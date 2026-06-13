// ─── CONFIGURAZIONE (deve corrispondere a CONFIG.basePath in index.html) ───
const SW_BASE_PATH = '/navilite-webapp-test';  // produzione: '/navilite-webapp'

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SW_BASE_PATH + "/sw.js")
      .then(reg => console.log("✅ Service Worker registrato:", reg.scope))
      .catch(err => console.error("❌ Errore registrazione SW:", err));
  });
}
