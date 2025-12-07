import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Calendar as CalIcon, 
  CheckSquare, 
  Zap, 
  Target, 
  MessageSquare,
  Menu,
  X,
  Layers,
  ArrowRight,
  Activity,
  Plus,
  Bell,
  Notebook,
  Clock,
  Check
} from 'lucide-react';
import { loadState, saveState, checkDailyReset } from './services/storageService';
import { INITIAL_TASKS, INITIAL_AREAS, INITIAL_EVENTS, INITIAL_MILESTONES, INITIAL_OBJECTIVES, INITIAL_NOTES } from './constants';
import { AppState, Task, Milestone, CalendarEvent, Objective, Note, LifeArea } from './types';

// Components
import { CalendarSection } from './components/CalendarSection';
import { DailyChecklist } from './components/DailyChecklist';
import { TaskForce } from './components/TaskForce';
import { OperationsBoard } from './components/OperationsBoard';
import { LifeAreas } from './components/LifeAreas';
import { AIAssistant } from './components/AIAssistant';
import { Reminders } from './components/Reminders';
import { Notes } from './components/Notes';
import { Card, ProgressBar } from './components/UIComponents';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState(() => {
    // Persist active tab selection
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('ONYX_ACTIVE_TAB') || 'dashboard';
    }
    return 'dashboard';
  });
  const [showAI, setShowAI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [appState, setAppState] = useState<AppState>({
    tasks: INITIAL_TASKS,
    areas: INITIAL_AREAS,
    events: INITIAL_EVENTS,
    milestones: INITIAL_MILESTONES,
    objectives: INITIAL_OBJECTIVES,
    notes: INITIAL_NOTES,
    lastLoginDate: new Date().toISOString().split('T')[0]
  });

  // --- Effects ---
  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setAppState(checkDailyReset(loaded));
    }
    
    // Request notification permission on load
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    saveState(appState);
  }, [appState]);

  useEffect(() => {
    localStorage.setItem('ONYX_ACTIVE_TAB', activeTab);
  }, [activeTab]);

  // Check for Reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const today = now.toISOString().split('T')[0];

      appState.tasks.forEach(task => {
        if (task.type === 'reminder' && !task.completed && task.dueTime === currentTime && task.dueDate === today) {
          // Trigger notification
          if (Notification.permission === "granted") {
            new Notification("Onyx Reminder", { body: task.title });
          } else {
            // Fallback alert
            alert(`Reminder: ${task.title}`);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [appState.tasks]);

  // --- Handlers ---
  const toggleTask = (id: string) => {
    setAppState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setAppState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
          };
        }
        return t;
      })
    }));
  };

  const addTask = (task: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: task.title || 'New Task',
      completed: false,
      type: task.type || 'short_term',
      priority: task.priority,
      tags: task.tags || [],
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      createdAt: Date.now(),
      subtasks: task.subtasks,
      ...task
    };
    setAppState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setAppState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setAppState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const addEvent = (event: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
       id: `e-${Date.now()}`,
       title: event.title || 'New Event',
       date: event.date || new Date().toISOString().split('T')[0],
       ...event
    };
    setAppState(prev => ({ ...prev, events: [...prev.events, newEvent] }));
  };

  const addObjective = (objective: Partial<Objective>) => {
     if (!objective.areaId || !objective.title) return;
     const newObj: Objective = {
        id: `obj-${Date.now()}`,
        title: objective.title,
        completed: false,
        areaId: objective.areaId,
        ...objective
     };
     setAppState(prev => ({ ...prev, objectives: [...(prev.objectives || []), newObj]}));
  };

  const deleteObjective = (id: string) => {
     setAppState(prev => ({ ...prev, objectives: prev.objectives?.filter(o => o.id !== id) || [] }));
  };

  const addMilestone = (milestone: Partial<Milestone>) => {
    if (!milestone.objectiveId || !milestone.title) return;
    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      title: milestone.title,
      completed: false,
      objectiveId: milestone.objectiveId,
      ...milestone
    };
    setAppState(prev => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
  };

  const toggleMilestone = (id: string) => {
    setAppState(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m)
    }));
  };

  const deleteMilestone = (id: string) => {
    setAppState(prev => ({ ...prev, milestones: prev.milestones.filter(m => m.id !== id) }));
  };

  // Note Handlers
  const addNote = (note: Partial<Note>) => {
    const newNote: Note = {
      id: `n-${Date.now()}`,
      title: note.title || 'Untitled',
      content: note.content || '',
      createdAt: Date.now(),
      ...note
    };
    setAppState(prev => ({...prev, notes: [...(prev.notes || []), newNote]}));
  };
  
  const deleteNote = (id: string) => {
    setAppState(prev => ({...prev, notes: prev.notes?.filter(n => n.id !== id)}));
  };

  const updateNote = (id: string, content: string) => {
    setAppState(prev => ({
      ...prev,
      notes: prev.notes?.map(n => n.id === id ? {...n, content} : n)
    }));
  };

  // Area Handlers
  const addArea = (area: Partial<LifeArea>) => {
      const newArea: LifeArea = {
          id: `area-${Date.now()}`,
          name: area.name || 'New Area',
          icon: area.icon || 'Layers',
          color: area.color || '#ffffff',
          ...area
      };
      setAppState(prev => ({...prev, areas: [...prev.areas, newArea]}));
  };

  const updateArea = (id: string, updated: Partial<LifeArea>) => {
      setAppState(prev => ({
          ...prev,
          areas: prev.areas.map(a => a.id === id ? {...a, ...updated} : a)
      }));
  };

  const deleteArea = (id: string) => {
      setAppState(prev => ({
          ...prev,
          areas: prev.areas.filter(a => a.id !== id),
          // Clean up related tasks/objectives if needed, for now just keeping it simple
          tasks: prev.tasks.filter(t => t.areaId !== id),
          objectives: prev.objectives.filter(o => o.areaId !== id)
      }));
  };


  // --- Render Helpers ---

  const DashboardHome = () => {
    const [quickRemind, setQuickRemind] = useState('');
    const [quickRemindTime, setQuickRemindTime] = useState('');

    const handleQuickRemind = (e: React.FormEvent) => {
      e.preventDefault();
      if (!quickRemind.trim()) return;
      addTask({
        title: quickRemind,
        type: 'reminder', 
        tags: [],
        priority: 'Medium',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: quickRemindTime || undefined
      });
      setQuickRemind('');
      setQuickRemindTime('');
    };

    // Filters: Exclude 'reminder' and 'calendar_only' from main lists
    // Safety check with optional chaining for tags
    const highPriority = appState.tasks.filter(t => t.type === 'short_term' && !t.completed && t.priority === 'High' && !t.tags?.includes('calendar_only'));
    const taskForceTasks = appState.tasks.filter(t => t.type === 'short_term' && !t.completed && !t.tags?.includes('calendar_only'));
    const operations = appState.tasks.filter(t => t.type === 'long_term' && !t.completed);
    
    // Daily Stats
    const dailyTasks = appState.tasks.filter(t => t.type === 'daily');
    const completedDaily = dailyTasks.filter(t => t.completed).length;
    const dailyProgress = dailyTasks.length > 0 ? (completedDaily / dailyTasks.length) * 100 : 0;
    
    // Area Stats Calculation for Widget
    const areaStats = appState.areas.map(area => {
        const areaTasks = appState.tasks.filter(t => t.areaId === area.id);
        const areaObjectives = appState.objectives.filter(o => o.areaId === area.id);
        const areaMilestones = appState.milestones.filter(m => areaObjectives.some(obj => obj.id === m.objectiveId));
        
        const total = areaTasks.length + areaMilestones.length;
        const done = areaTasks.filter(t => t.completed).length + areaMilestones.filter(m => m.completed).length;
        return { 
            ...area, 
            percentage: total === 0 ? 0 : Math.round((done / total) * 100) 
        };
    });

    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        {/* Welcome & Quick Reminder */}
        <div className="flex flex-col gap-6">
           <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
                <div className="text-neutral-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
           </div>

           {/* Quick Reminder Window */}
           <Card className="p-4 bg-onyx-900 border-onyx-800">
              <form onSubmit={handleQuickRemind} className="flex gap-4 items-center">
                 <input 
                   className="flex-1 bg-transparent border-b border-onyx-700 pb-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                   placeholder="Quick reminder: Take medicine at 5pm..."
                   value={quickRemind}
                   onChange={e => setQuickRemind(e.target.value)}
                 />
                 <div className="flex items-center gap-1 border-b border-onyx-700 pb-2">
                    <Clock size={16} className="text-neutral-500" />
                    <input 
                      type="time"
                      className="bg-transparent text-sm text-neutral-300 focus:text-white focus:outline-none"
                      value={quickRemindTime}
                      onChange={e => setQuickRemindTime(e.target.value)}
                    />
                 </div>
                 <button type="submit" className="text-neutral-400 hover:text-white transition-colors">
                   <Plus size={24} />
                 </button>
              </form>
           </Card>
        </div>

        {/* 1. Task Force Summary */}
        <section>
          <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('taskforce')}>
             <div className="flex items-center gap-2 text-neutral-300 font-medium">
                <Activity size={18} /> Task Force
             </div>
             <ArrowRight size={16} className="text-neutral-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {taskForceTasks.slice(0, 4).map(task => (
               <div key={task.id} className="bg-onyx-900 border border-onyx-800 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-neutral-300 text-sm truncate">{task.title}</span>
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
               </div>
             ))}
             {taskForceTasks.length === 0 && <div className="text-neutral-600 text-sm italic">Task force standing by.</div>}
          </div>
        </section>

        {/* 2. Operations Summary */}
        <section>
           <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('operations')}>
             <div className="flex items-center gap-2 text-neutral-300 font-medium">
                <Target size={18} /> Operations
             </div>
             <ArrowRight size={16} className="text-neutral-600" />
          </div>
          {operations.length > 0 ? (
             <div className="space-y-3">
               {operations.slice(0, 3).map(op => (
                 <div key={op.id} className="bg-onyx-900 border border-onyx-800 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                       <h4 className="text-white">{op.title}</h4>
                       <span className="text-xs text-neutral-500 uppercase">{op.priority}</span>
                    </div>
                    <ProgressBar progress={Math.random() * 40 + 10} className="h-1 bg-onyx-950" /> 
                 </div>
               ))}
             </div>
          ) : (
             <div className="text-neutral-600 text-sm italic">No active operations.</div>
          )}
        </section>

        {/* 3. High Priority Tasks - Clean List UI */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-red-400 font-medium">
             <Zap size={18} /> High Priority
          </div>
          {highPriority.length > 0 ? (
            <div className="flex flex-col gap-3">
               {highPriority.map(task => (
                 <div key={task.id} className="group flex items-center justify-between p-4 rounded-xl bg-onyx-900 border border-red-900/20 hover:border-red-500/40 transition-all shadow-sm">
                    <div className="flex items-center gap-4 overflow-hidden">
                       <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] shrink-0"></div>
                       <span className="text-white font-medium text-base truncate">{task.title}</span>
                    </div>
                    <button 
                        onClick={() => toggleTask(task.id)}
                        className="w-7 h-7 rounded-full border-2 border-onyx-700 hover:border-red-500 hover:bg-red-500 text-white flex items-center justify-center transition-all shrink-0"
                        title="Mark Complete"
                    >
                        <Check size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                 </div>
               ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-onyx-800 rounded-xl text-neutral-600 text-sm">
               No high priority tasks.
            </div>
          )}
        </section>

        {/* 4. Calendar View */}
        <section>
           <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('calendar')}>
             <div className="flex items-center gap-2 text-neutral-300 font-medium">
                <CalIcon size={18} /> Calendar
             </div>
             <ArrowRight size={16} className="text-neutral-600" />
          </div>
          <div className="bg-onyx-900 rounded-xl border border-onyx-800">
             <CalendarSection events={appState.events} tasks={appState.tasks} onAddEvent={addEvent} onAddTask={addTask} />
          </div>
        </section>

        {/* 5. Daily Rituals */}
        <section>
           <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('rituals')}>
             <div className="flex items-center gap-2 text-neutral-300 font-medium">
                <CheckSquare size={18} /> Daily Rituals
             </div>
             <span className="text-neutral-500 text-xs">{Math.round(dailyProgress)}% Complete</span>
          </div>
          <ProgressBar progress={dailyProgress} className="mb-4 h-2" />
        </section>

        {/* 6. Life Areas (with percentages) */}
        <section>
           <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('areas')}>
             <div className="flex items-center gap-2 text-neutral-300 font-medium">
                <Layers size={18} /> Life Areas
             </div>
             <ArrowRight size={16} className="text-neutral-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {areaStats.map(area => (
                <div key={area.id} className="bg-onyx-900 border border-onyx-800 p-4 rounded-lg text-center opacity-80 hover:opacity-100 transition-opacity">
                   <div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ backgroundColor: area.color }}></div>
                   <span className="text-sm font-bold text-neutral-200 block mb-1">{area.name}</span>
                   <span className="text-xs font-medium text-neutral-400">{area.percentage}%</span>
                </div>
             ))}
          </div>
        </section>

      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardHome />;
      case 'taskforce':
        return (
          <TaskForce 
            tasks={appState.tasks.filter(t => t.type === 'short_term' && !t.tags?.includes('calendar_only'))} 
            onToggle={toggleTask} 
            onAdd={addTask} 
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
          />
        );
      case 'operations':
        return (
           <OperationsBoard 
             tasks={appState.tasks.filter(t => t.type === 'long_term')} 
             onToggle={toggleTask} 
             onAdd={addTask} 
             onToggleSubtask={toggleSubtask}
             onDelete={deleteTask}
             onUpdate={updateTask}
           />
        );
      case 'calendar':
        return (
           <div className="h-full max-w-4xl mx-auto">
             <CalendarSection events={appState.events} tasks={appState.tasks} onAddEvent={addEvent} onAddTask={addTask} />
           </div>
        );
      case 'reminders':
        return (
           <Reminders 
             reminders={appState.tasks.filter(t => t.type === 'reminder')} 
             onToggle={toggleTask} 
             onAdd={addTask} 
             onDelete={deleteTask}
           />
        );
      case 'rituals':
        return (
          <div className="h-full max-w-2xl mx-auto py-4">
             <DailyChecklist tasks={appState.tasks.filter(t => t.type === 'daily')} onToggle={toggleTask} onAdd={(title) => addTask({ title, type: 'daily' })} />
          </div>
        );
      case 'areas':
        return (
          <LifeAreas 
            areas={appState.areas} 
            tasks={appState.tasks} 
            objectives={appState.objectives || []}
            milestones={appState.milestones || []}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onAddObjective={addObjective}
            onDeleteObjective={deleteObjective}
            onAddMilestone={addMilestone}
            onToggleMilestone={toggleMilestone}
            onDeleteMilestone={deleteMilestone}
            onAddArea={addArea}
            onUpdateArea={updateArea}
            onDeleteArea={deleteArea}
          />
        );
      case 'notes':
        return (
            <Notes 
                notes={appState.notes || []}
                onAdd={addNote}
                onDelete={deleteNote}
                onUpdate={updateNote}
            />
        );
      default:
        return null;
    }
  };

  const NavItem = ({ id, icon: Icon, label, badgeCount }: { id: string; icon: any; label: string; badgeCount?: number }) => (
    <button
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all group
        ${activeTab === id ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white hover:bg-onyx-800'}
      `}
    >
      <Icon size={20} />
      <span className="flex-1 text-left">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
         <span className={`text-[10px] font-bold px-1.5 rounded-full ${activeTab === id ? 'bg-black text-white' : 'bg-neutral-800 text-white'}`}>
            {badgeCount}
         </span>
      )}
    </button>
  );

  const reminderCount = appState.tasks.filter(t => t.type === 'reminder' && !t.completed).length;
  // Safer filtering
  const taskForceCount = appState.tasks.filter(t => t.type === 'short_term' && !t.completed && !t.tags?.includes('calendar_only')).length;
  const operationsCount = appState.tasks.filter(t => t.type === 'long_term' && !t.completed).length;

  return (
    <div className="min-h-screen bg-onyx-950 text-neutral-200 font-sans flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-onyx-800 bg-onyx-900/30 p-4">
        <div className="mb-8 px-4 py-2">
          <h1 className="text-2xl font-bold tracking-tighter text-white">ONYX.</h1>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem id="dashboard" icon={Layout} label="Dashboard" />
          <div className="my-4 border-t border-onyx-800 mx-4"></div>
          <NavItem id="taskforce" icon={Activity} label="Task Force" badgeCount={taskForceCount} />
          <NavItem id="operations" icon={Target} label="Operations" badgeCount={operationsCount} />
          <NavItem id="calendar" icon={CalIcon} label="Calendar" />
          <NavItem id="reminders" icon={Bell} label="Reminders" badgeCount={reminderCount} />
          <NavItem id="rituals" icon={CheckSquare} label="Daily Rituals" />
          <NavItem id="areas" icon={Layers} label="Life Areas" />
          <NavItem id="notes" icon={Notebook} label="Notes" />
        </nav>

        <button 
          onClick={() => setShowAI(true)}
          className="mt-auto bg-onyx-800 border border-onyx-700 p-4 rounded-xl flex items-center gap-3 hover:border-white transition-colors group"
        >
          <div className="bg-white text-black p-2 rounded-lg group-hover:scale-110 transition-transform">
            <MessageSquare size={18} />
          </div>
          <div className="text-left">
            <div className="text-xs text-neutral-500 uppercase">Assistant</div>
            <div className="text-sm font-medium text-white">Ask Onyx AI</div>
          </div>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-onyx-800 bg-onyx-950 z-20">
          <h1 className="text-xl font-bold text-white">ONYX.</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowAI(!showAI)} className="p-2 text-white">
              <MessageSquare size={24} />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-onyx-950 z-30 pt-20 px-4 space-y-2">
            <NavItem id="dashboard" icon={Layout} label="Dashboard" />
            <div className="border-t border-onyx-800 my-2"></div>
            <NavItem id="taskforce" icon={Activity} label="Task Force" badgeCount={taskForceCount} />
            <NavItem id="operations" icon={Target} label="Operations" badgeCount={operationsCount} />
            <NavItem id="calendar" icon={CalIcon} label="Calendar" />
            <NavItem id="reminders" icon={Bell} label="Reminders" badgeCount={reminderCount} />
            <NavItem id="rituals" icon={CheckSquare} label="Daily Rituals" />
            <NavItem id="areas" icon={Layers} label="Life Areas" />
            <NavItem id="notes" icon={Notebook} label="Notes" />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
          {renderContent()}
        </div>

        {/* AI Overlay (Desktop Slide-over / Mobile Fullscreen) */}
        {showAI && (
          <div className="absolute inset-y-0 right-0 w-full md:w-[400px] bg-onyx-950 border-l border-onyx-800 shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right duration-300">
            <AIAssistant appState={appState} onClose={() => setShowAI(false)} isMobile={false} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;