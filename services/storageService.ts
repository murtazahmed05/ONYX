import { AppState } from '../types';

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

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // In a real app, this is where we would trigger cloud sync
    // syncToCloud(state); 
  } catch (e) {
    console.error("Failed to save state", e);
  }
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
