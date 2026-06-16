// Welcome & Landing View

export function renderLandingView() {
  return `
    <div style="
      max-width: 1000px;
      margin: 0 auto;
      padding: 4rem 1.5rem;
      text-align: center;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    ">
      <!-- Header Brand -->
      <div class="flex align-center gap-3" style="margin-bottom: 2rem;">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          box-shadow: 0 0 20px var(--accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg class="icon" style="color: white; width: 24px; height: 24px;" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        </div>
        <h1 style="font-size: 2.2rem; font-family: var(--font-display); font-weight: 800; background: linear-gradient(to right, #ffffff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          AntiGravity IDE Prompt Optimizer
        </h1>
      </div>

      <!-- Hero Subtitle -->
      <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 680px; margin-bottom: 3rem; line-height: 1.6;">
        Convert vague, low-quality developer prompts into clean, token-efficient, highly-structured specifications designed specifically for coding workflows.
      </p>

      <!-- CTA Buttons -->
      <div class="flex gap-4" style="margin-bottom: 5rem;">
        <button id="landing-launch" class="btn btn-primary" style="padding: 0.85rem 1.75rem; font-size: 1rem; font-family: var(--font-display);">
          Launch Offline Sandbox
        </button>
        <button id="landing-auth" class="btn btn-secondary" style="padding: 0.85rem 1.75rem; font-size: 1rem; font-family: var(--font-display);">
          Sign In / Connect Cloud
        </button>
      </div>

      <!-- Feature Grid -->
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; width: 100%; text-align: left;">
        
        <div class="panel" style="padding: 1.75rem;">
          <div style="color: var(--accent-primary); margin-bottom: 1rem;">
            <svg class="icon" style="width: 28px; height: 28px;" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: #ffffff;">Structural Optimization Pipeline</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Compiles raw prompts to inject developer personas, target scoping, core requirements, environment constraints, and explicit output structures.
          </p>
        </div>

        <div class="panel" style="padding: 1.75rem;">
          <div style="color: var(--accent-secondary); margin-bottom: 1rem;">
            <svg class="icon" style="width: 28px; height: 28px;" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: #ffffff;">Scenario-Based Template Engine</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Apply customized scaffolds tailored for bug fixes, greenfield builds, surgical safe patches, UI redesigns, and token-saving compact layouts.
          </p>
        </div>

        <div class="panel" style="padding: 1.75rem;">
          <div style="color: var(--success); margin-bottom: 1rem;">
            <svg class="icon" style="width: 28px; height: 28px;" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: #ffffff;">Multi-Metric Scoring Engine</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Evaluate prompts across clarity, specificity, completeness, ambiguity risk, output boundaries, and token efficiency to guarantee model readiness.
          </p>
        </div>

      </div>
      
      <!-- Footer Version -->
      <div style="margin-top: 6rem; font-size: 0.8rem; color: var(--text-muted);">
        Licensed under MIT. Build 1.0.0. Devtools Architect.
      </div>
    </div>
  `;
}

export function initLandingListeners(appElement, navigateCallback) {
  const launchBtn = appElement.querySelector('#landing-launch');
  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      navigateCallback('optimizer');
    });
  }

  const authBtn = appElement.querySelector('#landing-auth');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      navigateCallback('auth');
    });
  }
}
