/**
 * HYNAOS — Splash Screen Controller
 * Hyna Studio Management System
 */

document.addEventListener('DOMContentLoaded', () => {
  const splashScreen = document.getElementById('splashScreen');

  // Splash screen display duration before fade out (3000ms = 3 seconds)
  const DISPLAY_DURATION_MS = 3000;
  
  // Transition duration matching CSS .fade-out (800ms)
  const FADE_OUT_DURATION_MS = 800;

  if (splashScreen) {
    setTimeout(() => {
      // 1. Add fade-out transition class
      splashScreen.classList.add('fade-out');

      // 2. Hide overlay or redirect if standalone splash page
      setTimeout(() => {
        if (window.location.pathname.endsWith('splash.html')) {
          window.location.href = 'index.html';
        } else {
          splashScreen.style.display = 'none';
        }
      }, FADE_OUT_DURATION_MS);
    }, DISPLAY_DURATION_MS);
  }
});
