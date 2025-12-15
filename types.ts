

export type Priority = 'High' | 'Medium' | 'Low';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: 'daily' | 'short_term' | 'long_term' | 'life_area' | 'reminder';
  priority?: Priority;
  tags: string[];
  dueDate?: string; // ISO Date string
  dueTime?: string; // HH:mm string
  areaId?: string;
  createdAt: number;
  subtasks?: SubTask[];
}

export interface Objective {
  id: string;
  title: string;
  areaId: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  objectiveId: string; // Linked to Objective, not directly to Area anymore
}

export interface LifeArea {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // hex or tailwind class
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Added missing CalendarEvent interface to fix compilation error in CalendarSection.tsx
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

export interface AppState {
  tasks: Task[];
  areas: LifeArea[];
  objectives: Objective[];
  milestones: Milestone[];
  notes: Note[];
  lastLoginDate: string;
  // Support for calendar events in state
  events?: CalendarEvent[];
}