/**
 * HYNAOS — Splash Screen Controller
 * Hyna Studio Management System
 */

document.addEventListener('DOMContentLoaded', () => {
  const splashScreen = document.getElementById('splashScreen');

  // Splash screen display duration before fade out (3 seconds = 3000ms)
  const DISPLAY_DURATION_MS = 3000;
  
  // Transition duration matching CSS .fade-out (800ms)
  const FADE_OUT_DURATION_MS = 800;

  setTimeout(() => {
    if (splashScreen) {
      // 1. Add fade-out transition class
      splashScreen.classList.add('fade-out');

      // 2. Redirect to index.html after fade completes
      setTimeout(() => {
        window.location.href = 'index.html';
      }, FADE_OUT_DURATION_MS);
    }
  }, DISPLAY_DURATION_MS);
});
