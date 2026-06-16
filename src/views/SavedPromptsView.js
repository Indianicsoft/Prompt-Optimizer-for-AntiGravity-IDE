// Saved Prompts List & Version Control Inspector View

import { stateStore } from '../core/state.js';
import { firebaseService } from '../core/firebase.js';
import { renderScoreIndicator } from '../components/ScoreIndicator.js';
import { renderDiff } from '../components/DiffViewer.js';
import { showToast } from '../components/Toast.js';
import { getScoreClass, formatDate, escapeHtml } from '../core/utils.js';

export function renderSavedPromptsView(options = {}) {
  const state = stateStore.getState();
  const prompts = state.prompts;
  
  // Selected active saved prompt details
  const selectedId = options.selectedId || (prompts.length > 0 ? prompts[0].id : null);
  const activePrompt = prompts.find(p => p.id === selectedId);
  const activeTab = options.activeTab || 'optimized'; // optimized, raw, history, compare
  const compareVersionId = options.compareVersionId || null;

  // 1. Render Left Sidebar List
  const promptsListHtml = prompts.length > 0
    ? prompts.map(p => {
        const isSelected = p.id === selectedId;
        const score = p.scoreBreakdown ? p.scoreBreakdown.total || 0 : 0;
        const scoreClass = getScoreClass(score);

        return `
          <div 
            class="prompt-list-item flex flex-col gap-1 cursor-pointer" 
            data-id="${p.id}"
            style="
              padding: 1rem;
              border-bottom: 1px solid var(--border-color);
              background-color: ${isSelected ? 'rgba(255, 255, 255, 0.02)' : 'transparent'};
              border-left: 3px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'};
              transition: all var(--transition-fast);
            "
          >
            <div class="flex justify-between align-center">
              <span style="font-weight: 600; color: ${isSelected ? '#ffffff' : 'var(--text-primary)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">
                ${escapeHtml(p.title)}
              </span>
              <span class="badge ${scoreClass}" style="font-size: 0.7rem;">${score}%</span>
            </div>
            <div class="flex justify-between align-center" style="font-size: 0.75rem; color: var(--text-muted);">
              <span>${p.mode.split(' ').pop()}</span>
              <span>v${p.versionNumber || 1}</span>
            </div>
          </div>
        `;
      }).join('')
    : `<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No saved prompts found. Go to Optimizer to save your first prompt.</div>`;

  // 2. Render Right Inspector Panel
  let inspectorHtml = '';
  
  if (activePrompt) {
    // Tabs HTML
    const tabs = [
      { id: 'optimized', label: 'Optimized Prompt' },
      { id: 'raw', label: 'Raw Prompt' },
      { id: 'history', label: 'Version History' }
    ];
    
    if (compareVersionId) {
      tabs.push({ id: 'compare', label: 'Compare Diff' });
    }

    const tabsHtml = tabs.map(tab => {
      const isSelected = activeTab === tab.id;
      return `
        <button 
          class="inspector-tab btn btn-text" 
          data-tab="${tab.id}" 
          style="
            border-radius: 0;
            padding-bottom: 0.75rem;
            color: ${isSelected ? '#ffffff' : 'var(--text-secondary)'};
            border-bottom: 2px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'};
            font-weight: ${isSelected ? '600' : '500'};
            font-size: 0.85rem;
          "
        >
          ${tab.label}
        </button>
      `;
    }).join('');

    // Detail Pane Content switcher
    let tabContentHtml = '';

    if (activeTab === 'optimized') {
      tabContentHtml = `
        <div class="flex flex-col gap-4 h-full">
          <div class="form-group flex-grow">
            <textarea class="input-field flex-grow" readonly style="font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.4; height: 320px; background-color: var(--bg-primary);">${activePrompt.optimizedPrompt}</textarea>
          </div>
          <div class="flex gap-2">
            <button id="inspector-btn-copy" class="btn btn-primary">Copy Optimized Prompt</button>
            <button id="inspector-btn-edit" class="btn btn-secondary">Load in Workspace</button>
            <button id="inspector-btn-delete" class="btn btn-danger btn-icon-only" title="Delete Prompt">
              <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    } else if (activeTab === 'raw') {
      tabContentHtml = `
        <div class="flex flex-col gap-4 h-full">
          <div class="form-group flex-grow">
            <textarea class="input-field flex-grow" readonly style="font-family: var(--font-sans); line-height: 1.5; height: 320px; background-color: var(--bg-primary);">${activePrompt.rawPrompt}</textarea>
          </div>
          <button id="inspector-btn-edit-raw" class="btn btn-secondary">Load in Workspace</button>
        </div>
      `;
    } else if (activeTab === 'history') {
      // Async fetched later, render loading skeleton for now or static lists
      tabContentHtml = `
        <div class="flex flex-col gap-4">
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            Firestore logged versions for this prompt. Select a version to run comparative audits.
          </div>
          <div id="inspector-versions-list" class="flex flex-col gap-2">
            <!-- Loader Spinner -->
            <div class="flex justify-center align-center" style="padding: 2rem;">
              <svg class="icon animate-spin" style="width:24px; height:24px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4, 31.4"></circle></svg>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'compare' && compareVersionId) {
      tabContentHtml = `
        <div class="flex flex-col gap-4 h-full">
          <div id="inspector-diff-viewer" style="height: 380px; overflow-y: auto;">
            <!-- Loader Spinner -->
            <div class="flex justify-center align-center" style="padding: 4rem 0;">
              <svg class="icon animate-spin" style="width:24px; height:24px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4, 31.4"></circle></svg>
            </div>
          </div>
          <button id="inspector-btn-back-history" class="btn btn-secondary" style="align-self: flex-start;">
            Back to Version History
          </button>
        </div>
      `;
    }

    const tagsHtml = activePrompt.tags && activePrompt.tags.length > 0
      ? activePrompt.tags.map(t => `<span class="badge badge-info">${t}</span>`).join(' ')
      : '';

    inspectorHtml = `
      <div class="panel flex flex-col gap-4 h-full" style="padding: 2rem;">
        
        <!-- Header title, tags, targets -->
        <div class="flex justify-between align-start" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
          <div class="flex flex-col gap-1">
            <h2 style="font-family: var(--font-display); font-size: 1.35rem; color: #ffffff;">${activePrompt.title}</h2>
            <div class="flex align-center gap-2" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
              <span>Type: <strong>${activePrompt.mode}</strong></span>
              <span>•</span>
              <span>Target: <strong>${activePrompt.modelTarget}</strong></span>
            </div>
            <div class="flex gap-2" style="margin-top: 0.5rem;">
              ${tagsHtml}
            </div>
          </div>
          <div style="flex-shrink: 0;">
            ${renderScoreIndicator(activePrompt.scoreBreakdown?.total || 0, 74, 'Score')}
          </div>
        </div>

        <!-- Detail Tabs row -->
        <div class="flex gap-4" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.5rem;">
          ${tabsHtml}
        </div>

        <!-- Tab content viewport -->
        <div class="flex-grow" style="min-height: 380px;">
          ${tabContentHtml}
        </div>

      </div>
    `;
  } else {
    inspectorHtml = `
      <div class="panel flex flex-col align-center justify-center" style="height: 100%; border-style: dashed; padding: 4rem 2rem; text-align: center; color: var(--text-muted);">
        <svg class="icon" style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--text-muted);" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        <h3>No Prompt Selected</h3>
        <p style="font-size: 0.85rem; max-width: 250px; margin-top: 0.5rem;">Select an optimized prompt from the history sidebar to review version details.</p>
      </div>
    `;
  }

  return `
    <div class="grid" style="grid-template-columns: 260px 1fr; gap: 2rem; height: calc(100vh - var(--header-height) - 4rem);">
      
      <!-- LEFT SIDEBAR: LIST OF SAVED ITEMS -->
      <div class="panel flex flex-col gap-0" style="padding: 0; overflow-y: auto; height: 100%;">
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color); background-color: var(--bg-secondary);">
          <h3 style="font-family: var(--font-display); font-size: 1.1rem; color: #ffffff;">Saved Library</h3>
        </div>
        <div class="flex-grow" style="overflow-y: auto;">
          ${promptsListHtml}
        </div>
      </div>

      <!-- RIGHT PANEL: DETAILED METRICS INSPECTOR -->
      <div style="height: 100%;">
        ${inspectorHtml}
      </div>

    </div>
  `;
}

export function initSavedPromptsListeners(appElement, navigateCallback, viewOptions = {}) {
  const state = stateStore.getState();
  const prompts = state.prompts;
  const selectedId = viewOptions.selectedId || (prompts.length > 0 ? prompts[0].id : null);
  const activePrompt = prompts.find(p => p.id === selectedId);
  const activeTab = viewOptions.activeTab || 'optimized';

  // 1. Left list item click routing
  const listItems = appElement.querySelectorAll('.prompt-list-item');
  listItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      navigateCallback('saved', { selectedId: id, activeTab: 'optimized' });
    });
  });

  if (!activePrompt) return;

  // 2. Tab selection triggers
  const tabButtons = appElement.querySelectorAll('.inspector-tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      navigateCallback('saved', { selectedId, activeTab: tab });
    });
  });

  // 3. Tab Specific Actions

  // Optimized Tab
  const copyBtn = appElement.querySelector('#inspector-btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(activePrompt.optimizedPrompt)
        .then(() => showToast('Optimized prompt copied!', 'success'))
        .catch(() => showToast('Copy failed.', 'error'));
    });
  }

  const editBtn = appElement.querySelector('#inspector-btn-edit');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      stateStore.setActivePrompt(activePrompt);
      navigateCallback('optimizer');
    });
  }

  const deleteBtn = appElement.querySelector('#inspector-btn-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Delete this prompt and all its version logs?')) {
        try {
          await firebaseService.deletePrompt(activePrompt.id);
          showToast('Prompt deleted.', 'success');
          // Reload view with no selection or next item
          navigateCallback('saved');
        } catch (e) {
          console.error(e);
          showToast('Deletion failed.', 'error');
        }
      }
    });
  }

  // Raw Tab
  const editRawBtn = appElement.querySelector('#inspector-btn-edit-raw');
  if (editRawBtn) {
    editRawBtn.addEventListener('click', () => {
      stateStore.setActivePrompt(activePrompt);
      navigateCallback('optimizer');
    });
  }

  // Version History Tab
  if (activeTab === 'history') {
    const versionsContainer = appElement.querySelector('#inspector-versions-list');
    
    // Fetch from Firebase Service asynchronously
    firebaseService.getPromptVersions(activePrompt.id).then(versions => {
      if (!versionsContainer) return;
      
      if (versions.length === 0) {
        versionsContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.85rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
            No logged history. Old versions are recorded when saving updates with modified raw prompts.
          </div>
        `;
        return;
      }

      const listHtml = versions.map(v => {
        const dateStr = new Date(v.createdAt).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const score = v.scoreBreakdown ? v.scoreBreakdown.total || 0 : 0;

        return `
          <div class="flex justify-between align-center panel" style="padding: 0.75rem 1rem; border-color: var(--border-color); background-color: var(--bg-secondary);">
            <div class="flex flex-col gap-1">
              <span style="font-weight:600; color:#ffffff; font-size:0.9rem;">Version ${v.versionNumber}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">${dateStr} • Score: ${score}%</span>
            </div>
            <button class="btn btn-secondary compare-version-btn" data-vid="${v.id}" style="padding:0.4rem 0.75rem; font-size:0.8rem;">
              Compare Diff
            </button>
          </div>
        `;
      }).join('');

      versionsContainer.innerHTML = listHtml;

      // Bind diff buttons
      const compareButtons = versionsContainer.querySelectorAll('.compare-version-btn');
      compareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const vid = btn.getAttribute('data-vid');
          navigateCallback('saved', { selectedId, activeTab: 'compare', compareVersionId: vid });
        });
      });
    }).catch(err => {
      console.error(err);
      if (versionsContainer) {
        versionsContainer.innerHTML = `<div style="color:var(--error); font-size:0.85rem;">Failed to load version history.</div>`;
      }
    });
  }

  // Compare Tab
  if (activeTab === 'compare' && viewOptions.compareVersionId) {
    const diffContainer = appElement.querySelector('#inspector-diff-viewer');
    
    // Fetch all versions to find the matching one
    firebaseService.getPromptVersions(activePrompt.id).then(versions => {
      if (!diffContainer) return;
      const targetVersion = versions.find(v => v.id === viewOptions.compareVersionId);
      if (!targetVersion) {
        diffContainer.innerHTML = `<div style="color:var(--error); font-size:0.85rem;">Selected version not found.</div>`;
        return;
      }

      // Render the diff side-by-side: Version B vs Version A (Current vs Old)
      diffContainer.innerHTML = renderDiff(targetVersion.optimizedPrompt, activePrompt.optimizedPrompt);
    }).catch(err => {
      console.error(err);
      if (diffContainer) {
        diffContainer.innerHTML = `<div style="color:var(--error); font-size:0.85rem;">Failed to load diff content.</div>`;
      }
    });

    const backHistoryBtn = appElement.querySelector('#inspector-btn-back-history');
    if (backHistoryBtn) {
      backHistoryBtn.addEventListener('click', () => {
        navigateCallback('saved', { selectedId, activeTab: 'history' });
      });
    }
  }
}
