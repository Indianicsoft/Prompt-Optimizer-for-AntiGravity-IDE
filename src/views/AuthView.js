// Authentication View

import { firebaseService } from '../core/firebase.js';
import { showToast } from '../components/Toast.js';
import { getAuth, updateProfile } from 'firebase/auth';

export function renderAuthView() {
  const isFbInit = firebaseService.isInitialized();
  
  if (!isFbInit) {
    return `
      <div style="max-width: 450px; margin: 4rem auto; text-align: center;">
        <div class="panel flex flex-col gap-4 align-center" style="border-top: 4px solid var(--warning);">
          <div style="color: var(--warning);">
            <svg class="icon" style="width: 40px; height: 40px;" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h2 style="font-family: var(--font-display); font-size: 1.35rem;">Firebase Connection Required</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">
            Authentication and cloud synchronization require an active Firebase integration config.
          </p>
          <button id="auth-go-settings" class="btn btn-primary w-full" style="justify-content: center;">
            Open Settings Page
          </button>
          <button id="auth-back-sandbox" class="btn btn-secondary w-full" style="justify-content: center;">
            Back to Sandbox
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div style="max-width: 400px; margin: 4rem auto;">
      <div class="panel flex flex-col gap-6">
        <!-- Tab Switches -->
        <div class="flex" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
          <button id="tab-login" class="btn btn-text w-full" style="color: #ffffff; border-bottom: 2px solid var(--accent-primary); border-radius: 0; padding-bottom: 0.75rem; font-weight: 600;">
            Sign In
          </button>
          <button id="tab-register" class="btn btn-text w-full" style="border-radius: 0; padding-bottom: 0.75rem;">
            Sign Up
          </button>
        </div>

        <form id="auth-form" class="flex flex-col gap-4">
          <!-- Register fields (hidden by default) -->
          <div id="field-name-group" class="form-group" style="display: none;">
            <label for="auth-name">Display Name</label>
            <input type="text" id="auth-name" class="input-field" placeholder="Enter your name">
          </div>

          <div class="form-group">
            <label for="auth-email">Email Address</label>
            <input type="email" id="auth-email" class="input-field" placeholder="developer@antigravity.dev" required autocomplete="username">
          </div>

          <div class="form-group">
            <label for="auth-password">Password</label>
            <input type="password" id="auth-password" class="input-field" placeholder="••••••••" required autocomplete="current-password" minlength="6">
          </div>

          <button type="submit" id="btn-auth-submit" class="btn btn-primary w-full" style="margin-top: 1rem; justify-content: center;">
            Sign In
          </button>
        </form>
      </div>
    </div>
  `;
}

export function initAuthListeners(appElement, navigateCallback) {
  // Config error view listeners
  const goSettingsBtn = appElement.querySelector('#auth-go-settings');
  if (goSettingsBtn) {
    goSettingsBtn.addEventListener('click', () => {
      navigateCallback('settings');
    });
  }
  const backBtn = appElement.querySelector('#auth-back-sandbox');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateCallback('optimizer');
    });
  }

  // Active form view listeners
  const tabLogin = appElement.querySelector('#tab-login');
  const tabRegister = appElement.querySelector('#tab-register');
  const nameGroup = appElement.querySelector('#field-name-group');
  const submitBtn = appElement.querySelector('#btn-auth-submit');
  const authForm = appElement.querySelector('#auth-form');

  if (!tabLogin || !tabRegister || !authForm) return;

  let mode = 'login'; // login, register

  tabLogin.addEventListener('click', (e) => {
    e.preventDefault();
    mode = 'login';
    tabLogin.style.color = '#ffffff';
    tabLogin.style.borderBottom = '2px solid var(--accent-primary)';
    tabRegister.style.color = 'var(--text-secondary)';
    tabRegister.style.borderBottom = 'none';
    nameGroup.style.display = 'none';
    submitBtn.innerText = 'Sign In';
    appElement.querySelector('#auth-name').required = false;
  });

  tabRegister.addEventListener('click', (e) => {
    e.preventDefault();
    mode = 'register';
    tabRegister.style.color = '#ffffff';
    tabRegister.style.borderBottom = '2px solid var(--accent-primary)';
    tabLogin.style.color = 'var(--text-secondary)';
    tabLogin.style.borderBottom = 'none';
    nameGroup.style.display = 'flex';
    submitBtn.innerText = 'Create Account';
    appElement.querySelector('#auth-name').required = true;
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = appElement.querySelector('#auth-email').value;
    const password = appElement.querySelector('#auth-password').value;
    const name = appElement.querySelector('#auth-name').value;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="icon animate-spin" style="width:16px; height:16px; margin-right: 8px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.4, 31.4"></circle></svg>
      Processing...
    `;

    try {
      if (mode === 'login') {
        await firebaseService.signIn(email, password);
        showToast('Successfully signed in!', 'success');
      } else {
        const user = await firebaseService.signUp(email, password);
        // Set display name in Firebase Auth profile
        if (user && name) {
          try {
            await updateProfile(user, { displayName: name });
          } catch (profileErr) {
            console.warn('Could not set displayName:', profileErr);
          }
        }
        showToast('Account created successfully!', 'success');
      }
      navigateCallback('dashboard');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Authentication failed.', 'error');
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerText = mode === 'login' ? 'Sign In' : 'Create Account';
    }
  });
}
