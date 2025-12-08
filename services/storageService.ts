import { AppState } from '../types';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'ONYX_APP_DATA_V1';

export const loadState = (): AppState | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch (e) {
    console.error("Failed to load state", e);
    return null;
  }
};

export const saveState = async (state: AppState, userId?: string) => {
  // Always save to local storage as backup/cache
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save local state", e);
  }

  // If logged in, sync to cloud
  if (userId) {
    try {
      await setDoc(doc(db, 'users', userId), state);
    } catch (e) {
      console.error("Failed to sync to cloud", e);
    }
  }
};

export const subscribeToData = (userId: string, onUpdate: (data: AppState | null) => void) => {
  return onSnapshot(doc(db, 'users', userId), (docSnapshot) => {
    if (docSnapshot.exists()) {
      onUpdate(docSnapshot.data() as AppState);
    } else {
      // Document doesn't exist (New User) -> Send null so App can stop loading
      onUpdate(null);
    }
  }, (error) => {
    console.error("Firestore sync error:", error);
    // On error, also stop loading to prevent app freeze
    onUpdate(null);
  });
};

export const checkDailyReset = (state: AppState): AppState => {
  const today = new Date().toISOString().split('T')[0];
  if (state.lastLoginDate !== today) {
    // Reset daily tasks
    const updatedTasks = state.tasks.map(t => 
      t.type === 'daily' ? { ...t, completed: false } : t
    );
    return { ...state, tasks: updatedTasks, lastLoginDate: today };
  }
  return state;
};