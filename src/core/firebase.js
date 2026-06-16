// Firebase Auth & Cloud Firestore Services with Offline LocalStorage Fallback

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { stateStore } from './state.js';
import { localStorageService } from './storage.js';

let app = null;
let auth = null;
let db = null;

// Initialize Firebase dynamically based on custom configuration or default options
export function initFirebase(config) {
  if (!config) {
    console.warn('Firebase config missing. Operating in offline LocalStorage mode.');
    return false;
  }
  
  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase services initialized successfully.');
    
    // Set up auth state listener
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User logged in
        const userObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || ''
        };
        stateStore.setUser(userObj);
        
        // Sync prompts and templates from Firestore
        await syncDataFromCloud(firebaseUser.uid);
      } else {
        // User logged out
        stateStore.setUser(null);
        // Load local storage prompts
        stateStore.setPrompts(localStorageService.getPrompts());
      }
    });
    
    return true;
  } catch (e) {
    console.error('Firebase initialization failed:', e);
    return false;
  }
}

// Sync helper on login
async function syncDataFromCloud(userId) {
  try {
    const cloudPrompts = await firebaseService.getCloudPrompts(userId);
    // Merge local storage prompts with cloud prompts if any local-only exist
    const localPrompts = localStorageService.getPrompts();
    
    if (cloudPrompts.length === 0 && localPrompts.length > 0) {
      // Seed cloud with local data
      console.log('Syncing local prompts to Firestore...');
      for (const p of localPrompts) {
        await firebaseService.saveCloudPrompt(userId, p);
      }
      stateStore.setPrompts(localPrompts);
    } else {
      stateStore.setPrompts(cloudPrompts);
    }
  } catch (e) {
    console.error('Error syncing cloud data:', e);
  }
}

export const firebaseService = {
  isInitialized() {
    return !!app && !!auth && !!db;
  },

  // AUTH API
  async signUp(email, password) {
    if (!this.isInitialized()) {
      throw new Error('Firebase is not configured. Go to Settings to connect a Firebase project.');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  async signIn(email, password) {
    if (!this.isInitialized()) {
      throw new Error('Firebase is not configured. Go to Settings to connect a Firebase project.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  async signOut() {
    if (!this.isInitialized()) {
      stateStore.setUser(null);
      stateStore.setPrompts(localStorageService.getPrompts());
      return;
    }
    await signOut(auth);
  },

  // FIRESTORE / LOCALSTORAGE INTERACTIVE BRIDGE

  // Get prompts
  async getPrompts() {
    const user = stateStore.getState().user;
    if (this.isInitialized() && user) {
      return await this.getCloudPrompts(user.uid);
    } else {
      return localStorageService.getPrompts();
    }
  },

  async getCloudPrompts(userId) {
    try {
      const q = query(
        collection(db, 'prompts'), 
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (e) {
      console.error('Failed to get prompts from Cloud Firestore:', e);
      return localStorageService.getPrompts(); // Fallback to local
    }
  },

  // Save prompt (creates version if rawPrompt is updated)
  async savePrompt(promptData) {
    const user = stateStore.getState().user;
    const isCloud = this.isInitialized() && user;
    
    // Read current prompt to see if we should create a version
    const prompts = isCloud ? await this.getCloudPrompts(user.uid) : localStorageService.getPrompts();
    const existing = prompts.find(p => p.id === promptData.id);
    
    let versionCreated = false;
    let newVersionNumber = promptData.versionNumber || 1;
    
    if (existing && existing.rawPrompt !== promptData.rawPrompt) {
      // Prompt changed! Save old version first
      newVersionNumber = (existing.versionNumber || 1) + 1;
      const newVersion = {
        promptId: existing.id,
        versionNumber: existing.versionNumber || 1,
        rawPrompt: existing.rawPrompt,
        optimizedPrompt: existing.optimizedPrompt,
        scoreBreakdown: existing.scoreBreakdown,
        explanation: existing.explanation,
        createdAt: existing.updatedAt || existing.createdAt || new Date().toISOString()
      };
      
      if (isCloud) {
        await this.saveCloudVersion(newVersion);
      } else {
        localStorageService.savePromptVersion(newVersion);
      }
      versionCreated = true;
    }

    const updatedPrompt = {
      ...promptData,
      versionNumber: newVersionNumber,
      updatedAt: new Date().toISOString()
    };
    if (!existing) {
      updatedPrompt.createdAt = new Date().toISOString();
    }

    if (isCloud) {
      updatedPrompt.userId = user.uid;
      await this.saveCloudPrompt(user.uid, updatedPrompt);
      stateStore.updatePromptInState(updatedPrompt);
    } else {
      const saved = localStorageService.savePrompt(updatedPrompt);
      stateStore.updatePromptInState(saved);
    }

    return { prompt: updatedPrompt, versionCreated };
  },

  async saveCloudPrompt(userId, prompt) {
    const promptDocRef = doc(db, 'prompts', prompt.id);
    await setDoc(promptDocRef, {
      ...prompt,
      userId
    });
  },

  // Delete prompt
  async deletePrompt(promptId) {
    const user = stateStore.getState().user;
    if (this.isInitialized() && user) {
      try {
        await deleteDoc(doc(db, 'prompts', promptId));
        // Delete all associated versions in parallel, properly awaited
        const q = query(collection(db, 'promptVersions'), where('promptId', '==', promptId));
        const snapshots = await getDocs(q);
        await Promise.all(snapshots.docs.map(docSnap => deleteDoc(doc(db, 'promptVersions', docSnap.id))));
      } catch (e) {
        console.error('Cloud delete failed:', e);
      }
    } else {
      // Only wipe local storage when operating in offline mode
      localStorageService.deletePrompt(promptId);
    }
    stateStore.deletePromptFromState(promptId);
  },

  // Get versions
  async getPromptVersions(promptId) {
    const user = stateStore.getState().user;
    if (this.isInitialized() && user) {
      try {
        const q = query(
          collection(db, 'promptVersions'),
          where('promptId', '==', promptId)
        );
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        return list.sort((a, b) => b.versionNumber - a.versionNumber);
      } catch (e) {
        console.error('Failed to get versions from Firestore:', e);
        return localStorageService.getPromptVersions(promptId);
      }
    } else {
      return localStorageService.getPromptVersions(promptId);
    }
  },

  async saveCloudVersion(version) {
    const id = `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await setDoc(doc(db, 'promptVersions', id), {
      ...version,
      id,
      createdAt: new Date().toISOString()
    });
  },

  // Templates CRUD
  async getTemplates() {
    const user = stateStore.getState().user;
    if (this.isInitialized() && user) {
      try {
        const q = query(collection(db, 'templates'), where('userId', 'in', [user.uid, 'system']));
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        return list;
      } catch (e) {
        console.error('Cloud templates read failed:', e);
        return localStorageService.getTemplates();
      }
    } else {
      return localStorageService.getTemplates();
    }
  },

  async saveTemplate(template) {
    const user = stateStore.getState().user;
    if (this.isInitialized() && user) {
      const id = template.id || `t-${Date.now()}`;
      const updated = { ...template, id, userId: user.uid };
      await setDoc(doc(db, 'templates', id), updated);
      return updated;
    } else {
      return localStorageService.saveTemplate(template);
    }
  },

  async deleteTemplate(templateId) {
    const user = stateStore.getState().user;
    if (this.isInitialized() && user) {
      await deleteDoc(doc(db, 'templates', templateId));
    } else {
      localStorageService.deleteTemplate(templateId);
    }
  }
};
