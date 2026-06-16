// LocalStorage Database Service for Offline Fallback

const PROMPTS_KEY = 'ag_prompts_db';
const VERSIONS_KEY = 'ag_prompt_versions_db';
const TEMPLATES_KEY = 'ag_templates_db';

export const localStorageService = {
  // Prompts Collection
  getPrompts() {
    try {
      const data = localStorage.getItem(PROMPTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse saved prompts:', e);
      return [];
    }
  },

  savePrompt(prompt) {
    const prompts = this.getPrompts();
    const index = prompts.findIndex(p => p.id === prompt.id);
    
    let stored;
    if (index >= 0) {
      stored = { ...prompt, updatedAt: new Date().toISOString() };
      prompts[index] = stored;
    } else {
      stored = {
        ...prompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      prompts.push(stored);
    }
    
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
    // Return the stored copy (with timestamps) not the original argument
    return stored;
  },

  deletePrompt(promptId) {
    const prompts = this.getPrompts();
    const filtered = prompts.filter(p => p.id !== promptId);
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(filtered));
    
    // Also delete all versions associated
    const versions = this.getPromptVersions(promptId);
    const allVersions = this.getAllVersions();
    const filteredVersions = allVersions.filter(v => v.promptId !== promptId);
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(filteredVersions));
  },

  // Versions Collection
  getAllVersions() {
    try {
      const data = localStorage.getItem(VERSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse prompt versions:', e);
      return [];
    }
  },

  getPromptVersions(promptId) {
    const versions = this.getAllVersions();
    return versions
      .filter(v => v.promptId === promptId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  },

  savePromptVersion(version) {
    const versions = this.getAllVersions();
    versions.push({
      ...version,
      id: version.id || `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
    return version;
  },

  // Custom User Templates Collection
  getTemplates() {
    try {
      const data = localStorage.getItem(TEMPLATES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse templates:', e);
      return [];
    }
  },

  saveTemplate(template) {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push({
        ...template,
        id: template.id || `t-${Date.now()}`,
        createdAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    return template;
  },

  deleteTemplate(templateId) {
    const templates = this.getTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
  },

  // Database Seed for first-time onboarding
  seedMockData() {
    const prompts = this.getPrompts();
    if (prompts.length === 0) {
      const seedPrompts = [
        {
          id: 'sp-1',
          title: 'React Modal Component',
          rawPrompt: 'make a modal in react with overlay that closes on esc',
          optimizedPrompt: `Role: Senior Frontend Engineer / Accessibility Specialist
Task: Implement a highly accessible React Modal component with full keyboard control.

Requirements:
- Create a reusable React dialog modal component.
- Overlay backdrop should dim the page content.
- Clicking the backdrop OR pressing the 'Escape' key must dismiss the modal.
- Implement Focus Trapping: prevent tab navigation from escaping the active modal window.
- Restore focus to the initiating button upon modal closure.

HTML/DOM Structure:
- Use semantic <dialog> or appropriate ARIA roles (role="dialog", aria-modal="true").
- Provide clear visual focus indicators for interactive buttons.

Constraints:
- Pure CSS styling (no external CSS libraries).
- Modern React hooks (useState, useEffect, useRef).`,
          mode: 'New app build',
          modelTarget: 'Claude Spec style',
          constraints: ['no-libraries', 'mobile-first', 'analyze-first'],
          scoreBreakdown: {
            clarity: 90,
            specificity: 85,
            completeness: 90,
            ambiguity: 95,
            constraints: 80,
            outputControl: 85,
            efficiency: 75,
            readiness: 88,
            total: 87
          },
          explanation: [
            { category: 'Structure', detail: 'Added Role Framing and detailed Task definition' },
            { category: 'Accessibility', detail: 'Injected requirements for focus-trapping and ESC close' },
            { category: 'Constraints', detail: 'Injected css constraints and modern hooks guidelines' }
          ],
          tags: ['React', 'UI', 'Accessibility'],
          versionNumber: 1,
          createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
        },
        {
          id: 'sp-2',
          title: 'Firebase Auth Helper',
          rawPrompt: 'write a file to login users with firebase auth and save stats in firestore',
          optimizedPrompt: `Role: Senior Backend Cloud Engineer
Task: Create a robust authentication and profile initialization helper module using Firebase Auth v10+ and Cloud Firestore.

Implementation Plan:
1. Initialize firebase auth and firestore handles.
2. Export a 'signInWithGoogle' async function which executes Google OAuth redirects.
3. Export an 'onAuthStateChanged' listener wrapper.
4. On successful login, verify if user profile exists in Firestore collection 'users'.
5. If profile does not exist, initialize database document with uid, email, displayName, and createdAt.
6. If profile exists, increment 'loginCount' and update 'lastLoginAt'.

Constraints:
- Firebase JS Web SDK v10+ imports only (Modular style).
- Strictly catch all errors and return readable client-facing error objects.
- Do not expose firebase initialization keys inside this logic; read from config object.`,
          mode: 'Firebase integration',
          modelTarget: 'Gemini Style',
          constraints: ['firebase-only', 'no-rewrite-unrelated'],
          scoreBreakdown: {
            clarity: 95,
            specificity: 90,
            completeness: 95,
            ambiguity: 90,
            constraints: 90,
            outputControl: 85,
            efficiency: 80,
            readiness: 92,
            total: 91
          },
          explanation: [
            { category: 'SaaS Config', detail: 'Created precise Firestore user metrics schema update logic' },
            { category: 'SDK Version', detail: 'Forced Firebase Modular Web SDK v10+ format' },
            { category: 'Security', detail: 'Removed hardcoded API keys and set config injection bounds' }
          ],
          tags: ['Firebase', 'Auth', 'Firestore'],
          versionNumber: 2,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ];
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(seedPrompts));

      const seedVersions = [
        {
          id: 'sv-1',
          promptId: 'sp-2',
          versionNumber: 1,
          rawPrompt: 'write firebase login code',
          optimizedPrompt: `Role: Backend Developer
Task: Implement Firebase user authentication.

Instructions:
- Provide signIn and signOut functions.
- Use Firebase Web SDK.`,
          scoreBreakdown: {
            clarity: 60,
            specificity: 50,
            completeness: 55,
            ambiguity: 40,
            constraints: 30,
            outputControl: 45,
            efficiency: 60,
            readiness: 52,
            total: 51
          },
          explanation: [{ category: 'Structure', detail: 'Created basic signin/signout structure' }],
          createdAt: new Date(Date.now() - 3600000 * 24 - 1000).toISOString()
        },
        {
          id: 'sv-2',
          promptId: 'sp-2',
          versionNumber: 2,
          rawPrompt: 'write a file to login users with firebase auth and save stats in firestore',
          optimizedPrompt: `Role: Senior Backend Cloud Engineer\nTask: Create a robust authentication...`,
          scoreBreakdown: {
            clarity: 95,
            specificity: 90,
            completeness: 95,
            ambiguity: 90,
            constraints: 90,
            outputControl: 85,
            efficiency: 80,
            readiness: 92,
            total: 91
          },
          explanation: [{ category: 'SaaS Config', detail: 'Created precise Firestore user metrics schema update logic' }],
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ];
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(seedVersions));
    }
  }
};
