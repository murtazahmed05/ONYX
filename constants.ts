
import { LifeArea, Task, Milestone, Objective, Note } from './types';
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

// START EMPTY as requested
export const INITIAL_AREAS: LifeArea[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_OBJECTIVES: Objective[] = [];

export const INITIAL_MILESTONES: Milestone[] = [];

export const INITIAL_NOTES: Note[] = [];

// Helper map for dynamic icon rendering
export const ICON_MAP: Record<string, any> = {
  Briefcase, Heart, BookOpen, Dumbbell, Zap, Layout, Calendar, CheckSquare, Target, Layers, MessageSquare, Trophy, ArrowLeft, MoreHorizontal, Activity, Clock, List, Command, Bell, ChevronLeft, ChevronRight, Flag, Notebook, Trash2, Edit2, Plus
};
