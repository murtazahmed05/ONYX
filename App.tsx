
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
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
  Notebook,
  Check,
  LogOut,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { loadState, saveState, checkDailyReset, subscribeToData } from './services/storageService';
import { INITIAL_TASKS, INITIAL_AREAS, INITIAL_MILESTONES, INITIAL_OBJECTIVES, INITIAL_NOTES } from './constants';
import { AppState, Task, Milestone, Objective, Note, LifeArea } from './types';

// Components
import { Auth } from './components/Auth';
import { DailyChecklist } from './components/DailyChecklist';
import { TaskForce } from './components/TaskForce';
import { OperationsBoard } from './components/OperationsBoard';
import { LifeAreas } from './components/LifeAreas';
import { AIAssistant } from './components/AIAssistant';
import { Notes } from './components/Notes';
import { Card, ProgressBar, NotificationToast } from './components/UIComponents';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // --- App State ---
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('ONYX_ACTIVE_TAB') || 'dashboard';
    }
    return 'dashboard';
  });
  const [showAI, setShowAI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: string; message: string}[]>([]);
  
  // Sync Control
  const isRemoteUpdate = useRef(false);

  // Notification Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCheckedMinuteRef = useRef<string>('');

  // Initialize state lazily to prevent race conditions that overwrite local storage
  const [appState, setAppState] = useState<AppState>(() => {
    const local = loadState();
    const defaultState = {
      tasks: INITIAL_TASKS,
      areas: INITIAL_AREAS,
      milestones: INITIAL_MILESTONES,
      objectives: INITIAL_OBJECTIVES,
      notes: INITIAL_NOTES,
      lastLoginDate: new Date().toISOString().split('T')[0]
    };
    return local ? checkDailyReset(local) : defaultState;
  });

  // --- Auth & Data Sync Effects ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        // User Logged In: Subscribe to Cloud Data
        setDataLoading(true);
        const unsubscribeData = subscribeToData(currentUser.uid, (cloudData) => {
          if (cloudData) {
            isRemoteUpdate.current = true;
            setAppState(prev => checkDailyReset(cloudData));
          } 
          // If cloudData is null (new user), we stick with the current local state 
          // (which will be saved to cloud by the next saveState effect)
          setDataLoading(false);
        });
        return () => unsubscribeData();
      } else {
        // User Logged Out: Ensure we rely on local state or reload it to be safe
        const localData = loadState();
        if (localData) {
          setAppState(checkDailyReset(localData));
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Initialize Audio
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Save State on Change
  useEffect(() => {
    if (!authLoading && !dataLoading) {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }
      saveState(appState, user?.uid);
    }
  }, [appState, user, authLoading, dataLoading]);

  useEffect(() => {
    localStorage.setItem('ONYX_ACTIVE_TAB', activeTab);
  }, [activeTab]);

  // --- Notification Logic ---
  const triggerDueAlert = async (title: string, body: string) => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }

    if ("serviceWorker" in navigator && "Notification" in window) {
        if (Notification.permission === "granted") {
            try {
                const reg = await navigator.serviceWorker.ready;
                reg.showNotification(title, {
                    body,
                    icon: '/vite.svg',
                    badge: '/vite.svg',
                    vibrate: [200, 100, 200],
                    tag: 'onyx-notification'
                } as any);
                return;
            } catch (e) {
                console.error("SW Notification failed, falling back", e);
            }
        }
    }
  };

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const currentMinuteStr = now.toISOString().slice(0, 16); 

      if (lastCheckedMinuteRef.current === currentMinuteStr) return;
      lastCheckedMinuteRef.current = currentMinuteStr;

      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const today = now.toISOString().split('T')[0];

      appState.tasks.forEach(task => {
        if (task.type === 'reminder' && !task.completed && task.dueDate === today && task.dueTime === currentTime) {
          triggerDueAlert("Reminder Due", task.title);
        }
      });
    };

    const interval = setInterval(checkNotifications, 5000); 
    return () => clearInterval(interval);
  }, [appState.tasks]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Data Helpers ---
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
          tasks: prev.tasks.filter(t => t.areaId !== id),
          objectives: prev.objectives.filter(o => o.areaId !== id)
      }));
  };

  // --- Render Sections ---
  const DashboardHome = () => {
    const highPriority = appState.tasks.filter(t => t.type === 'short_term' && !t.completed && t.priority === 'High');
    const taskForceTasks = appState.tasks.filter(t => t.type === 'short_term' && !t.completed);
    const operations = appState.tasks.filter(t => t.type === 'long_term' && !t.completed);
    
    const dailyTasks = appState.tasks.filter(t => t.type === 'daily');
    const completedDaily = dailyTasks.filter(t => t.completed).length;
    const dailyProgress = dailyTasks.length > 0 ? (completedDaily / dailyTasks.length) * 100 : 0;
    
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

    // Dashboard Recent Notes
    const recentNotes = [...(appState.notes || [])].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-10">
        <div className="flex flex-col gap-6">
           <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
                <div className="text-neutral-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
           </div>
        </div>

        {/* Task Force Widget */}
        <section>
          <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('taskforce')}>
             <div className="flex items-center gap-2 text-neutral-300 font-medium">
                <Activity size={18} /> Task Force
             </div>
             <ArrowRight size={16} className="text-neutral-600" />
          </div>
          <div className="flex flex-col gap-3">
             {taskForceTasks.slice(0, 4).map(task => (
               <div key={task.id} className="group flex items-center justify-between p-4 rounded-xl bg-onyx-900 border border-onyx-800 hover:border-white/20 transition-all shadow-sm">
                  <div className="flex items-center gap-4 overflow-hidden">
                     <Activity size={16} className="text-neutral-600 shrink-0" />
                     <span className="text-white font-medium text-base truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     {task.priority && (
                        <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                     )}
                     <button onClick={() => toggleTask(task.id)} className="w-7 h-7 rounded-full border-2 border-onyx-700 hover:border-white hover:bg-white text-black flex items-center justify-center transition-all shrink-0 ml-2">
                         <Check size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                  </div>
               </div>
             ))}
             {taskForceTasks.length === 0 && (
                <div className="p-6 text-center border border-dashed border-onyx-800 rounded-xl text-neutral-600 text-sm">
                   Task force standing by.
                </div>
             )}
          </div>
        </section>

        {/* Operations Widget */}
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

        {/* Life Areas Widget */}
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

        {/* Notes Widget (REPLACES CALENDAR) */}
        <section>
          <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('notes')}>
             <div className="flex items-center gap-2 text-neutral-300 font-medium">
                <Notebook size={18} /> Recent Notes & Ideas
             </div>
             <ArrowRight size={16} className="text-neutral-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {recentNotes.map(note => (
               <div key={note.id} className="p-5 rounded-xl bg-onyx-900 border border-onyx-800 hover:border-onyx-700 transition-all cursor-pointer group" onClick={() => setActiveTab('notes')}>
                  <h4 className="text-white font-semibold text-sm mb-2 group-hover:text-blue-400 transition-colors truncate">{note.title}</h4>
                  <p className="text-neutral-500 text-xs line-clamp-3 mb-4 leading-relaxed">{note.content || "Empty note content..."}</p>
                  <div className="text-[10px] text-neutral-700">{new Date(note.createdAt).toLocaleDateString()}</div>
               </div>
             ))}
             {recentNotes.length === 0 && (
                <div className="md:col-span-3 p-10 text-center border border-dashed border-onyx-800 rounded-xl text-neutral-600 text-sm">
                   No notes yet. Capture your next big idea.
                </div>
             )}
          </div>
        </section>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardHome />;
      case 'taskforce': return <TaskForce tasks={appState.tasks.filter(t => t.type === 'short_term')} onToggle={toggleTask} onAdd={addTask} onDelete={deleteTask} onToggleSubtask={toggleSubtask} onUpdate={updateTask} />;
      case 'operations': return <OperationsBoard tasks={appState.tasks.filter(t => t.type === 'long_term')} onToggle={toggleTask} onAdd={addTask} onToggleSubtask={toggleSubtask} onDelete={deleteTask} onUpdate={updateTask} />;
      case 'rituals': return <div className="h-full max-w-2xl mx-auto py-4"><DailyChecklist tasks={appState.tasks.filter(t => t.type === 'daily')} onToggle={toggleTask} onAdd={(title) => addTask({ title, type: 'daily' })} onDelete={deleteTask} /></div>;
      case 'areas': return <LifeAreas areas={appState.areas} tasks={appState.tasks} objectives={appState.objectives || []} milestones={appState.milestones || []} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} onAddObjective={addObjective} onDeleteObjective={deleteObjective} onAddMilestone={addMilestone} onToggleMilestone={toggleMilestone} onDeleteMilestone={deleteMilestone} onAddArea={addArea} onUpdateArea={updateArea} onDeleteArea={deleteArea} />;
      case 'notes': return <Notes notes={appState.notes || []} onAdd={addNote} onDelete={deleteNote} onUpdate={updateNote} />;
      default: return null;
    }
  };

  const NavItem = ({ id, icon: Icon, label, badgeCount }: { id: string; icon: any; label: string; badgeCount?: number }) => (
    <button
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all group ${activeTab === id ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white hover:bg-onyx-800'}`}
    >
      <Icon size={20} />
      <span className="flex-1 text-left">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && <span className={`text-[10px] font-bold px-1.5 rounded-full ${activeTab === id ? 'bg-black text-white' : 'bg-neutral-800 text-white'}`}>{badgeCount}</span>}
    </button>
  );

  const taskForceCount = appState.tasks.filter(t => t.type === 'short_term' && !t.completed).length;
  const operationsCount = appState.tasks.filter(t => t.type === 'long_term' && !t.completed).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-onyx-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-onyx-950 text-neutral-200 font-sans flex overflow-hidden">
      {toasts.map(toast => (<NotificationToast key={toast.id} message={toast.message} onClose={() => removeToast(toast.id)} />))}

      <aside className="hidden md:flex flex-col w-64 border-r border-onyx-800 bg-onyx-900/30 p-4">
        <div className="mb-8 px-4 py-2">
          <h1 onClick={() => setActiveTab('dashboard')} className="text-2xl font-bold tracking-tighter text-white cursor-pointer hover:text-neutral-300 transition-colors">ONYX.</h1>
        </div>
        <nav className="flex-1 space-y-1">
          <NavItem id="dashboard" icon={Layout} label="Dashboard" />
          <div className="my-4 border-t border-onyx-800 mx-4"></div>
          <NavItem id="taskforce" icon={Activity} label="Task Force" badgeCount={taskForceCount} />
          <NavItem id="operations" icon={Target} label="Operations" badgeCount={operationsCount} />
          <NavItem id="rituals" icon={CheckSquare} label="Daily Rituals" />
          <NavItem id="areas" icon={Layers} label="Life Areas" />
          <NavItem id="notes" icon={Notebook} label="Notes" />
        </nav>
        <button onClick={() => signOut(auth)} className="mt-auto mb-4 mx-2 flex items-center gap-2 text-neutral-500 hover:text-red-400 text-sm p-2 rounded hover:bg-onyx-800 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
        <button onClick={() => setShowAI(true)} className="bg-onyx-800 border border-onyx-700 p-4 rounded-xl flex items-center gap-3 hover:border-white transition-colors group">
          <div className="bg-white text-black p-2 rounded-lg group-hover:scale-110 transition-transform"><MessageSquare size={18} /></div>
          <div className="text-left"><div className="text-xs text-neutral-500 uppercase">Assistant</div><div className="text-sm font-medium text-white">Ask Onyx AI</div></div>
        </button>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-onyx-800 bg-onyx-950 z-20">
          <h1 onClick={() => setActiveTab('dashboard')} className="text-xl font-bold text-white cursor-pointer">ONYX.</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowAI(!showAI)} className="p-2 text-white"><MessageSquare size={24} /></button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-onyx-950 z-30 pt-20 px-4 space-y-2">
            <NavItem id="dashboard" icon={Layout} label="Dashboard" />
            <div className="border-t border-onyx-800 my-2"></div>
            <NavItem id="taskforce" icon={Activity} label="Task Force" badgeCount={taskForceCount} />
            <NavItem id="operations" icon={Target} label="Operations" badgeCount={operationsCount} />
            <NavItem id="rituals" icon={CheckSquare} label="Daily Rituals" />
            <NavItem id="areas" icon={Layers} label="Life Areas" />
            <NavItem id="notes" icon={Notebook} label="Notes" />
            <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 p-4 text-red-400 bg-onyx-900 rounded-lg mt-8"><LogOut size={20}/> Sign Out</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
          {dataLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
               <Loader2 className="animate-spin" size={32} />
               <p className="text-sm uppercase tracking-widest">Syncing Data...</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>

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
