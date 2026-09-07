/**
 * HYNAOS — Authentication & Role Verification Module
 * Hyna Studio Management System
 */

// Helper: Show Alert Message in Form UI
function showAlert(message, type = 'danger') {
  const alertBox = document.getElementById('alertBox');
  const alertText = document.getElementById('alertText');
  
  if (!alertBox || !alertText) return;

  alertText.textContent = message;
  alertBox.className = `alert-box alert-${type}`;
  alertBox.classList.remove('hidden');
}

// Helper: Hide Alert Message
function hideAlert() {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) {
    alertBox.classList.add('hidden');
  }
}

// Helper: Toggle Loading Button State
function setLoadingState(isLoading) {
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');

  if (!submitBtn) return;

  if (isLoading) {
    submitBtn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');
    if (btnText) btnText.textContent = 'Signing in...';
  } else {
    submitBtn.disabled = false;
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'SIGN IN →';
  }
}

// Password Visibility Toggle
function togglePassword(inputId = 'passwordInput', btnElement) {
  const passwordInput = document.getElementById(inputId);
  if (!passwordInput) return;

  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';

  // Toggle Lucide Icon
  if (btnElement) {
    const icon = btnElement.querySelector('i');
    if (icon) {
      if (isPassword) {
        icon.setAttribute('data-lucide', 'eye-off');
      } else {
        icon.setAttribute('data-lucide', 'eye');
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }
}

// Email Regex Validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Fetch Profile and Check Actual Database Role
 */
async function checkUserRole(userId, expectedEmail = "") {
  const { getClient, isDemoMode, demoProfiles } = window.HYNAOS_SUPABASE || {};

  // Check Demo Fallback Mode first if active or client unavailable
  if (isDemoMode() || !getClient()) {
    const match = demoProfiles.find(p => p.email.toLowerCase() === expectedEmail.toLowerCase());
    if (match) {
      return match.role;
    }
    // Default fallback role check if custom email used in demo
    if (expectedEmail.toLowerCase().includes('admin')) return 'admin';
    if (expectedEmail.toLowerCase().includes('employee')) return 'employee';
    return null;
  }

  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error("HYNAOS DB Role Check Error:", error);
      return null;
    }

    return data.role;
  } catch (err) {
    console.error("HYNAOS DB Query Exception:", err);
    return null;
  }
}

/**
 * Handle Admin Login
 */
async function handleAdminLogin(event) {
  if (event) event.preventDefault();
  hideAlert();

  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  // 1. Email Validation
  if (!email) {
    showAlert('Please enter your administrator email address.');
    return;
  }

  if (!isValidEmail(email)) {
    showAlert('Please enter a valid email address.');
    return;
  }

  // 2. Password Validation
  if (!password) {
    showAlert('Please enter your password.');
    return;
  }

  setLoadingState(true);

  const { getClient, isDemoMode } = window.HYNAOS_SUPABASE || {};

  try {
    if (isDemoMode() || !getClient()) {
      // Simulated Demo Authentication Delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const { demoProfiles } = window.HYNAOS_SUPABASE || {};
      const adminProfile = demoProfiles ? demoProfiles.find(p => p.email.toLowerCase() === email.toLowerCase()) : null;

      if (!adminProfile || password !== adminProfile.password) {
        setLoadingState(false);
        showAlert('Incorrect email or password. Please try again.', 'danger');
        return;
      }

      if (adminProfile.role !== 'admin') {
        setLoadingState(false);
        showAlert('You do not have Administrator access.', 'danger');
        return;
      }

      setLoadingState(false);
      showAlert('Administrator login verified successfully!', 'success');
      console.log('✅ HYNAOS Admin login authorized (Demo Mode).');
      return;
    }

    // 3. Real Supabase Authentication
    const supabase = getClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setLoadingState(false);
      if (authError.message.includes('Invalid login credentials')) {
        showAlert('Incorrect email or password. Please try again.');
      } else {
        showAlert(authError.message || 'Authentication failed. Please check your network connection.');
      }
      return;
    }

    // 4. Database Role Verification (Strict check)
    const user = authData.user;
    const actualRole = await checkUserRole(user.id, email);

    if (actualRole !== 'admin') {
      // Sign out unauthorized user session
      await supabase.auth.signOut();
      setLoadingState(false);
      showAlert('You do not have Administrator access.', 'danger');
      return;
    }

    // Login Success
    setLoadingState(false);
    showAlert('Administrator login verified! Access granted.', 'success');

  } catch (err) {
    setLoadingState(false);
    console.error('HYNAOS Auth Exception:', err);
    showAlert('A network or authentication error occurred. Please try again.');
  }
}

/**
 * Handle Employee Login
 */
async function handleEmployeeLogin(event) {
  if (event) event.preventDefault();
  hideAlert();

  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  // 1. Email Validation
  if (!email) {
    showAlert('Please enter your employee email address.');
    return;
  }

  if (!isValidEmail(email)) {
    showAlert('Please enter a valid email address.');
    return;
  }

  // 2. Password Validation
  if (!password) {
    showAlert('Please enter your password.');
    return;
  }

  setLoadingState(true);

  const { getClient, isDemoMode } = window.HYNAOS_SUPABASE || {};

  try {
    if (isDemoMode() || !getClient()) {
      // Simulated Demo Authentication Delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const { demoProfiles } = window.HYNAOS_SUPABASE || {};
      const empProfile = demoProfiles ? demoProfiles.find(p => p.email.toLowerCase() === email.toLowerCase()) : null;

      if (!empProfile || password !== empProfile.password) {
        setLoadingState(false);
        showAlert('Incorrect email or password. Please try again.', 'danger');
        return;
      }

      if (empProfile.role !== 'employee') {
        setLoadingState(false);
        showAlert('This account does not have Employee access.', 'danger');
        return;
      }

      setLoadingState(false);
      showAlert('Employee login verified successfully!', 'success');
      console.log('✅ HYNAOS Employee login authorized (Demo Mode).');
      return;
    }

    // 3. Real Supabase Authentication
    const supabase = getClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setLoadingState(false);
      if (authError.message.includes('Invalid login credentials')) {
        showAlert('Incorrect email or password. Please try again.');
      } else {
        showAlert(authError.message || 'Authentication failed. Please check your network connection.');
      }
      return;
    }

    // 4. Database Role Verification (Strict check)
    const user = authData.user;
    const actualRole = await checkUserRole(user.id, email);

    if (actualRole !== 'employee') {
      // Sign out unauthorized user session
      await supabase.auth.signOut();
      setLoadingState(false);
      showAlert('This account does not have Employee access.', 'danger');
      return;
    }

    // Login Success
    setLoadingState(false);
    showAlert('Employee login verified! Access granted.', 'success');

  } catch (err) {
    setLoadingState(false);
    console.error('HYNAOS Auth Exception:', err);
    showAlert('A network or authentication error occurred. Please try again.');
  }
}

/**
 * Handle Password Reset Request
 */
async function forgotPassword() {
  const emailInput = document.getElementById('emailInput');
  const email = emailInput ? emailInput.value.trim() : '';

  if (!email || !isValidEmail(email)) {
    showAlert('Please enter your registered email address above to receive a password reset link.');
    return;
  }

  const { getClient, isDemoMode } = window.HYNAOS_SUPABASE || {};

  if (isDemoMode() || !getClient()) {
    showAlert(`Demo Mode: Password reset instructions sent to ${email}`, 'success');
    return;
  }

  try {
    const supabase = getClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    });

    if (error) {
      showAlert(error.message || 'Failed to send password reset email.');
    } else {
      showAlert(`Password recovery email sent to ${email}. Check your inbox.`, 'success');
    }
  } catch (err) {
    console.error('HYNAOS Forgot Password Error:', err);
    showAlert('An error occurred while sending password reset email.');
  }
}

/**
 * Handle User Logout
 */
async function logout() {
  const { getClient, isDemoMode } = window.HYNAOS_SUPABASE || {};

  if (!isDemoMode() && getClient()) {
    await getClient().auth.signOut();
  }
  window.location.href = 'index.html';
}

// Global functions exports
window.handleAdminLogin = handleAdminLogin;
window.handleEmployeeLogin = handleEmployeeLogin;
window.checkUserRole = checkUserRole;
window.togglePassword = togglePassword;
window.forgotPassword = forgotPassword;
window.logout = logout;
