// Optimizer Workspace View

import { stateStore } from '../core/state.js';
import { firebaseService } from '../core/firebase.js';
import { templatesRegistry } from '../engine/templates.js';
import { presetsRegistry } from '../engine/presets.js';
import { constraintsRegistry } from '../engine/constraints.js';
import { runOptimizationPipeline } from '../engine/index.js';
import { renderScoreIndicator, renderScoreCard } from '../components/ScoreIndicator.js';
import { renderDiff } from '../components/DiffViewer.js';
import { showToast } from '../components/Toast.js';
import { escapeHtml, getScoreClass } from '../core/utils.js';

export function renderOptimizerView() {
  const state = stateStore.getState();
  const activePrompt = state.activePrompt || {
    id: `p-${Date.now()}`,
    title: '',
    rawPrompt: '',
    optimizedPrompt: '',
    mode: 'New app build',
    modelTarget: 'Gemini Style (Compact Structured)',
    constraints: [],
    scoreBreakdown: null,
    explanation: [],
    versionNumber: 1
  };

  // Build target templates option list
  const templatesOptions = templatesRegistry.map(t => `
    <option value="${t.id}">${t.name}</option>
  `).join('');

  // Build preset option list
  const presetsOptions = presetsRegistry.map(p => `
    <option value="${p.id}" ${activePrompt.modelTarget === p.name ? 'selected' : ''}>${p.name}</option>
  `).join('');

  // Build constraints toggles HTML
  const constraintsHtml = constraintsRegistry.map(c => {
    const isActive = activePrompt.constraints.includes(c.id);
    return `
      <label class="constraint-toggle ${isActive ? 'active' : ''}" data-id="${c.id}">
        <input type="checkbox" value="${c.id}" ${isActive ? 'checked' : ''}>
        <div class="checkbox-custom"></div>
        <span class="constraint-label" title="${c.description}">${c.name}</span>
      </label>
    `;
  }).join('');

  // Build target model choices
  const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'claude-3-5-sonnet', 'gpt-4o'];
  const modelsOptions = models.map(m => `
    <option value="${m}">${m}</option>
  `).join('');

  // Render output panel condition
  const hasOutput = !!activePrompt.optimizedPrompt;
  const score = activePrompt.scoreBreakdown ? activePrompt.scoreBreakdown.total || 0 : 0;
  
  const scoreCardHtml = activePrompt.scoreBreakdown 
    ? renderScoreCard(activePrompt.scoreBreakdown) 
    : '';

  const explanationsHtml = activePrompt.explanation && activePrompt.explanation.length > 0
    ? activePrompt.explanation.map(exp => `
        <div class="flex gap-2" style="font-size: 0.85rem; line-height: 1.4; padding: 0.25rem 0;">
          <span class="badge badge-cyan" style="align-self: flex-start; padding: 0.1rem 0.5rem; font-size: 0.7rem;">${escapeHtml(exp.category)}</span>
          <span style="color: var(--text-secondary);">${escapeHtml(exp.detail)}</span>
        </div>
      `).join('')
    : '<div style="color: var(--text-muted); font-size: 0.85rem;">Run compilation to inspect adjustments.</div>';

  return `
    <div class="grid" style="grid-template-columns: 1fr 1.1fr; gap: 2rem; height: calc(100vh - var(--header-height) - 4rem); min-height: 500px;">
      
      <!-- LEFT WORKSPACE Panel: EDITOR & OPTIONS -->
      <div class="panel flex flex-col gap-4" style="height: 100%; overflow-y: auto;">
        
        <div class="form-group flex-grow">
          <div class="flex justify-between align-center">
            <label for="editor-raw-prompt" style="font-size: 0.85rem;">Raw Development Instructions</label>
            <span id="editor-char-counter" style="font-size: 0.75rem; color: var(--text-muted);">0 chars</span>
          </div>
          <textarea 
            id="editor-raw-prompt" 
            class="input-field flex-grow" 
            placeholder="Paste your raw, vague prompt here (e.g. make a file list with a search bar and styling)..."
            style="min-height: 180px; font-family: var(--font-sans); line-height: 1.5;"
          >${activePrompt.rawPrompt}</textarea>
        </div>

        <!-- CONFIGURATION PARAMETERS -->
        <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
          
          <div class="form-group">
            <label for="editor-template-select">Task Template</label>
            <select id="editor-template-select" class="input-field" style="padding: 0.5rem 0.75rem;">
              ${templatesOptions}
            </select>
          </div>

          <div class="form-group">
            <label for="editor-preset-select">Model Style Preset</label>
            <select id="editor-preset-select" class="input-field" style="padding: 0.5rem 0.75rem;">
              ${presetsOptions}
            </select>
          </div>

        </div>

        <!-- ENV CONSTRAINTS PANEL -->
        <div class="form-group">
          <label style="font-size: 0.8rem; margin-bottom: 0.25rem;">Constraint Builder (inject rules)</label>
          <div class="constraint-grid">
            ${constraintsHtml}
          </div>
        </div>

        <!-- SUBMISSION CTA -->
        <div class="flex gap-3" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color);">
          <button id="editor-btn-optimize" class="btn btn-primary flex-grow" style="justify-content: center; font-size: 1rem;">
            <svg class="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Optimize Prompt
          </button>
          
          ${state.settings.useAI ? `
            <div class="form-group" style="margin: 0; min-width: 130px;">
              <select id="editor-ai-model" class="input-field" style="padding: 0.625rem; font-size: 0.85rem;">
                ${modelsOptions}
              </select>
            </div>
          ` : ''}
        </div>

      </div>

      <!-- RIGHT WORKSPACE Panel: OUTPUTS & METRICS -->
      <div class="panel flex flex-col gap-4" style="height: 100%; overflow-y: auto; position: relative;">
        
        <!-- Output text editor block -->
        <div class="form-group flex-grow">
          <div class="flex justify-between align-center">
            <label for="editor-optimized-prompt">Optimized Prompt Output</label>
            <div class="flex align-center gap-2">
              <button id="editor-btn-copy" class="btn btn-secondary btn-icon-only" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" title="Copy to clipboard" ${!hasOutput ? 'disabled' : ''}>
                <svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy
              </button>
              
              <!-- Export System toggle -->
              <div class="relative" style="display:inline-block;">
                <button id="editor-btn-export" class="btn btn-secondary btn-icon-only" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" title="Export prompt options" ${!hasOutput ? 'disabled' : ''}>
                  <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Export
                </button>
                <div id="editor-export-menu" class="glass-panel" style="display:none; position:absolute; right:0; bottom:110%; z-index:100; min-width:140px; padding: 0.5rem 0; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
                  <button class="export-opt btn btn-text w-full" data-format="txt" style="text-align:left; padding: 0.5rem 1rem;">Export .TXT</button>
                  <button class="export-opt btn btn-text w-full" data-format="md" style="text-align:left; padding: 0.5rem 1rem;">Export .MD</button>
                  <button class="export-opt btn btn-text w-full" data-format="json" style="text-align:left; padding: 0.5rem 1rem;">Export .JSON</button>
                </div>
              </div>
              
              <button id="editor-btn-save" class="btn btn-secondary btn-icon-only" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" title="Save / Update Prompt" ${!hasOutput ? 'disabled' : ''}>
                <svg class="icon" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save
              </button>
            </div>
          </div>
          
          <textarea 
            id="editor-optimized-prompt" 
            class="input-field flex-grow" 
            placeholder="Optimized structured prompt will appear here after optimization..."
            readonly
            style="min-height: 180px; font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.4; background-color: var(--bg-primary);"
          >${activePrompt.optimizedPrompt}</textarea>
        </div>

        <!-- QUALITY METRICS & ADJUSTMENTS -->
        <div class="grid" style="grid-template-columns: 1.3fr 1fr; gap: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          
          <!-- Quality Gauges breakdown -->
          <div class="flex flex-col gap-3">
            <div class="flex align-center justify-between">
              <h4 style="font-family: var(--font-sans); font-size: 0.85rem; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">Quality Audit Metrics</h4>
              ${hasOutput ? `<span style="font-size: 0.85rem; font-weight:700; color: var(--accent-secondary);">Readiness Score: ${score}%</span>` : ''}
            </div>
            
            ${hasOutput ? `
              <div style="background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem;">
                ${scoreCardHtml}
              </div>
            ` : `
              <div style="text-align:center; color: var(--text-muted); padding: 1.5rem; background-color: var(--bg-tertiary); border: 1px dashed var(--border-color); border-radius: var(--radius-md); font-size:0.85rem;">
                No metrics calculated yet.
              </div>
            `}
          </div>

          <!-- Explanation modifications -->
          <div class="flex flex-col gap-3">
            <h4 style="font-family: var(--font-sans); font-size: 0.85rem; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">Structural Adjustments</h4>
            <div style="background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem; min-height: 110px; overflow-y: auto;">
              ${explanationsHtml}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

export function initOptimizerListeners(appElement, navigateCallback) {
  const rawTextarea = appElement.querySelector('#editor-raw-prompt');
  const optTextarea = appElement.querySelector('#editor-optimized-prompt');
  const charCounter = appElement.querySelector('#editor-char-counter');
  
  // AbortController so all event listeners added here can be cleaned up if needed
  const controller = new AbortController();
  const { signal } = controller;

  // Track active constraints in an array — read from current state at bind time
  let activeConstraints = [...(stateStore.getState().activePrompt?.constraints || [])];

  // Character counter helper
  if (rawTextarea && charCounter) {
    const updateCounter = () => {
      charCounter.innerText = `${rawTextarea.value.length} chars`;
    };
    rawTextarea.addEventListener('input', updateCounter);
    updateCounter();
  }

  // Bind Constraint checks clicks
  const constraintToggles = appElement.querySelectorAll('.constraint-toggle');
  constraintToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const id = toggle.getAttribute('data-id');
      const input = toggle.querySelector('input');
      
      input.checked = !input.checked;
      if (input.checked) {
        toggle.classList.add('active');
        if (!activeConstraints.includes(id)) {
          activeConstraints.push(id);
        }
      } else {
        toggle.classList.remove('active');
        activeConstraints = activeConstraints.filter(cid => cid !== id);
      }
    });
  });

  // Optimize Button Execution
  const optimizeBtn = appElement.querySelector('#editor-btn-optimize');
  if (optimizeBtn) {
    optimizeBtn.addEventListener('click', async () => {
      const rawPrompt = rawTextarea.value;
      if (!rawPrompt || !rawPrompt.trim()) {
        showToast('Please paste a prompt first!', 'warning');
        return;
      }

      optimizeBtn.disabled = true;
      optimizeBtn.innerHTML = `
        <svg class="icon animate-spin" style="width:16px; height:16px; margin-right: 8px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.4, 31.4"></circle></svg>
        Optimizing Pipeline...
      `;

      const templateId = appElement.querySelector('#editor-template-select').value;
      const presetId = appElement.querySelector('#editor-preset-select').value;
      const modelElement = appElement.querySelector('#editor-ai-model');
      const selectedModel = modelElement ? modelElement.value : 'gemini-1.5-flash';

      try {
        // Read state FRESH at click time — not stale from listener-bind time
        const freshState = stateStore.getState();
        const result = await runOptimizationPipeline(rawPrompt, {
          templateId,
          presetId,
          activeConstraintIds: activeConstraints,
          useAI: freshState.settings.useAI,
          apiKey: freshState.settings.apiKey,
          model: selectedModel
        });

        // Set prompt ID if modifying existing
        const activeId = state.activePrompt ? state.activePrompt.id : `p-${Date.now()}`;
        const finalPrompt = {
          ...result,
          id: activeId,
          versionNumber: state.activePrompt?.versionNumber || 1
        };

        stateStore.setActivePrompt(finalPrompt);
        showToast('Prompt compiled successfully!', 'success');
        navigateCallback('optimizer'); // Redraw view with new values
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Pipeline transformation failed.', 'error');
        optimizeBtn.disabled = false;
        optimizeBtn.innerHTML = `
          <svg class="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Optimize Prompt
        `;
      }
    });
  }

  // Copy button
  const copyBtn = appElement.querySelector('#editor-btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (optTextarea && optTextarea.value) {
        navigator.clipboard.writeText(optTextarea.value)
          .then(() => showToast('Copied to clipboard!', 'success'))
          .catch(() => showToast('Failed to copy.', 'error'));
      }
    });
  }

  // Save Button
  const saveBtn = appElement.querySelector('#editor-btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!state.activePrompt || !state.activePrompt.optimizedPrompt) {
        showToast('Nothing to save. Optimize a prompt first.', 'warning');
        return;
      }
      
      saveBtn.disabled = true;
      try {
        const { versionCreated } = await firebaseService.savePrompt(state.activePrompt);
        if (versionCreated) {
          showToast('Prompt updated and old version saved in history!', 'success');
        } else {
          showToast('Prompt saved successfully!', 'success');
        }
        // Force refresh saved prompts list in global state
        const list = await firebaseService.getPrompts();
        stateStore.setPrompts(list);
      } catch (e) {
        console.error(e);
        showToast(e.message || 'Failed to save prompt.', 'error');
      } finally {
        saveBtn.disabled = false;
      }
    });
  }

  // Export dropdown triggers — scoped to appElement to avoid document-level listener leak
  const exportBtn = appElement.querySelector('#editor-btn-export');
  const exportMenu = appElement.querySelector('#editor-export-menu');
  if (exportBtn && exportMenu) {
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.style.display = exportMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Scoped to appElement — won't leak outside this view's DOM subtree
    appElement.addEventListener('click', (e) => {
      if (!exportBtn.contains(e.target)) {
        exportMenu.style.display = 'none';
      }
    });
  }

  const exportOpts = appElement.querySelectorAll('.export-opt');
  exportOpts.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.preventDefault();
      const format = opt.getAttribute('data-format');
      const active = stateStore.getState().activePrompt;
      if (!active || !active.optimizedPrompt) return;

      const title = active.title || 'optimized_prompt';
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);
      
      let content = '';
      let filename = '';
      let mimeType = 'text/plain';

      if (format === 'txt') {
        content = active.optimizedPrompt;
        filename = `${cleanTitle}.txt`;
      } else if (format === 'md') {
        content = `# ${active.title}\n\n${active.optimizedPrompt}`;
        filename = `${cleanTitle}.md`;
        mimeType = 'text/markdown';
      } else if (format === 'json') {
        content = JSON.stringify(active, null, 2);
        filename = `${cleanTitle}.json`;
        mimeType = 'application/json';
      }

      // Download file in browser
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`Exported as ${format.toUpperCase()}!`, 'success');
    });
  });
}
