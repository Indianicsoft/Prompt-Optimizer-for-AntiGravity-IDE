// Dashboard View

import { stateStore } from '../core/state.js';
import { firebaseService } from '../core/firebase.js';
import { renderScoreIndicator } from '../components/ScoreIndicator.js';
import { showToast } from '../components/Toast.js';
import { getScoreClass, formatDate, escapeHtml } from '../core/utils.js';

export function renderDashboardView() {
  const state = stateStore.getState();
  const stats = state.stats;
  const recentPrompts = state.prompts.slice(0, 4);

  // Group prompts by Task Mode
  const modeGroups = {};
  state.prompts.forEach(p => {
    if (p.mode) {
      modeGroups[p.mode] = (modeGroups[p.mode] || 0) + 1;
    }
  });

  const categoriesHtml = Object.keys(modeGroups).length > 0 
    ? Object.entries(modeGroups).map(([mode, count]) => `
        <div class="flex justify-between align-center" style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem;">
          <span style="color: var(--text-primary); font-weight: 500;">${mode}</span>
          <span class="badge badge-info">${count} ${count === 1 ? 'prompt' : 'prompts'}</span>
        </div>
      `).join('')
    : `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0; font-size: 0.9rem;">No data collections grouped yet.</div>`;

  const recentPromptsHtml = recentPrompts.length > 0
    ? recentPrompts.map(p => {
        const score = p.scoreBreakdown ? p.scoreBreakdown.total || 0 : 0;
        const scoreClass = getScoreClass(score);
        const dateStr = formatDate(p.updatedAt);

        return `
          <div class="flex justify-between align-center panel" style="padding: 1rem; border-color: var(--border-color); margin-bottom: 0.75rem;">
            <div class="flex-grow min-w-0 flex flex-col gap-1">
              <div class="flex align-center gap-2">
                <a href="#" class="dashboard-load-prompt" data-id="${p.id}" style="font-weight: 600; color: #ffffff; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${escapeHtml(p.title)}
                </a>
                <span class="badge ${scoreClass}">${score}% Score</span>
              </div>
              <div class="flex align-center gap-3" style="font-size: 0.8rem; color: var(--text-secondary);">
                <span>Mode: <strong>${p.mode}</strong></span>
                <span>•</span>
                <span>Updated ${dateStr}</span>
              </div>
            </div>
            <div class="flex align-center gap-2">
              <button class="btn btn-secondary btn-icon-only dashboard-load-prompt" data-id="${p.id}" title="Optimize Prompt">
                <svg class="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </button>
              <button class="btn btn-danger btn-icon-only dashboard-delete-prompt" data-id="${p.id}" title="Delete Prompt">
                <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `;
      }).join('')
    : `
      <div class="panel flex flex-col align-center justify-center" style="padding: 3rem 1.5rem; text-align: center; border-style: dashed;">
        <svg class="icon" style="width: 32px; height: 32px; color: var(--text-muted); margin-bottom: 1rem;" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>
        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">No Prompts Created Yet</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 280px; margin-bottom: 1.25rem;">
          Optimize your first raw instructions using our compiling pipelines.
        </p>
        <button id="dashboard-start-prompt" class="btn btn-primary">
          Open Optimizer Workspace
        </button>
      </div>
    `;

  return `
    <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 2rem;">
      <!-- LEFT AREA: STATS & RECENT PROMPTS -->
      <div class="flex flex-col gap-6">
        
        <!-- COUNTERS METRICS -->
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.25rem;">
          
          <div class="panel flex flex-col justify-between" style="padding: 1.25rem;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Total Prompts</span>
            <div class="flex align-center justify-between" style="margin-top: 1rem;">
              <span style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; color: #ffffff;">
                ${stats.totalPrompts}
              </span>
              <div style="color: var(--accent-primary);">
                <svg class="icon" style="width: 28px; height: 28px;" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
            </div>
          </div>

          <div class="panel flex flex-col justify-between" style="padding: 1.25rem;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Scaffolds Used</span>
            <div class="flex align-center justify-between" style="margin-top: 1rem;">
              <span style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; color: #ffffff;">
                ${stats.totalTemplatesUsed}
              </span>
              <div style="color: var(--accent-secondary);">
                <svg class="icon" style="width: 28px; height: 28px;" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              </div>
            </div>
          </div>

          <div class="panel flex flex-col justify-between" style="padding: 1.25rem;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Quality Level</span>
            <div class="flex align-center justify-between" style="margin-top: 0.5rem;">
              <span style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; color: #ffffff;">
                ${stats.avgScore}%
              </span>
              <!-- Circular tiny gauge -->
              ${renderScoreIndicator(stats.avgScore, 46, '', false)}
            </div>
          </div>

          <div class="panel flex flex-col justify-between" style="padding: 1.25rem;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Fav Preset</span>
            <div class="flex flex-col" style="margin-top: 0.75rem;">
              <span style="font-weight: 600; font-size: 0.95rem; color: #ffffff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${stats.mostUsedPreset}
              </span>
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Configured Style</span>
            </div>
          </div>

        </div>

        <!-- RECENT PROMPTS LIST -->
        <div>
          <h3 style="font-size: 1.1rem; font-family: var(--font-display); margin-bottom: 1rem; color: #ffffff;">
            Recent Optimization History
          </h3>
          ${recentPromptsHtml}
        </div>

      </div>

      <!-- RIGHT AREA: QUICK START & CATEGORIES SUMMARY -->
      <div class="flex flex-col gap-6">
        
        <!-- QUICK OPTIMIZER PANEL -->
        <div class="panel flex flex-col gap-4" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.03), rgba(6, 182, 212, 0.03)); border-color: rgba(99, 102, 241, 0.15);">
          <h3 style="font-family: var(--font-display); font-size: 1.1rem; color: #ffffff;">Quick Compile</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
            Paste a single instruction below to parse instantly in the default compiler:
          </p>
          <textarea 
            id="dashboard-quick-prompt" 
            class="input-field" 
            placeholder="e.g. fix standard CORS errors in my Node Express API routes file..."
            style="min-height: 80px; font-size: 0.85rem;"
          ></textarea>
          <button id="dashboard-quick-optimize" class="btn btn-primary w-full" style="justify-content: center;">
            Compile Structured Prompt
          </button>
        </div>

        <!-- COLLECTIONS GRAPH BOX -->
        <div class="panel">
          <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 1rem; color: #ffffff;">
            Scoping Collections
          </h3>
          <div class="flex flex-col">
            ${categoriesHtml}
          </div>
        </div>

      </div>
    </div>
  `;
}

export function initDashboardListeners(appElement, navigateCallback) {
  // Load prompt click
  const loadLinks = appElement.querySelectorAll('.dashboard-load-prompt');
  loadLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const promptId = link.getAttribute('data-id');
      const targetPrompt = stateStore.getState().prompts.find(p => p.id === promptId);
      if (targetPrompt) {
        stateStore.setActivePrompt(targetPrompt);
        navigateCallback('optimizer');
      }
    });
  });

  // Delete prompt click
  const deleteButtons = appElement.querySelectorAll('.dashboard-delete-prompt');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const promptId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this prompt and all its version history?')) {
        try {
          await firebaseService.deletePrompt(promptId);
          showToast('Prompt deleted.', 'success');
          // Reload dashboard content
          navigateCallback('dashboard');
        } catch (err) {
          console.error(err);
          showToast('Failed to delete prompt.', 'error');
        }
      }
    });
  });

  // Start prompt button
  const startBtn = appElement.querySelector('#dashboard-start-prompt');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      stateStore.setActivePrompt(null); // Load blank editor
      navigateCallback('optimizer');
    });
  }

  // Quick Optimize button
  const quickOptimizeBtn = appElement.querySelector('#dashboard-quick-optimize');
  if (quickOptimizeBtn) {
    quickOptimizeBtn.addEventListener('click', () => {
      const rawText = appElement.querySelector('#dashboard-quick-prompt').value;
      if (!rawText || !rawText.trim()) {
        showToast('Please enter a prompt first.', 'warning');
        return;
      }
      
      // Load into active prompt and route
      const tempPrompt = {
        id: `p-${Date.now()}`,
        rawPrompt: rawText,
        optimizedPrompt: '',
        title: 'Quick Compile',
        constraints: [],
        versionNumber: 1
      };
      
      stateStore.setActivePrompt(tempPrompt);
      navigateCallback('optimizer', { runAutoOptimize: true });
    });
  }
}
