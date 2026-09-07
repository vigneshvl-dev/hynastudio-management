/**
 * HYNAOS — Role Selection Module
 * Hyna Studio Management System
 */

/**
 * Redirects user to the Administrator Login page.
 */
function goToAdminLogin() {
  // Add smooth fade-out class if container exists
  const container = document.querySelector('.app-container');
  if (container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
    container.style.transition = 'all 0.2s ease-in-out';
  }
  
  setTimeout(() => {
    window.location.href = 'admin-login.html';
  }, 180);
}

/**
 * Redirects user to the Employee Login page.
 */
function goToEmployeeLogin() {
  // Add smooth fade-out class if container exists
  const container = document.querySelector('.app-container');
  if (container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
    container.style.transition = 'all 0.2s ease-in-out';
  }

  setTimeout(() => {
    window.location.href = 'employee-login.html';
  }, 180);
}

// Make functions globally accessible
window.goToAdminLogin = goToAdminLogin;
window.goToEmployeeLogin = goToEmployeeLogin;
