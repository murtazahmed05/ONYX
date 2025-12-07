import { LifeArea, Task, CalendarEvent, Milestone, Objective, Note } from './types';
import { 
  Briefcase, 
  Heart, 
  BookOpen, 
  Dumbbell, 
  Zap, 
  Layout, 
  Calendar, 
  CheckSquare, 
  Target, 
  Layers, 
  MessageSquare,
  Trophy,
  ArrowLeft,
  MoreHorizontal,
  Activity,
  Clock,
  List,
  Command,
  Bell,
  ChevronLeft,
  ChevronRight,
  Flag,
  Notebook,
  Trash2,
  Edit2,
  Plus
} from 'lucide-react';

export const INITIAL_AREAS: LifeArea[] = [
  { id: 'area-1', name: 'Career', icon: 'Briefcase', color: '#3b82f6' },
  { id: 'area-2', name: 'Health', icon: 'Dumbbell', color: '#10b981' },
  { id: 'area-3', name: 'Learning', icon: 'BookOpen', color: '#f59e0b' },
  { id: 'area-4', name: 'Relationships', icon: 'Heart', color: '#ec4899' },
];

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Morning Meditation', completed: false, type: 'daily', tags: ['mindfulness'], createdAt: Date.now() },
  { id: 't2', title: 'Read 10 pages', completed: false, type: 'daily', tags: ['learning'], createdAt: Date.now() },
  { id: 't3', title: 'Fix homepage CSS bug', completed: false, type: 'short_term', priority: 'High', tags: ['dev'], createdAt: Date.now(), subtasks: [{id: 'st1', title: 'Check mobile view', completed: false}] },
  { id: 't4', title: 'Draft Q3 Strategy', completed: false, type: 'long_term', priority: 'High', tags: ['work'], dueDate: '2024-12-31', createdAt: Date.now() },
];

export const INITIAL_OBJECTIVES: Objective[] = [
  { id: 'obj-1', title: 'Earn 10K MRR by 2026', areaId: 'area-1', completed: false },
];

export const INITIAL_MILESTONES: Milestone[] = [
  { id: 'm1', title: 'Hit 2K MRR', completed: true, objectiveId: 'obj-1' },
  { id: 'm2', title: 'Hit 5K MRR', completed: false, objectiveId: 'obj-1' },
  { id: 'm3', title: 'Hit 8K MRR', completed: false, objectiveId: 'obj-1' },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Team Sync', date: new Date().toISOString().split('T')[0], time: '10:00' },
];

export const INITIAL_NOTES: Note[] = [
  { id: 'n1', title: 'App Ideas', content: '1. Dark mode default\n2. Voice commands', createdAt: Date.now() }
];

// Helper map for dynamic icon rendering
export const ICON_MAP: Record<string, any> = {
  Briefcase, Heart, BookOpen, Dumbbell, Zap, Layout, Calendar, CheckSquare, Target, Layers, MessageSquare, Trophy, ArrowLeft, MoreHorizontal, Activity, Clock, List, Command, Bell, ChevronLeft, ChevronRight, Flag, Notebook, Trash2, Edit2, Plus
};