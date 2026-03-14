// Service Worker Registration for PWA / Add to Home Screen
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
