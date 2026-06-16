// Templates Library View

import { stateStore } from '../core/state.js';
import { templatesRegistry } from '../engine/templates.js';
import { showToast } from '../components/Toast.js';
import { escapeHtml } from '../core/utils.js';

export function renderTemplatesView() {
  const templatesList = templatesRegistry.map(t => {
    // Determine SVG icon based on ID
    let iconSvg = '';
    if (t.id === 'greenfield') {
      iconSvg = `<svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
    } else if (t.id === 'existing-fix') {
      iconSvg = `<svg class="icon" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
    } else if (t.id === 'safe-patch') {
      iconSvg = `<svg class="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    } else if (t.id === 'ui-redesign') {
      iconSvg = `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
    } else if (t.id === 'firebase-app') {
      iconSvg = `<svg class="icon" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="12"></line><line x1="22" y1="8.5" x2="12" y2="12"></line><line x1="2" y1="8.5" x2="12" y2="12"></line></svg>`;
    } else if (t.id === 'browser-ai') {
      iconSvg = `<svg class="icon" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`;
    } else if (t.id === 'single-file') {
      iconSvg = `<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    } else {
      iconSvg = `<svg class="icon" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    }

    return `
      <div class="panel flex flex-col justify-between" style="padding: 1.5rem; transition: transform var(--transition-fast);">
        <div>
          <!-- Icon Title header -->
          <div class="flex align-center gap-3" style="margin-bottom: 0.75rem;">
            <div style="
              width: 38px;
              height: 38px;
              border-radius: var(--radius-md);
              background-color: rgba(255, 255, 255, 0.03);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--accent-primary);
            ">
              ${iconSvg}
            </div>
            <h3 style="font-size: 1.1rem; font-family: var(--font-display); color: #ffffff;">${t.name}</h3>
          </div>
          
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.5; min-height: 50px;">
            ${t.description}
          </p>
          
          <!-- Code Outline Spec -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <span style="font-size: 0.75rem; font-weight:600; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.02em;">Target Schema Layout</span>
            <pre style="
              background-color: var(--bg-tertiary);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-sm);
              padding: 0.625rem;
              font-size: 0.75rem;
              color: var(--text-secondary);
              overflow-x: auto;
              max-height: 120px;
              margin-top: 0.25rem;
            "><code>${escapeHtml(t.format.substring(0, 150) + (t.format.length > 150 ? '...' : ''))}</code></pre>
          </div>
        </div>

        <button class="btn btn-primary w-full apply-template-btn" data-id="${t.id}" style="justify-content: center; font-size: 0.85rem;">
          Use Template In Workspace
        </button>
      </div>
    `;
  }).join('');

  return `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h3 style="font-family: var(--font-display); font-size: 1.35rem; color: #ffffff;">Scenario Scaffolding Library</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Choose a structural compile template. Each template shapes prompt requirements specifically for target tasks.
        </p>
      </div>
      
      <!-- Grid templates -->
      <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
        ${templatesList}
      </div>
    </div>
  `;
}


export function initTemplatesListeners(appElement, navigateCallback) {
  const applyButtons = appElement.querySelectorAll('.apply-template-btn');
  applyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.getAttribute('data-id');
      
      // Load selected template into editor options
      const state = stateStore.getState();
      const currentActive = state.activePrompt || {
        id: `p-${Date.now()}`,
        rawPrompt: '',
        optimizedPrompt: '',
        title: '',
        constraints: [],
        versionNumber: 1
      };

      // Set active prompt parameters and route
      stateStore.setActivePrompt(currentActive);
      
      // We will tell optimizer view to select this template.
      // We can achieve this by editing the select DOM value directly, or via our stateStore routing args.
      showToast('Template layout applied! Paste raw prompt to compile.', 'success');
      
      // Route to optimizer workspace
      navigateCallback('optimizer', { runAutoOptimize: false, activeTemplateId: templateId });
    });
  });
}
