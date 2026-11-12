/**
 * ==============================================================================
 * BBIMS - Unified Authentication & Role Session Management Module
 * ==============================================================================
 */

const AUTH_CONFIG = {
  TOKEN_KEY: 'bbims_auth_token',
  USER_KEY: 'bbims_auth_user',
  BASE_URL: window.location.origin.includes('5000') 
    ? `${window.location.origin}/api` 
    : 'http://localhost:5000/api'
};

let activeAuthRole = 'donor'; // 'donor' | 'admin'

const auth = {
  token: null,
  user: null,

  // Get current stored token
  getToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  },

  // Get current stored user
  getUser() {
    const raw = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Set session after login / registration
  setSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
  },

  // Clear session on logout
  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  },

  // Check if logged in
  isLoggedIn() {
    return !!this.getToken();
  },

  // Verify current token with server
  async verifySession() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch(`${AUTH_CONFIG.BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        this.clearSession();
        return false;
      }

      const data = await res.json();
      if (data.success && data.user) {
        this.user = data.user;
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Auth] Server verification unreachable, using cached session if available:', err.message);
      return !!this.getUser();
    }
  },

  // Login action with role parameter
  async login(email, password, role = activeAuthRole) {
    const res = await fetch(`${AUTH_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    this.setSession(data.token, data.user);
    return data;
  },

  // Register action with role parameter
  async register(registrationData) {
    const res = await fetch(`${AUTH_CONFIG.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...registrationData,
        role: activeAuthRole
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const errorMsg = data.errors ? data.errors.join(', ') : (data.message || 'Registration failed');
      throw new Error(errorMsg);
    }

    this.setSession(data.token, data.user);
    return data;
  },

  // Logout action
  async logout() {
    const token = this.getToken();
    try {
      if (token) {
        await fetch(`${AUTH_CONFIG.BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('[Auth] Logout network error:', err);
    } finally {
      this.clearSession();
      this.renderUIState(false);
      if (typeof showToast === 'function') {
        showToast('Logged out successfully', 'info');
      }
    }
  },

  // Update DOM when auth state changes
  renderUIState(isAuthenticated) {
    const authContainer = document.getElementById('authContainer');
    const appLayout = document.querySelector('.app-layout');
    const customerLayout = document.getElementById('customerPortalContainer');
    const btnLogout = document.getElementById('btnLogout');

    if (isAuthenticated) {
      const user = this.getUser();
      const isDonor = user && (user.role === 'donor' || user.role === 'customer');

      if (isDonor) {
        // Show Customer / Donor Portal
        if (authContainer) authContainer.style.display = 'none';
        if (appLayout) appLayout.style.display = 'none';
        if (customerLayout) customerLayout.style.display = 'block';

        // Update Citizen Top Profile
        const bloodBadge = document.getElementById('custBloodBadge');
        const nameEl = document.getElementById('custUserName');
        const cityEl = document.getElementById('custUserCity');
        const guestBtn = document.getElementById('btnCustSignIn');
        const profilePill = document.getElementById('custProfilePill');
        const btnCustLogout = document.getElementById('btnCustLogout');

        if (bloodBadge) bloodBadge.textContent = user.bloodGroup || 'Donor';
        if (nameEl) nameEl.textContent = user.fullName || 'Citizen Donor';
        if (cityEl) cityEl.textContent = user.city ? user.city : 'National Registry';

        if (guestBtn) guestBtn.style.display = 'none';
        if (profilePill) profilePill.style.display = 'flex';
        if (btnCustLogout) btnCustLogout.style.display = 'inline-flex';

        if (window.customerPortal) {
          window.customerPortal.loadMyRequests();
          window.customerPortal.prefillUserForms();
        }
      } else {
        // Show Blood Bank Admin Layout
        if (authContainer) authContainer.style.display = 'none';
        if (appLayout) appLayout.style.display = 'flex';
        if (customerLayout) customerLayout.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'inline-flex';

        if (user) {
          const avatarEl = document.getElementById('adminAvatarInitial');
          const nameEl = document.getElementById('adminFullName');
          const roleEl = document.getElementById('adminRoleTitle');

          if (avatarEl) {
            const initials = user.nodalOfficer
              ? user.nodalOfficer.split(' ').filter(n => !n.startsWith('Dr')).map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'BB';
            avatarEl.textContent = initials || 'BB';
          }
          if (nameEl) nameEl.textContent = user.nodalOfficer || 'Officer';
          if (roleEl) roleEl.textContent = user.facilityName ? `${user.facilityName}` : 'Nodal Blood Officer';
        }
      }
    } else {
      // Not logged in: Show Auth Container
      if (authContainer) authContainer.style.display = 'flex';
      if (appLayout) appLayout.style.display = 'none';
      if (customerLayout) customerLayout.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'none';
    }
  }
};

/**
 * Switch Auth Role: 'donor' | 'admin'
 */
function switchAuthRole(targetRole) {
  activeAuthRole = targetRole;

  const donorTab = document.getElementById('roleTabDonor');
  const adminTab = document.getElementById('roleTabAdmin');
  const authSubtitle = document.getElementById('authSubtitle');
  const regTabBtn = document.getElementById('tabBtnRegister');
  const donorFields = document.getElementById('donorRegisterFields');
  const adminFields = document.getElementById('adminRegisterFields');
  const demoEmail = document.getElementById('demoHintEmail');
  const demoRoleLabel = document.getElementById('demoRoleLabel');
  const submitLoginBtn = document.getElementById('btnLoginSubmit');
  const loginEmail = document.getElementById('loginEmail');
  const loginEmailLabel = document.getElementById('loginEmailLabel');

  if (targetRole === 'donor') {
    if (donorTab) donorTab.classList.add('active');
    if (adminTab) adminTab.classList.remove('active');
    if (authSubtitle) authSubtitle.textContent = 'e-RaktKosh Citizen & Voluntary Donor Portal';
    if (regTabBtn) regTabBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Register as Donor';
    if (donorFields) donorFields.style.display = 'grid';
    if (adminFields) adminFields.style.display = 'none';
    if (demoRoleLabel) demoRoleLabel.textContent = 'Demo Citizen Donor:';
    if (demoEmail) demoEmail.textContent = 'donor@eraktkosh.in';
    if (submitLoginBtn) submitLoginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In to Citizen Portal';
    if (loginEmailLabel) loginEmailLabel.innerHTML = 'Citizen Email Address <span class="text-danger">*</span>';
    if (loginEmail) loginEmail.placeholder = 'donor@eraktkosh.in';
  } else {
    if (donorTab) donorTab.classList.remove('active');
    if (adminTab) adminTab.classList.add('active');
    if (authSubtitle) authSubtitle.textContent = 'National Blood Inventory & Transfusion Registry (e-RaktKosh)';
    if (regTabBtn) regTabBtn.innerHTML = '<i class="fa-solid fa-building-circle-check"></i> Register Blood Bank';
    if (donorFields) donorFields.style.display = 'none';
    if (adminFields) adminFields.style.display = 'grid';
    if (demoRoleLabel) demoRoleLabel.textContent = 'Default Admin Account:';
    if (demoEmail) demoEmail.textContent = 'admin@bloodbank.org';
    if (submitLoginBtn) submitLoginBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Sign In to Blood Bank';
    if (loginEmailLabel) loginEmailLabel.innerHTML = 'Officer Email Address <span class="text-danger">*</span>';
    if (loginEmail) loginEmail.placeholder = 'admin@bloodbank.org';
  }

  const authAlert = document.getElementById('authAlert');
  if (authAlert) {
    authAlert.style.display = 'none';
    authAlert.textContent = '';
  }
}

/**
 * Tab switcher: 'login' | 'register'
 */
function switchAuthTab(targetTab) {
  const loginTabBtn = document.getElementById('tabBtnLogin');
  const registerTabBtn = document.getElementById('tabBtnRegister');
  const loginForm = document.getElementById('authLoginForm');
  const registerForm = document.getElementById('authRegisterForm');
  const authAlert = document.getElementById('authAlert');

  if (authAlert) {
    authAlert.style.display = 'none';
    authAlert.textContent = '';
  }

  if (targetTab === 'login') {
    if (loginTabBtn) loginTabBtn.classList.add('active');
    if (registerTabBtn) registerTabBtn.classList.remove('active');
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
  } else {
    if (loginTabBtn) loginTabBtn.classList.remove('active');
    if (registerTabBtn) registerTabBtn.classList.add('active');
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
  }
}

/**
 * Display error/success alert inside Auth Card
 */
function showAuthAlert(message, type = 'danger') {
  const alertEl = document.getElementById('authAlert');
  if (!alertEl) return;
  alertEl.className = `auth-alert auth-alert-${type}`;
  alertEl.innerHTML = `<i class="fa-solid fa-${type === 'danger' ? 'triangle-exclamation' : 'circle-check'}"></i> <span>${message}</span>`;
  alertEl.style.display = 'flex';
}

/**
 * Fill demo credentials according to active role
 */
function fillDemoCredentials() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  if (activeAuthRole === 'donor') {
    if (emailInput) emailInput.value = 'donor@eraktkosh.in';
    if (passwordInput) passwordInput.value = 'SecurePassword123';
  } else {
    if (emailInput) emailInput.value = 'admin@bloodbank.org';
    if (passwordInput) passwordInput.value = 'SecurePassword123';
  }

  switchAuthTab('login');
}

/**
 * Direct shortcut to open customer portal as a guest
 */
function openPublicPortal() {
  const authContainer = document.getElementById('authContainer');
  const appLayout = document.querySelector('.app-layout');
  const customerLayout = document.getElementById('customerPortalContainer');

  if (authContainer) authContainer.style.display = 'none';
  if (appLayout) appLayout.style.display = 'none';
  if (customerLayout) customerLayout.style.display = 'block';

  // In guest mode, show sign-in button
  const guestBtn = document.getElementById('btnCustSignIn');
  const profilePill = document.getElementById('custProfilePill');
  const btnCustLogout = document.getElementById('btnCustLogout');

  if (!auth.isLoggedIn()) {
    if (guestBtn) guestBtn.style.display = 'inline-flex';
    if (profilePill) profilePill.style.display = 'none';
    if (btnCustLogout) btnCustLogout.style.display = 'none';
  }
}

/**
 * Switch to Admin login screen
 */
function switchToAdminLogin() {
  if (auth.isLoggedIn() && auth.getUser()?.role !== 'admin') {
    auth.clearSession();
  }
  switchAuthRole('admin');
  switchAuthTab('login');
  const authContainer = document.getElementById('authContainer');
  const appLayout = document.querySelector('.app-layout');
  const customerLayout = document.getElementById('customerPortalContainer');

  if (authContainer) authContainer.style.display = 'flex';
  if (appLayout) appLayout.style.display = 'none';
  if (customerLayout) customerLayout.style.display = 'none';
}

/**
 * Open auth modal from customer portal
 */
function openAuthModal(targetRole = 'donor') {
  switchAuthRole(targetRole);
  switchAuthTab('login');
  const authContainer = document.getElementById('authContainer');
  if (authContainer) authContainer.style.display = 'flex';
}

/**
 * DOM Ready Initializer for Auth
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Attach Login Form Submit Handler
  const loginForm = document.getElementById('authLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btnLoginSubmit');
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        }
        const data = await auth.login(email, password, activeAuthRole);
        auth.renderUIState(true);
        if (typeof showToast === 'function') {
          const welcomeName = data.user.fullName || data.user.nodalOfficer || 'User';
          showToast(`Welcome to e-RaktKosh, ${welcomeName}!`, 'success');
        }
      } catch (err) {
        showAuthAlert(err.message, 'danger');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = activeAuthRole === 'donor' 
            ? '<i class="fa-solid fa-right-to-bracket"></i> Sign In to Citizen Portal'
            : '<i class="fa-solid fa-shield-halved"></i> Sign In to Blood Bank';
        }
      }
    });
  }

  // Attach Register Form Submit Handler
  const registerForm = document.getElementById('authRegisterForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btnRegisterSubmit');

      let payload = {};
      if (activeAuthRole === 'donor') {
        payload = {
          role: 'donor',
          fullName: document.getElementById('regDonorFullName').value.trim(),
          bloodGroup: document.getElementById('regDonorBloodGroup').value,
          age: document.getElementById('regDonorAge').value,
          gender: document.getElementById('regDonorGender').value,
          contactPhone: document.getElementById('regDonorPhone').value.trim(),
          city: document.getElementById('regDonorCity').value.trim(),
          email: document.getElementById('regDonorEmail').value.trim(),
          password: document.getElementById('regDonorPassword').value
        };
      } else {
        payload = {
          role: 'admin',
          facilityName: document.getElementById('regFacilityName').value.trim(),
          licenseNumber: document.getElementById('regLicenseNumber').value.trim(),
          nodalOfficer: document.getElementById('regNodalOfficer').value.trim(),
          email: document.getElementById('regEmail').value.trim(),
          password: document.getElementById('regPassword').value,
          contactPhone: document.getElementById('regContactPhone').value.trim(),
          city: document.getElementById('regCity').value.trim()
        };
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
        }
        await auth.register(payload);
        auth.renderUIState(true);
        if (typeof showToast === 'function') {
          showToast('Account registered successfully! Welcome to BBIMS.', 'success');
        }
      } catch (err) {
        showAuthAlert(err.message, 'danger');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Register & Access Portal';
        }
      }
    });
  }

  // Attach Logout Button Handler (Admin Sidebar)
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of BBIMS?')) {
        auth.logout();
      }
    });
  }

  // Set default initial role
  switchAuthRole('donor');

  // Verify initial session
  const isValid = await auth.verifySession();
  auth.renderUIState(isValid);
});

// Intercept global fetch so any API calls automatically send Authorization header
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  let [resource, config] = args;
  const token = auth.getToken();

  if (token && typeof resource === 'string' && resource.includes('/api/')) {
    config = config || {};
    config.headers = config.headers || {};
    if (config.headers instanceof Headers) {
      if (!config.headers.has('Authorization')) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } else if (!config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return originalFetch(resource, config);
};
