// Main Application Entry & Routing Coordinator

import { stateStore } from './core/state.js';
import { initFirebase, firebaseService } from './core/firebase.js';
import { localStorageService } from './core/storage.js';

// Import Views
import { renderLandingView, initLandingListeners } from './views/LandingView.js';
import { renderAuthView, initAuthListeners } from './views/AuthView.js';
import { renderDashboardView, initDashboardListeners } from './views/DashboardView.js';
import { renderOptimizerView, initOptimizerListeners } from './views/OptimizerView.js';
import { renderTemplatesView, initTemplatesListeners } from './views/TemplatesView.js';
import { renderSavedPromptsView, initSavedPromptsListeners } from './views/SavedPromptsView.js';
import { renderSettingsView, initSettingsListeners } from './views/SettingsView.js';

// Import Shell
import { renderAppShell, initAppShellListeners } from './components/AppShell.js';
import { showToast } from './components/Toast.js';

const appElement = document.getElementById('app');

// Dynamic Router Function
async function navigate(viewName, options = {}) {
  // Update state view (publishes events to subscribers if any)
  stateStore.updateState({ currentView: viewName });
  
  let contentHtml = '';
  
  // Render corresponding HTML view
  switch (viewName) {
    case 'landing':
      contentHtml = renderLandingView();
      appElement.innerHTML = contentHtml;
      initLandingListeners(appElement, navigate);
      return;
      
    case 'auth':
      contentHtml = renderAuthView();
      break;
      
    case 'dashboard':
      contentHtml = renderDashboardView();
      break;
      
    case 'optimizer':
      // Handle options passed from templates or quick compile
      if (options.activeTemplateId) {
        // Find in registry and select it in view
        setTimeout(() => {
          const select = document.getElementById('editor-template-select');
          if (select) {
            select.value = options.activeTemplateId;
          }
        }, 50);
      }
      
      contentHtml = renderOptimizerView();
      break;
      
    case 'templates':
      contentHtml = renderTemplatesView();
      break;
      
    case 'saved':
      contentHtml = renderSavedPromptsView(options);
      break;
      
    case 'settings':
      contentHtml = renderSettingsView();
      break;
      
    default:
      contentHtml = renderLandingView();
      appElement.innerHTML = contentHtml;
      initLandingListeners(appElement, navigate);
      return;
  }

  // Wrap content inside sidebar App Shell layout
  appElement.innerHTML = renderAppShell(viewName, contentHtml);
  
  // Initialize listeners
  initAppShellListeners(appElement, navigate);
  
  // Initialize specific view listeners
  switch (viewName) {
    case 'auth':
      initAuthListeners(appElement, navigate);
      break;
    case 'dashboard':
      initDashboardListeners(appElement, navigate);
      break;
    case 'optimizer':
      initOptimizerListeners(appElement, navigate);
      
      // Auto optimize triggered from dashboard quick optimize
      if (options.runAutoOptimize) {
        setTimeout(() => {
          const optBtn = document.getElementById('editor-btn-optimize');
          if (optBtn) optBtn.click();
        }, 150);
      }
      break;
    case 'templates':
      initTemplatesListeners(appElement, navigate);
      break;
    case 'saved':
      initSavedPromptsListeners(appElement, navigate, options);
      break;
    case 'settings':
      initSettingsListeners(appElement, navigate);
      break;
  }
}

// Bootstrap Application
async function bootstrap() {
  console.log('Bootstrapping AntiGravity Prompt Optimizer...');
  
  // 1. Seed initial mock templates for fresh local experience
  localStorageService.seedMockData();

  const storedSettings = stateStore.getState().settings;

  // 2. Try initializing custom Firebase config if saved
  let isFbConnected = false;
  if (storedSettings.firebaseConfig) {
    isFbConnected = initFirebase(storedSettings.firebaseConfig);
  }

  // 3. Load initial datasets
  try {
    if (isFbConnected) {
      // Firebase listener in initFirebase will trigger setUser and setPrompts
      console.log('Awaiting Firebase Auth initialization...');
    } else {
      // Load offline prompts
      const localPrompts = localStorageService.getPrompts();
      stateStore.setPrompts(localPrompts);
      
      // Initial routing
      navigate('landing');
    }
  } catch (e) {
    console.error('Bootstrapping data load error:', e);
    stateStore.setPrompts(localStorageService.getPrompts());
    navigate('landing');
  }

  // Set up a global error boundary handler to notify user on exceptions
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    showToast(event.reason?.message || 'A promise operation failed.', 'error');
  });
}

// Run bootstrapper when DOM is fully loaded
document.addEventListener('DOMContentLoaded', bootstrap);
