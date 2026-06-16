// Global Reactive State Store (Pub/Sub Pattern)

class GlobalState {
  constructor() {
    this.state = {
      currentView: 'landing', // landing, auth, dashboard, optimizer, templates, saved, settings, compare
      user: null,
      prompts: [],
      templates: [],
      activePrompt: null, // Prompt currently loaded in optimizer
      settings: {
        useAI: false,
        apiKey: '',
        theme: 'dark',
        firebaseConfig: null // User's custom Firebase config if they want cloud syncing
      },
      stats: {
        totalPrompts: 0,
        totalTemplatesUsed: 0,
        avgScore: 0,
        mostUsedPreset: 'Gemini Style'
      },
      selectedComparePrompts: [] // ids of prompts to compare
    };
    
    this.listeners = {};
    
    // Load local settings on init
    this.loadSettings();
  }

  // Subscribe to changes on specific state paths
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  // Publish changes to subscribers
  publish(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in state subscriber for ${event}:`, e);
        }
      });
    }
  }

  // Get current state (deep clone where appropriate to avoid direct mutations)
  getState() {
    return this.state;
  }

  // Update specific state nodes
  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.publish('stateChanged', this.state);
  }

  // View Routing
  setView(view, extraData = {}) {
    this.updateState({ 
      currentView: view,
      ...extraData
    });
    this.publish('viewChanged', view);
  }

  // User Auth
  setUser(user) {
    this.updateState({ user });
    this.publish('userChanged', user);
    if (user) {
      this.setView('dashboard');
    }
  }

  // Saved Prompts List Management
  setPrompts(prompts) {
    // Sort prompts by updatedAt desc
    const sorted = [...prompts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    this.updateState({ prompts: sorted });
    this.calculateStats();
    this.publish('promptsChanged', sorted);
  }

  addPrompt(prompt) {
    const updated = [prompt, ...this.state.prompts];
    this.setPrompts(updated);
  }

  updatePromptInState(updatedPrompt) {
    const updated = this.state.prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p);
    this.setPrompts(updated);
    if (this.state.activePrompt && this.state.activePrompt.id === updatedPrompt.id) {
      this.updateState({ activePrompt: updatedPrompt });
    }
  }

  deletePromptFromState(promptId) {
    const updated = this.state.prompts.filter(p => p.id !== promptId);
    this.setPrompts(updated);
    if (this.state.activePrompt && this.state.activePrompt.id === promptId) {
      this.updateState({ activePrompt: null });
    }
  }

  // Active Prompt in Editor
  setActivePrompt(prompt) {
    this.updateState({ activePrompt: prompt });
    this.publish('activePromptChanged', prompt);
  }

  // Template Library Management
  setTemplates(templates) {
    this.updateState({ templates });
    this.publish('templatesChanged', templates);
  }

  // User Custom Settings
  updateSettings(settingsUpdates) {
    const settings = { ...this.state.settings, ...settingsUpdates };
    this.updateState({ settings });
    this.saveSettings();
    this.publish('settingsChanged', settings);
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem('ag_prompt_optimizer_settings');
      if (stored) {
        this.state.settings = { ...this.state.settings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading settings from local storage:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('ag_prompt_optimizer_settings', JSON.stringify(this.state.settings));
    } catch (e) {
      console.error('Error saving settings to local storage:', e);
    }
  }

  // Statistical Engine Dashboard Calcs
  calculateStats() {
    const prompts = this.state.prompts;
    if (prompts.length === 0) {
      this.updateState({
        stats: {
          totalPrompts: 0,
          totalTemplatesUsed: 0,
          avgScore: 0,
          mostUsedPreset: 'Gemini Style'
        }
      });
      return;
    }

    const totalPrompts = prompts.length;
    
    // Average Quality Score
    const totalScore = prompts.reduce((sum, p) => {
      const score = p.scoreBreakdown ? p.scoreBreakdown.total || 0 : 0;
      return sum + score;
    }, 0);
    const avgScore = Math.round(totalScore / totalPrompts);

    // Count Presets usage
    const presetsCount = {};
    let templatesCount = 0;
    prompts.forEach(p => {
      if (p.modelTarget) {
        presetsCount[p.modelTarget] = (presetsCount[p.modelTarget] || 0) + 1;
      }
      if (p.mode && p.mode !== 'direct') {
        templatesCount++;
      }
    });

    // Most used preset
    let mostUsedPreset = 'Gemini Style';
    let maxCount = 0;
    for (const preset in presetsCount) {
      if (presetsCount[preset] > maxCount) {
        maxCount = presetsCount[preset];
        mostUsedPreset = preset;
      }
    }

    this.updateState({
      stats: {
        totalPrompts,
        totalTemplatesUsed: templatesCount,
        avgScore,
        mostUsedPreset
      }
    });
  }
}

export const stateStore = new GlobalState();
