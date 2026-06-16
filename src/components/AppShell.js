// Sidebar App Shell Navigation Frame

import { stateStore } from '../core/state.js';
import { firebaseService } from '../core/firebase.js';

export function renderAppShell(activeView, contentHtml) {
  const state = stateStore.getState();
  const user = state.user;
  
  // Define sidebar navigation tabs
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: `
      <svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
    ` },
    { id: 'optimizer', label: 'Optimizer Workspace', icon: `
      <svg class="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
    ` },
    { id: 'templates', label: 'Template Library', icon: `
      <svg class="icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
    ` },
    { id: 'saved', label: 'Saved & History', icon: `
      <svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
    ` },
    { id: 'settings', label: 'Settings', icon: `
      <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    ` }
  ];

  const sidebarLinksHtml = navItems.map(item => {
    const isSelected = activeView === item.id;
    return `
      <a 
        href="#" 
        class="nav-link ${isSelected ? 'active' : ''}" 
        data-view="${item.id}"
      >
        ${item.icon}
        <span>${item.label}</span>
      </a>
    `;
  }).join('');

  const profileFooterHtml = user ? `
    <div class="sidebar-profile flex align-center gap-3" style="padding: 1.25rem; border-top: 1px solid var(--border-color); background-color: rgba(0,0,0,0.15);">
      <div style="
        width: 36px;
        height: 36px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-weight: 700;
        color: white;
      ">
        ${user.displayName.charAt(0).toUpperCase()}
      </div>
      <div class="flex-grow min-w-0">
        <div style="font-weight: 600; font-size: 0.9rem; color: #ffffff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${user.displayName}
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${user.email}
        </div>
      </div>
      <button 
        id="btn-logout" 
        title="Sign Out" 
        style="background:none; border:none; color: var(--text-muted); cursor:pointer; padding: 0.25rem;"
      >
        <svg class="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  ` : `
    <div style="padding: 1.25rem; border-top: 1px solid var(--border-color);">
      <button 
        class="btn btn-secondary w-full" 
        data-view="auth"
        style="justify-content: center; font-size: 0.85rem;"
      >
        <svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Sign In / Sync Cloud
      </button>
    </div>
  `;

  return `
    <div class="app-layout">
      <!-- SIDEBAR -->
      <aside class="app-sidebar">
        <!-- Logo Header -->
        <div class="flex align-center gap-3" style="padding: 1.5rem 1.25rem; border-bottom: 1px solid var(--border-color);">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: var(--radius-md);
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            box-shadow: 0 0 12px var(--accent-glow);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg class="icon" style="color: white; width: 16px; height: 16px;" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <div class="flex flex-col">
            <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; color: #ffffff; letter-spacing: -0.02em; line-height: 1;">
              AntiGravity
            </span>
            <span style="font-size: 0.7rem; font-weight: 600; color: var(--accent-secondary); text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.5;">
              Prompt Optimizer
            </span>
          </div>
        </div>
        
        <!-- Navigation Links -->
        <nav class="flex-grow flex flex-col" style="padding: 1rem 0.75rem;">
          ${sidebarLinksHtml}
        </nav>
        
        <!-- Footer Profile -->
        ${profileFooterHtml}
      </aside>
      
      <!-- MAIN WORKSPACE -->
      <main class="app-main">
        <!-- Top Toolbar Header -->
        <header class="flex align-center justify-between" style="height: var(--header-height); border-bottom: 1px solid var(--border-color); padding: 0 2rem; background-color: var(--bg-secondary);">
          <div>
            <h2 style="font-size: 1.2rem; font-family: var(--font-display);">${capitalize(activeView)} Workspace</h2>
          </div>
          <div class="flex align-center gap-3">
            <!-- Offline/Cloud sync status badge -->
            ${user ? `
              <span class="badge badge-success flex align-center gap-1">
                <span style="display:inline-block; width:6px; height:6px; background:var(--success); border-radius:50%;"></span>
                Cloud Sync Active
              </span>
            ` : `
              <span class="badge badge-info flex align-center gap-1" title="Firebase not configured. Data stored locally.">
                <span style="display:inline-block; width:6px; height:6px; background:#a5b4fc; border-radius:50%;"></span>
                Offline Sandbox
              </span>
            `}
            
            <a href="https://github.com" target="_blank" class="btn btn-secondary btn-icon-only" title="GitHub Repository">
              <svg class="icon" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </div>
        </header>
        
        <!-- App Content container -->
        <div class="app-content">
          <div class="fade-in">
            ${contentHtml}
          </div>
        </div>
      </main>
    </div>
  `;
}

function capitalize(str) {
  if (str === 'saved') return 'Saved Prompts';
  if (str === 'optimizer') return 'Prompt Optimizer';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Bind navigation click event listeners
export function initAppShellListeners(appElement, navigateCallback) {
  // Navigation links click
  const navLinks = appElement.querySelectorAll('.nav-link, [data-view]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      if (view) {
        navigateCallback(view);
      }
    });
  });

  // Logout button
  const logoutBtn = appElement.querySelector('#btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await firebaseService.signOut();
        navigateCallback('landing');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    });
  }
}
