// Toast Notifications Component (success, warning, error, info)

class ToastController {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (document.getElementById('toast-container')) {
      this.container = document.getElementById('toast-container');
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    
    // Inline styling for layout stack
    Object.assign(this.container.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: '9999',
      maxWidth: '380px',
      pointerEvents: 'none'
    });
    
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    this.initContainer();

    const toast = document.createElement('div');
    toast.className = 'fade-in';
    
    // Styling bases
    Object.assign(toast.style, {
      padding: '12px 18px',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-tertiary)',
      border: '1px solid var(--border-color)',
      color: '#ffffff',
      fontSize: '0.9rem',
      fontWeight: '500',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      pointerEvents: 'auto',
      transform: 'translateY(20px)',
      opacity: '0',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    // Color and Icon bindings
    let borderTheme = 'var(--border-color)';
    let iconSvg = '';

    if (type === 'success') {
      borderTheme = 'var(--success)';
      iconSvg = `<svg class="icon" style="color: var(--success)" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      borderTheme = 'var(--error)';
      iconSvg = `<svg class="icon" style="color: var(--error)" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      borderTheme = 'var(--warning)';
      iconSvg = `<svg class="icon" style="color: var(--warning)" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      borderTheme = 'var(--accent-primary)';
      iconSvg = `<svg class="icon" style="color: var(--accent-primary)" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.style.borderLeft = `4px solid ${borderTheme}`;
    toast.innerHTML = `
      ${iconSvg}
      <span style="flex-grow: 1;">${message}</span>
      <button style="background:none; border:none; color: var(--text-muted); cursor:pointer; font-size: 1.1rem; line-height: 1;" onclick="this.parentElement.remove()">×</button>
    `;

    this.container.appendChild(toast);
    
    // Trigger transition Reflow
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);

    // Fade out and remove
    setTimeout(() => {
      toast.style.transform = 'translateY(-20px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
}

// Module-level singleton — one controller for the entire app lifetime
const _toastController = new ToastController();

export const showToast = (message, type = 'info', duration = 3000) => {
  _toastController.show(message, type, duration);
};
