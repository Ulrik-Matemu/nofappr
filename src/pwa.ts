import { registerSW } from 'virtual:pwa-register'

export function registerPWA() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // Defer service worker registration until after the page has loaded
    // This prevents the SW registration from affecting initial page load performance
    window.addEventListener('load', () => {
      registerSW({
        onNeedRefresh() {
          console.log('New content available. Reloading...')
          // Since we use autoUpdate, this might just happen, but we can force reload if needed
          // updateSW(true)
        },
        onOfflineReady() {
          console.log('App is ready to work offline')
        },
      })
    })
  }
}
