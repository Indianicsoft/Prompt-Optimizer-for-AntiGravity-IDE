// Settings Configuration Page View

import { stateStore } from '../core/state.js';
import { initFirebase } from '../core/firebase.js';
import { localStorageService } from '../core/storage.js';
import { showToast } from '../components/Toast.js';

export function renderSettingsView() {
  const state = stateStore.getState();
  const settings = state.settings;
  const fbConfig = settings.firebaseConfig || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  const isFirebaseConnected = !!settings.firebaseConfig;

  return `
    <div style="max-width: 650px; margin: 0 auto;" class="flex flex-col gap-6">
      
      <!-- API KEY SETTINGS -->
      <div class="panel flex flex-col gap-4">
        <h3 style="font-family: var(--font-display); font-size: 1.15rem; color: #ffffff;">Google Gemini API Credentials</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
          Provide your Gemini API Key to enable AI-powered deep semantic prompt optimizations.
          Key is stored strictly locally in your browser's LocalStorage and is never sent to third-party servers.
        </p>
        
        <div class="form-group">
          <label for="settings-api-key">Gemini Developer API Key</label>
          <div class="flex gap-2">
            <input 
              type="password" 
              id="settings-api-key" 
              class="input-field" 
              placeholder="AIzaSy..." 
              value="${settings.apiKey || ''}"
              style="font-family: var(--font-mono); font-size: 0.9rem;"
            >
            <button id="settings-btn-toggle-key" class="btn btn-secondary" style="padding: 0.5rem 1rem;">Show</button>
          </div>
        </div>

        <div class="form-group">
          <label class="constraint-toggle ${settings.useAI ? 'active' : ''}" id="settings-ai-toggle" style="align-self: flex-start;">
            <input type="checkbox" id="settings-chk-use-ai" ${settings.useAI ? 'checked' : ''}>
            <div class="checkbox-custom"></div>
            <span class="constraint-label">Enable AI Optimizations</span>
          </label>
        </div>

        <button id="settings-btn-save-api" class="btn btn-primary" style="align-self: flex-start;">
          Save API settings
        </button>
      </div>

      <!-- FIREBASE INTEGRATION SETTINGS -->
      <div class="panel flex flex-col gap-4">
        <h3 style="font-family: var(--font-display); font-size: 1.15rem; color: #ffffff;">Firebase Cloud Storage</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
          Connect your custom Firebase project to enable authentication, saved prompt syncs, and database backups.
        </p>

        ${isFirebaseConnected ? `
          <div class="badge badge-success flex align-center gap-1" style="align-self: flex-start; padding: 0.5rem 0.75rem;">
            <span style="display:inline-block; width:8px; height:8px; background:var(--success); border-radius:50%;"></span>
            Connected to Project: "${fbConfig.projectId}"
          </div>
          <button id="settings-btn-disconnect-fb" class="btn btn-danger" style="align-self: flex-start; margin-top: 0.5rem;">
            Disconnect Firebase Project
          </button>
        ` : `
          <div class="badge badge-info" style="align-self: flex-start; padding: 0.5rem 0.75rem;">
            Offline Mode Active (LocalStorage Sandbox)
          </div>
          
          <form id="settings-fb-form" class="flex flex-col gap-3" style="margin-top: 1rem;">
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="fb-apiKey">API Key (apiKey)</label>
                <input type="text" id="fb-apiKey" class="input-field" placeholder="AIzaSy..." required style="font-size:0.85rem;">
              </div>
              <div class="form-group">
                <label for="fb-authDomain">Auth Domain</label>
                <input type="text" id="fb-authDomain" class="input-field" placeholder="project-id.firebaseapp.com" required style="font-size:0.85rem;">
              </div>
            </div>
            
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="fb-projectId">Project ID</label>
                <input type="text" id="fb-projectId" class="input-field" placeholder="project-id" required style="font-size:0.85rem;">
              </div>
              <div class="form-group">
                <label for="fb-storageBucket">Storage Bucket</label>
                <input type="text" id="fb-storageBucket" class="input-field" placeholder="project-id.appspot.com" required style="font-size:0.85rem;">
              </div>
            </div>

            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="fb-messagingSenderId">Messaging Sender ID</label>
                <input type="text" id="fb-messagingSenderId" class="input-field" placeholder="84729482..." required style="font-size:0.85rem;">
              </div>
              <div class="form-group">
                <label for="fb-appId">App ID (appId)</label>
                <input type="text" id="fb-appId" class="input-field" placeholder="1:84729482:web:a84bf..." required style="font-size:0.85rem;">
              </div>
            </div>

            <button type="submit" id="fb-submit-btn" class="btn btn-primary" style="align-self: flex-start; margin-top: 0.5rem;">
              Save & Initialize Firebase
            </button>
          </form>
        `}
      </div>

      <!-- MAINTENANCE ACTIONS -->
      <div class="panel flex flex-col gap-4" style="border: 1px solid rgba(239, 68, 68, 0.15);">
        <h3 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--error);">Maintenance Options</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">
          Seed mock data templates or purge all offline databases completely.
        </p>
        <div class="flex gap-3">
          <button id="settings-btn-seed" class="btn btn-secondary" style="font-size:0.85rem;">
            Restore Seed Templates
          </button>
          <button id="settings-btn-purge" class="btn btn-danger" style="font-size:0.85rem;">
            Purge Local Storage
          </button>
        </div>
      </div>

    </div>
  `;
}

export function initSettingsListeners(appElement, navigateCallback) {
  const state = stateStore.getState();
  const apiKeyField = appElement.querySelector('#settings-api-key');
  const toggleKeyBtn = appElement.querySelector('#settings-btn-toggle-key');
  const chkUseAI = appElement.querySelector('#settings-chk-use-ai');
  const toggleLabel = appElement.querySelector('#settings-ai-toggle');
  
  // 1. Password reveal button
  if (toggleKeyBtn && apiKeyField) {
    toggleKeyBtn.addEventListener('click', () => {
      if (apiKeyField.type === 'password') {
        apiKeyField.type = 'text';
        toggleKeyBtn.innerText = 'Hide';
      } else {
        apiKeyField.type = 'password';
        toggleKeyBtn.innerText = 'Show';
      }
    });
  }

  // AI Toggle Click styling
  if (toggleLabel && chkUseAI) {
    toggleLabel.addEventListener('click', (e) => {
      e.preventDefault();
      chkUseAI.checked = !chkUseAI.checked;
      if (chkUseAI.checked) {
        toggleLabel.classList.add('active');
      } else {
        toggleLabel.classList.remove('active');
      }
    });
  }

  // 2. Save API configuration button
  const saveApiBtn = appElement.querySelector('#settings-btn-save-api');
  if (saveApiBtn) {
    saveApiBtn.addEventListener('click', () => {
      const apiKey = apiKeyField.value.trim();
      const useAI = chkUseAI.checked;

      if (useAI && !apiKey) {
        showToast('You must supply a Gemini Key to enable AI mode.', 'warning');
        return;
      }

      stateStore.updateSettings({
        apiKey,
        useAI
      });
      showToast('API credentials saved successfully.', 'success');
      navigateCallback('settings');
    });
  }

  // 3. Connect Firebase Form submission
  const fbForm = appElement.querySelector('#settings-fb-form');
  const fbSubmitBtn = appElement.querySelector('#fb-submit-btn');
  if (fbForm) {
    fbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      fbSubmitBtn.disabled = true;
      fbSubmitBtn.innerHTML = `<svg class="icon animate-spin" style="width:16px; height:16px; margin-right: 8px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4, 31.4"></circle></svg> Connecting...`;

      const config = {
        apiKey: appElement.querySelector('#fb-apiKey').value.trim(),
        authDomain: appElement.querySelector('#fb-authDomain').value.trim(),
        projectId: appElement.querySelector('#fb-projectId').value.trim(),
        storageBucket: appElement.querySelector('#fb-storageBucket').value.trim(),
        messagingSenderId: appElement.querySelector('#fb-messagingSenderId').value.trim(),
        appId: appElement.querySelector('#fb-appId').value.trim()
      };

      try {
        const success = initFirebase(config);
        if (success) {
          stateStore.updateSettings({
            firebaseConfig: config
          });
          showToast('Firebase initialized and connected successfully!', 'success');
          navigateCallback('auth'); // Redirect to authenticate
        } else {
          showToast('Firebase failed initialization. Check details in developer console.', 'error');
          fbSubmitBtn.disabled = false;
          fbSubmitBtn.innerText = 'Save & Initialize Firebase';
        }
      } catch (err) {
        console.error(err);
        showToast('Firebase connection failed: ' + err.message, 'error');
        fbSubmitBtn.disabled = false;
        fbSubmitBtn.innerText = 'Save & Initialize Firebase';
      }
    });
  }

  // 4. Disconnect Firebase
  const disconnectBtn = appElement.querySelector('#settings-btn-disconnect-fb');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      if (confirm('Disconnect from Firebase cloud database? All active sessions will be terminated and data returns to LocalStorage sandbox.')) {
        stateStore.updateSettings({
          firebaseConfig: null
        });
        showToast('Firebase disconnected.', 'info');
        
        // Reload settings (forces app state reset)
        window.location.reload();
      }
    });
  }

  // 5. Seed templates
  const seedBtn = appElement.querySelector('#settings-btn-seed');
  if (seedBtn) {
    seedBtn.addEventListener('click', () => {
      if (confirm('Overwrite active prompts lists with standard developer seed templates?')) {
        localStorage.clear();
        localStorageService.seedMockData();
        showToast('Mock templates restored.', 'success');
        window.location.reload();
      }
    });
  }

  // 6. Purge
  const purgeBtn = appElement.querySelector('#settings-btn-purge');
  if (purgeBtn) {
    purgeBtn.addEventListener('click', () => {
      if (confirm('CRITICAL: Purge ALL stored local prompts, configs, and versions? This operation is irreversible.')) {
        localStorage.clear();
        showToast('Offline database purged successfully.', 'success');
        window.location.reload();
      }
    });
  }
}
