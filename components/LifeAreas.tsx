import React, { useState } from 'react';
import { LifeArea, Task, Milestone, Objective } from '../types';
import { Card, ProgressBar, Checkbox } from './UIComponents';
import { ICON_MAP } from '../constants';
import { Plus, Trash2, Trophy, Flag, MoreHorizontal, X as XIcon, Edit2, Check } from 'lucide-react';

interface LifeAreasProps {
  areas: LifeArea[];
  tasks: Task[];
  objectives: Objective[];
  milestones: Milestone[];
  onAddTask: (task: Partial<Task>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddObjective: (objective: Partial<Objective>) => void;
  onDeleteObjective: (id: string) => void;
  onAddMilestone: (milestone: Partial<Milestone>) => void;
  onToggleMilestone: (id: string) => void;
  onDeleteMilestone: (id: string) => void;
  
  // Area Management
  onAddArea: (area: Partial<LifeArea>) => void;
  onUpdateArea: (id: string, area: Partial<LifeArea>) => void;
  onDeleteArea: (id: string) => void;
}

export const LifeAreas: React.FC<LifeAreasProps> = ({ 
  areas, tasks, objectives, milestones, 
  onAddTask, onToggleTask, onDeleteTask,
  onAddObjective, onDeleteObjective,
  onAddMilestone, onToggleMilestone, onDeleteMilestone,
  onAddArea, onUpdateArea, onDeleteArea
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newObjectiveTitle, setNewObjectiveTitle] = useState('');
  const [newMilestoneTitles, setNewMilestoneTitles] = useState<Record<string, string>>({});

  // Area Management State
  const [isEditingArea, setIsEditingArea] = useState<string | null>(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaColor, setNewAreaColor] = useState('#3b82f6');
  const [isAddingArea, setIsAddingArea] = useState(false);

  const selectedArea = areas.find(a => a.id === selectedAreaId);

  // --- Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedAreaId) return;
    onAddTask({
      title: newTaskTitle,
      type: 'life_area',
      areaId: selectedAreaId,
      tags: [selectedArea?.name || 'area'],
      priority: 'Medium'
    });
    setNewTaskTitle('');
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectiveTitle.trim() || !selectedAreaId) return;
    onAddObjective({
      title: newObjectiveTitle,
      areaId: selectedAreaId,
      completed: false
    });
    setNewObjectiveTitle('');
  };

  const handleAddMilestone = (e: React.FormEvent, objectiveId: string) => {
    e.preventDefault();
    const title = newMilestoneTitles[objectiveId];
    if (!title?.trim()) return;
    
    onAddMilestone({
      title: title,
      objectiveId: objectiveId,
      completed: false
    });
    setNewMilestoneTitles(prev => ({...prev, [objectiveId]: ''}));
  };

  const handleCreateArea = () => {
    if(!newAreaName.trim()) return;
    onAddArea({
        name: newAreaName,
        color: newAreaColor,
        icon: 'Layers' // Default icon for now
    });
    setNewAreaName('');
    setIsAddingArea(false);
  };

  const handleUpdateArea = (id: string) => {
    if(!newAreaName.trim()) return;
    onUpdateArea(id, { name: newAreaName, color: newAreaColor });
    setIsEditingArea(null);
    setNewAreaName('');
  };

  // --- Main Gallery View ---
  if (!selectedArea) {
    return (
      <div className="h-full space-y-6 max-w-5xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ICON_MAP.Layers size={20} className="text-neutral-400"/>
            Life Areas
            </h2>
            <button onClick={() => setIsAddingArea(!isAddingArea)} className="p-2 rounded-lg bg-onyx-800 text-neutral-400 hover:text-white hover:bg-onyx-700">
                {isAddingArea ? <XIcon size={20}/> : <Plus size={20}/>}
            </button>
        </div>
        
        {isAddingArea && (
            <Card className="mb-6 bg-onyx-900 border-onyx-700 p-4">
                <div className="flex gap-4 items-center">
                    <input 
                        className="flex-1 bg-transparent border-b border-onyx-700 p-2 text-white focus:outline-none focus:border-white"
                        placeholder="New Area Name..."
                        value={newAreaName}
                        onChange={e => setNewAreaName(e.target.value)}
                        autoFocus
                    />
                    <input 
                        type="color" 
                        value={newAreaColor}
                        onChange={e => setNewAreaColor(e.target.value)}
                        className="bg-transparent w-8 h-8 rounded cursor-pointer"
                    />
                    <button onClick={handleCreateArea} className="px-4 py-2 bg-white text-black rounded font-medium hover:bg-neutral-200">
                        Create
                    </button>
                </div>
            </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {areas.map(area => {
            const areaTasks = tasks.filter(t => t.areaId === area.id);
            const areaObjectives = objectives.filter(o => o.areaId === area.id);
            
            // Calculate Progress based on Milestones within Objectives + Tasks
            const areaMilestones: Milestone[] = [];
            areaObjectives.forEach(obj => {
               const objsMilestones = milestones.filter(m => m.objectiveId === obj.id);
               areaMilestones.push(...objsMilestones);
            });

            const totalItems = areaTasks.length + areaMilestones.length;
            const completedItems = areaTasks.filter(t => t.completed).length + areaMilestones.filter(m => m.completed).length;
            
            const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
            const Icon = ICON_MAP[area.icon] || ICON_MAP['Layers'];

            if (isEditingArea === area.id) {
                return (
                    <div key={area.id} className="bg-onyx-900 border border-onyx-800 p-6 rounded-xl">
                        <div className="flex gap-2 mb-4">
                            <input 
                                className="flex-1 bg-onyx-800 rounded p-2 text-white border border-onyx-700"
                                value={newAreaName}
                                onChange={e => setNewAreaName(e.target.value)}
                            />
                            <input 
                                type="color" 
                                value={newAreaColor}
                                onChange={e => setNewAreaColor(e.target.value)}
                                className="bg-transparent w-10 h-10 rounded cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditingArea(null)} className="text-neutral-500 hover:text-white px-3 py-1">Cancel</button>
                            <button onClick={() => handleUpdateArea(area.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                        </div>
                    </div>
                );
            }

            return (
              <div 
                key={area.id} 
                className="group bg-onyx-900 border border-onyx-800 hover:border-white/20 p-6 rounded-xl transition-all hover:bg-onyx-800 relative overflow-hidden"
              >
                 {/* Action Buttons with backdrop to prevent overlap issues */}
                 <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-onyx-950/90 backdrop-blur-sm p-1.5 rounded-lg border border-onyx-800 shadow-xl">
                     <button 
                        onClick={(e) => { e.stopPropagation(); setNewAreaName(area.name); setNewAreaColor(area.color); setIsEditingArea(area.id); }}
                        className="p-1.5 rounded hover:bg-onyx-800 text-neutral-400 hover:text-white"
                        title="Edit Area"
                    >
                        <Edit2 size={14}/>
                     </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteArea(area.id); }}
                        className="p-1.5 rounded hover:bg-onyx-800 text-neutral-400 hover:text-red-400"
                        title="Delete Area"
                    >
                        <Trash2 size={14}/>
                     </button>
                 </div>

                <div onClick={() => setSelectedAreaId(area.id)} className="cursor-pointer relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-onyx-800 group-hover:bg-onyx-700 transition-colors text-white shadow-lg" style={{ color: area.color }}>
                            <Icon size={24} />
                            </div>
                            <div>
                            <h3 className="font-semibold text-lg text-white group-hover:text-white transition-colors">{area.name}</h3>
                            <p className="text-xs text-neutral-500">{areaObjectives.length} Objectives</p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-neutral-200">{progress}%</span>
                    </div>
                    
                    <ProgressBar progress={progress} className="bg-onyx-950 h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Detail View ---
  const areaTasks = tasks.filter(t => t.areaId === selectedArea.id);
  const areaObjectives = objectives.filter(o => o.areaId === selectedArea.id);
  const Icon = ICON_MAP[selectedArea.icon];

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setSelectedAreaId(null)}
          className="p-2 rounded-full hover:bg-onyx-800 text-neutral-400 hover:text-white transition-colors"
        >
          <ICON_MAP.ArrowLeft size={24} />
        </button>
        <div className="p-2 rounded-lg bg-onyx-800" style={{ color: selectedArea.color }}>
          <Icon size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white">{selectedArea.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-y-auto pb-20">
        
        {/* Left Column: Strategic Objectives */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Flag size={18} className="text-blue-400" />
              Strategic Objectives
            </h3>
          </div>

          <form onSubmit={handleAddObjective} className="relative">
             <input 
                className="w-full bg-onyx-900 border border-onyx-800 rounded p-2 pl-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
                placeholder="Set a new objective (e.g. Earn 10k in 2026)..."
                value={newObjectiveTitle}
                onChange={e => setNewObjectiveTitle(e.target.value)}
             />
             <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"><Plus size={16}/></button>
          </form>

          <div className="space-y-4">
            {areaObjectives.map(obj => {
               const objMilestones = milestones.filter(m => m.objectiveId === obj.id);
               const progress = objMilestones.length > 0 
                  ? (objMilestones.filter(m => m.completed).length / objMilestones.length) * 100 
                  : 0;

               return (
                  <Card key={obj.id} className="p-4 bg-onyx-900 border-onyx-800 relative group">
                     <button onClick={() => onDeleteObjective(obj.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400"><Trash2 size={14}/></button>
                     <h4 className="font-semibold text-neutral-200 mb-2">{obj.title}</h4>
                     <ProgressBar progress={progress} className="h-1.5 mb-6 bg-onyx-950" />
                     
                     <div className="space-y-3 pl-2 border-l-2 border-onyx-800">
                        {objMilestones.map(m => (
                           <div key={m.id} className="flex items-center gap-3 p-4 bg-onyx-950/50 rounded-lg border border-onyx-800 hover:border-onyx-700 transition-all">
                              <div 
                                onClick={() => onToggleMilestone(m.id)}
                                className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-all ${m.completed ? 'bg-yellow-500/20 border-yellow-500' : 'border-neutral-600 hover:border-neutral-400'}`}
                              >
                                 {m.completed && <Trophy size={12} className="text-yellow-500"/>}
                              </div>
                              <span className={`text-base flex-1 ${m.completed ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>{m.title}</span>
                              <button onClick={() => onDeleteMilestone(m.id)} className="opacity-0 group-hover:opacity-100 text-neutral-700 hover:text-red-400"><XIcon size={14}/></button>
                           </div>
                        ))}
                        
                        {/* Add Milestone Input specific to this objective */}
                        <form onSubmit={(e) => handleAddMilestone(e, obj.id)} className="flex items-center gap-2 mt-4 pt-2 border-t border-dashed border-onyx-800/50">
                           <input 
                              className="bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none flex-1 py-2"
                              placeholder="+ Add milestone (e.g. 2k earned)"
                              value={newMilestoneTitles[obj.id] || ''}
                              onChange={e => setNewMilestoneTitles(prev => ({...prev, [obj.id]: e.target.value}))}
                           />
                        </form>
                     </div>
                  </Card>
               );
            })}
             {areaObjectives.length === 0 && (
                <div className="text-neutral-600 text-sm italic">No objectives defined. Start by adding one above.</div>
             )}
          </div>
        </div>

        {/* Right Column: Routine Tasks */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <ICON_MAP.CheckSquare size={18} className="text-neutral-400" />
            Area Tasks
          </h3>

          <div className="space-y-3">
            <form onSubmit={handleAddTask} className="relative">
              <input 
                type="text" 
                className="w-full bg-onyx-900 border border-onyx-800 rounded-lg py-3 pl-4 pr-10 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none"
                placeholder={`Add a task for ${selectedArea.name}...`}
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-2">
              {areaTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-onyx-900/50 border border-onyx-800/50 rounded-lg hover:border-onyx-700 transition-colors group">
                  <Checkbox checked={task.completed} onChange={() => onToggleTask(task.id)} />
                  <span className={`flex-1 text-sm ${task.completed ? 'text-neutral-600 line-through' : 'text-neutral-300'}`}>
                    {task.title}
                  </span>
                  <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-opacity"
                    >
                      <XIcon size={14} />
                    </button>
                </div>
              ))}
               {areaTasks.length === 0 && (
                  <div className="text-center text-neutral-600 text-sm italic py-4">
                    No active tasks.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
