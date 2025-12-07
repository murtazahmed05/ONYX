import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { Card, Badge } from './UIComponents';
import { Activity, Plus, X, ChevronDown, ChevronRight, Check, Tag, ChevronUp, Trash2 } from 'lucide-react';

interface TaskForceProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAdd: (task: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskForce: React.FC<TaskForceProps> = ({ tasks, onToggle, onAdd, onDelete, onToggleSubtask }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Tag state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const finalSubtasks = newSubtasks.map(st => ({
      id: Date.now().toString() + Math.random().toString(),
      title: st,
      completed: false
    }));

    onAdd({
      title,
      priority,
      tags: tags,
      type: 'short_term',
      subtasks: finalSubtasks
    });
    
    setTitle('');
    setNewSubtasks([]);
    setSubtaskInput('');
    setTags([]);
    setTagInput('');
    setShowForm(false);
  };

  const addPendingSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (subtaskInput.trim()) {
      setNewSubtasks([...newSubtasks, subtaskInput.trim()]);
      setSubtaskInput('');
    }
  };

  const removePendingSubtask = (index: number) => {
    setNewSubtasks(newSubtasks.filter((_, i) => i !== index));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const priorityColor = (p?: Priority) => {
    switch(p) {
      case 'High': return 'bg-red-900/30 text-red-300 border border-red-900/50';
      case 'Medium': return 'bg-yellow-900/30 text-yellow-300 border border-yellow-900/50';
      case 'Low': return 'bg-green-900/30 text-green-300 border border-green-900/50';
      default: return 'bg-onyx-700 text-neutral-400';
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity size={24} className="text-neutral-400" />
          Task Force
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="p-3 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <Card className="mb-8 bg-onyx-900 border-onyx-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              autoFocus
              className="w-full bg-transparent border-b border-onyx-700 pb-3 text-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
              placeholder="What needs to be done quickly?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="flex gap-2">
              {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`text-sm px-4 py-1.5 rounded-full border transition-all ${priority === p ? 'bg-white text-black border-white' : 'border-onyx-600 text-neutral-400 hover:border-neutral-400'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Tags Input */}
            <div className="flex flex-wrap gap-2 items-center min-h-[40px] p-3 bg-onyx-800 rounded border border-onyx-700">
              <Tag size={16} className="text-neutral-500" />
              {tags.map(tag => (
                <span key={tag} className="text-xs bg-onyx-600 text-neutral-300 px-2 py-1 rounded flex items-center gap-1">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={12}/></button>
                </span>
              ))}
              <input 
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none min-w-[80px]"
                placeholder="Type tag & Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
            </div>

            {/* Subtasks Input */}
            <div className="space-y-3 pt-2">
               <div className="flex gap-3">
                 <input 
                    className="flex-1 bg-onyx-800 border border-onyx-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-500"
                    placeholder="Add subtask (optional)..."
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addPendingSubtask(e); }}}
                 />
                 <button type="button" onClick={addPendingSubtask} className="px-4 bg-onyx-800 border border-onyx-700 rounded hover:text-white text-neutral-400">+</button>
               </div>
               {newSubtasks.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                   {newSubtasks.map((st, i) => (
                     <span key={i} className="text-sm bg-onyx-800 text-neutral-300 px-3 py-1 rounded flex items-center gap-2">
                       {st}
                       <button type="button" onClick={() => removePendingSubtask(i)} className="hover:text-red-400"><X size={12}/></button>
                     </span>
                   ))}
                 </div>
               )}
            </div>

            <div className="flex justify-end pt-2">
               <button type="submit" className="text-sm font-semibold text-white bg-onyx-700 hover:bg-onyx-600 px-6 py-2.5 rounded-lg">
                 Add Task
               </button>
            </div>
          </form>
        </Card>
      )}

      {/* Active Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
        {activeTasks.map(task => (
          <div key={task.id} className="group bg-onyx-800 hover:bg-onyx-700/50 border border-onyx-700 rounded-xl p-6 transition-all relative flex flex-col shadow-sm hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
              <Badge color={priorityColor(task.priority)}>{task.priority}</Badge>
              <div className="flex gap-4 items-center">
                 <button onClick={() => onDelete(task.id)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={18} />
                 </button>
                 <button 
                    onClick={() => onToggle(task.id)}
                    className="w-7 h-7 rounded-full border-2 border-neutral-500 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all"
                    title="Mark Complete"
                 ></button>
              </div>
            </div>
            
            <h3 className="text-neutral-100 font-semibold text-xl mb-4 leading-relaxed">{task.title}</h3>
            
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mb-5 space-y-3 pl-1">
                {task.subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-3 text-base">
                     <div 
                       onClick={(e) => { e.stopPropagation(); onToggleSubtask && onToggleSubtask(task.id, st.id); }}
                       className={`w-4 h-4 border rounded cursor-pointer flex items-center justify-center transition-colors ${st.completed ? 'bg-neutral-500 border-neutral-500' : 'border-neutral-600 hover:border-neutral-400'}`}
                     >
                       {st.completed && <Check size={12} className="text-black" />}
                     </div>
                     <span className={`${st.completed ? 'line-through text-neutral-600' : 'text-neutral-400'}`}>{st.title}</span>
                  </div>
                ))}
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="mt-auto pt-4 flex gap-2 flex-wrap border-t border-white/5">
                {task.tags.map(tag => (
                  <span key={tag} className="text-xs text-neutral-400 bg-onyx-900 px-2 py-1 rounded">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
         {activeTasks.length === 0 && !showForm && (
            <div className="col-span-full py-12 text-center text-neutral-600 border border-dashed border-onyx-800 rounded-xl">
              All clear. No immediate tasks.
            </div>
          )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="mt-auto border-t border-onyx-800 pt-6 mb-10">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-4"
          >
            {showCompleted ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Completed Tasks ({completedTasks.length})
          </button>
          
          {showCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 opacity-60">
               {completedTasks.map(task => (
                 <div key={task.id} className="bg-onyx-900/50 border border-onyx-800 rounded-lg p-4 flex items-center gap-4">
                    <button 
                      onClick={() => onToggle(task.id)}
                      className="w-6 h-6 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center text-green-500"
                    >
                      <Check size={14} />
                    </button>
                    <span className="text-neutral-500 line-through flex-1">{task.title}</span>
                    <button onClick={() => onDelete(task.id)} className="text-neutral-700 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};