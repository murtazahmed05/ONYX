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

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_OBJECTIVES: Objective[] = [];

export const INITIAL_MILESTONES: Milestone[] = [];

export const INITIAL_EVENTS: CalendarEvent[] = [];

export const INITIAL_NOTES: Note[] = [];

// Helper map for dynamic icon rendering
export const ICON_MAP: Record<string, any> = {
  Briefcase, Heart, BookOpen, Dumbbell, Zap, Layout, Calendar, CheckSquare, Target, Layers, MessageSquare, Trophy, ArrowLeft, MoreHorizontal, Activity, Clock, List, Command, Bell, ChevronLeft, ChevronRight, Flag, Notebook, Trash2, Edit2, Plus
};