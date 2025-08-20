if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/navilite-webapp-test/sw.js")
      .then(reg => console.log("✅ Service Worker registrato:", reg.scope))
      .catch(err => console.error("❌ Errore registrazione SW:", err));
  });
}
