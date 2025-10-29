/**
 * AUTHENTICATION DIALOG JAVASCRIPT
 * Handles user authentication UI interactions
 */

let currentTab = 'login';

// Switch between login and registration tabs
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab appearance
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.auth-tab:nth-child(${tab === 'login' ? '1' : '2'})`).classList.add('active');
  
  // Update form visibility
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(`${tab}-form`).classList.add('active');
  
  // Clear messages
  clearMessages();
}

// Clear all error and success messages
function clearMessages() {
  document.getElementById('error-message').classList.remove('show');
  document.getElementById('success-message').classList.remove('show');
  document.getElementById('security-notice').classList.remove('show');
  
  // Clear form errors
  document.querySelectorAll('.form-group').forEach(group => {
    group.classList.remove('error');
  });
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

// Show success message
function showSuccess(message) {
  const successEl = document.getElementById('success-message');
  successEl.textContent = message;
  successEl.classList.add('show');
}

// Show security notice
function showSecurityNotice(message) {
  const noticeEl = document.getElementById('security-notice');
  noticeEl.textContent = message;
  noticeEl.classList.add('show');
}

// Show/hide loading spinner
function setLoading(loading) {
  const spinner = document.getElementById('loading-spinner');
  const buttons = document.querySelectorAll('.auth-button');
  
  if (loading) {
    spinner.classList.add('active');
    buttons.forEach(btn => btn.disabled = true);
  } else {
    spinner.classList.remove('active');
    buttons.forEach(btn => btn.disabled = false);
  }
}

// Validate form field
function validateField(fieldId, validation) {
  const field = document.getElementById(fieldId);
  const group = field.closest('.form-group');
  const errorEl = group.querySelector('.input-error');
  
  try {
    validation(field.value);
    group.classList.remove('error');
    errorEl.textContent = '';
    return true;
  } catch (error) {
    group.classList.add('error');
    errorEl.textContent = error.message;
    return false;
  }
}

// Password strength indicator
function updatePasswordStrength(password) {
  const strengthBar = document.getElementById('password-strength-bar');
  const strength = calculatePasswordStrength(password);
  
  strengthBar.className = 'password-strength-bar';
  
  if (strength.score >= 4) {
    strengthBar.classList.add('strong');
  } else if (strength.score >= 3) {
    strengthBar.classList.add('good');
  } else if (strength.score >= 2) {
    strengthBar.classList.add('fair');
  } else if (strength.score >= 1) {
    strengthBar.classList.add('weak');
  }
}

// Calculate password strength
function calculatePasswordStrength(password) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  Object.values(checks).forEach(check => {
    if (check) score++;
  });
  
  return { score, checks };
}

// Handle login form submission
async function handleLogin() {
  clearMessages();
  
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const rememberMe = document.getElementById('remember-me').checked;
  
  // Client-side validation
  let isValid = true;
  
  isValid &= validateField('login-username', value => {
    if (!value || value.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
  });
  
  isValid &= validateField('login-password', value => {
    if (!value || value.length < 1) {
      throw new Error('Password is required');
    }
  });
  
  if (!isValid) {
    return;
  }
  
  setLoading(true);
  
  try {
    // Send authentication request to main process
    const result = await window.electronAPI.authenticate({
      action: 'login',
      username,
      password,
      rememberMe,
      clientInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
    
    if (result.success) {
      showSuccess('Authentication successful! Loading application...');
      
      // Close auth dialog after delay
      setTimeout(() => {
        window.electronAPI.authComplete(result);
      }, 1000);
    } else {
      throw new Error(result.message || 'Authentication failed');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'Login failed. Please try again.');
    
    // Show security notice for repeated failures
    if (error.message && error.message.includes('locked')) {
      showSecurityNotice('Account locked due to multiple failed attempts. Please wait before trying again.');
    } else if (error.message && error.message.includes('rate limit')) {
      showSecurityNotice('Too many login attempts. Please wait before trying again.');
    }
  } finally {
    setLoading(false);
  }
}

// Handle registration form submission
async function handleRegister() {
  clearMessages();
  
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  
  // Client-side validation
  let isValid = true;
  
  isValid &= validateField('register-username', value => {
    if (!value || value.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }
  });
  
  isValid &= validateField('register-password', value => {
    const strength = calculatePasswordStrength(value);
    if (strength.score < 3) {
      throw new Error('Password is too weak. Use uppercase, lowercase, numbers, and special characters.');
    }
  });
  
  isValid &= validateField('register-confirm-password', value => {
    if (value !== password) {
      throw new Error('Passwords do not match');
    }
  });
  
  if (!isValid) {
    return;
  }
  
  setLoading(true);
  
  try {
    // Send registration request to main process
    const result = await window.electronAPI.authenticate({
      action: 'register',
      username,
      password,
      clientInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
    
    if (result.success) {
      showSuccess('Account created successfully! You can now log in.');
      
      // Switch to login tab
      setTimeout(() => {
        switchTab('login');
        document.getElementById('login-username').value = username;
      }, 1500);
    } else {
      throw new Error(result.message || 'Registration failed');
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    showError(error.message || 'Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Password strength indicator for registration
  const registerPassword = document.getElementById('register-password');
  if (registerPassword) {
    registerPassword.addEventListener('input', function() {
      updatePasswordStrength(this.value);
    });
  }
  
  // Form submission on Enter key
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      if (currentTab === 'login') {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  });
  
  // Focus first input on load
  setTimeout(() => {
    document.getElementById('login-username').focus();
  }, 300);
  
  // Check if default admin was created
  window.electronAPI.checkAuthStatus().then(status => {
    if (status.hasDefaultAdmin) {
      showSecurityNotice('Default admin account detected. Please change the password immediately after first login.');
    }
    
    if (status.accountLocked) {
      showError('Your account is temporarily locked due to multiple failed login attempts.');
    }
  }).catch(console.error);
});

// Handle window closing
window.addEventListener('beforeunload', function() {
  window.electronAPI.authCancelled();
});