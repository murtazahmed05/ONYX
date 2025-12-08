import React, { useState } from 'react';
import { Task, Priority, SubTask } from '../types';
import { Card, Badge } from './UIComponents';
import { Activity, Plus, X, ChevronDown, ChevronRight, Check, Tag, ChevronUp, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskForceProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAdd: (task: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
}

export const TaskForce: React.FC<TaskForceProps> = ({ tasks, onToggle, onAdd, onDelete, onToggleSubtask, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Tag state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
      title: string;
      priority: Priority | undefined;
      tags: string[];
      subtasks: SubTask[];
  }>({
      title: '',
      priority: undefined,
      tags: [],
      subtasks: []
  });
  const [editTagInput, setEditTagInput] = useState('');
  const [editSubtaskInput, setEditSubtaskInput] = useState('');

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // --- Add Handlers ---
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
    setPriority(undefined);
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

  const manualAddTag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // --- Edit Handlers ---
  const handleEditClick = (task: Task) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      priority: task.priority,
      tags: task.tags || [],
      subtasks: task.subtasks || []
    });
    setEditTagInput('');
    setEditSubtaskInput('');
  };

  const handleSaveEdit = () => {
    if (!editingId || !onUpdate) return;
    onUpdate(editingId, {
      title: editForm.title,
      priority: editForm.priority,
      tags: editForm.tags,
      subtasks: editForm.subtasks
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Edit Tags
  const addEditTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editTagInput.trim()) {
      e.preventDefault();
      if (!editForm.tags.includes(editTagInput.trim())) {
        setEditForm({...editForm, tags: [...editForm.tags, editTagInput.trim()]});
      }
      setEditTagInput('');
    }
  };

  const manualAddEditTag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editTagInput.trim() && !editForm.tags.includes(editTagInput.trim())) {
      setEditForm({...editForm, tags: [...editForm.tags, editTagInput.trim()]});
      setEditTagInput('');
    }
  };

  const removeEditTag = (tag: string) => {
    setEditForm({...editForm, tags: editForm.tags.filter(t => t !== tag)});
  };

  // Edit Subtasks
  const addEditSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSubtaskInput.trim()) {
      const newSub: SubTask = {
        id: Date.now().toString() + Math.random(),
        title: editSubtaskInput.trim(),
        completed: false
      };
      setEditForm({...editForm, subtasks: [...editForm.subtasks, newSub]});
      setEditSubtaskInput('');
    }
  };

  const removeEditSubtask = (id: string) => {
    setEditForm({...editForm, subtasks: editForm.subtasks.filter(st => st.id !== id)});
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
            
            <div className="flex gap-2 items-center">
              <span className="text-xs text-neutral-500 mr-2">Priority (Optional):</span>
              {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(priority === p ? undefined : p)}
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
              <button 
                type="button" 
                onClick={manualAddTag} 
                className="text-neutral-500 hover:text-white p-1 rounded hover:bg-onyx-700 transition-colors"
                title="Add Tag"
              >
                <Plus size={16}/>
              </button>
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

      {/* Active Tasks - Vertical Timeline */}
      <div className="flex flex-col gap-4 pb-10">
        {activeTasks.map(task => {
          if (editingId === task.id) {
            // --- EDIT MODE ---
            return (
              <Card key={task.id} className="p-4 bg-onyx-900 border-onyx-600 ml-6 relative">
                 <div className="absolute -left-[29px] top-6 w-2.5 h-2.5 bg-neutral-500 rounded-full"></div>
                 <div className="flex flex-col gap-3">
                    <input 
                        className="bg-transparent border-b border-onyx-700 p-2 text-white focus:outline-none focus:border-white font-medium text-lg"
                        value={editForm.title}
                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                        autoFocus
                    />
                    
                    <div className="flex gap-1 items-center">
                        <span className="text-xs text-neutral-500 mr-2">Priority:</span>
                        {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
                            <button
                            key={p}
                            onClick={() => setEditForm({...editForm, priority: editForm.priority === p ? undefined : p})}
                            className={`text-[10px] px-2 py-1 rounded border ${editForm.priority === p ? 'bg-white text-black border-white' : 'border-onyx-600 text-neutral-500'}`}
                            >
                            {p}
                            </button>
                        ))}
                    </div>

                    {/* Edit Tags */}
                    <div className="flex flex-wrap gap-2 items-center min-h-[32px] p-2 bg-onyx-800 rounded border border-onyx-700">
                        <Tag size={14} className="text-neutral-500" />
                        {editForm.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-onyx-600 text-neutral-300 px-2 py-0.5 rounded flex items-center gap-1">
                            #{tag}
                            <button type="button" onClick={() => removeEditTag(tag)} className="hover:text-white"><X size={10}/></button>
                            </span>
                        ))}
                        <input 
                            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none min-w-[80px]"
                            placeholder="Add tags..."
                            value={editTagInput}
                            onChange={(e) => setEditTagInput(e.target.value)}
                            onKeyDown={addEditTag}
                        />
                        <button 
                            type="button" 
                            onClick={manualAddEditTag} 
                            className="text-neutral-500 hover:text-white p-1 rounded hover:bg-onyx-700 transition-colors"
                            title="Add Tag"
                        >
                            <Plus size={16}/>
                        </button>
                    </div>

                    {/* Edit Subtasks */}
                    <div className="space-y-2 pt-2 border-t border-onyx-800/50">
                        {editForm.subtasks.map((st) => (
                            <div key={st.id} className="flex items-center gap-2 p-1 bg-onyx-800/50 rounded">
                                <span className="flex-1 text-xs text-neutral-300">{st.title}</span>
                                <button onClick={() => removeEditSubtask(st.id)} className="text-neutral-500 hover:text-red-400"><X size={12}/></button>
                            </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                            <input 
                                className="flex-1 bg-onyx-800 border border-onyx-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500"
                                placeholder="Add subtask..."
                                value={editSubtaskInput}
                                onChange={(e) => setEditSubtaskInput(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addEditSubtask(e); }}}
                            />
                            <button type="button" onClick={addEditSubtask} className="px-3 bg-onyx-800 border border-onyx-700 rounded text-neutral-400 hover:text-white text-xs">+</button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={handleCancelEdit} className="text-sm px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
                        <button onClick={handleSaveEdit} className="text-sm px-6 py-2 bg-white text-black rounded font-medium hover:bg-neutral-200">Save Changes</button>
                    </div>
                 </div>
              </Card>
            );
          }

          // --- VIEW MODE ---
          return (
            <div key={task.id} className="relative pl-6 border-l border-onyx-700 py-2 hover:border-white transition-colors group">
              {/* Completion Toggle */}
              <div 
                className="absolute -left-[5px] top-3 w-2.5 h-2.5 bg-black border border-onyx-500 rounded-full group-hover:border-white group-hover:bg-white transition-all cursor-pointer" 
                onClick={() => onToggle(task.id)}
              ></div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 group/title">
                            <h3 className="text-neutral-200 font-medium text-lg leading-tight">{task.title}</h3>
                            <button 
                                onClick={() => handleEditClick(task)} 
                                className="opacity-0 group-hover/title:opacity-100 text-neutral-600 hover:text-white transition-opacity p-1"
                                title="Edit"
                            >
                                <Edit2 size={12} />
                            </button>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-neutral-500 items-center">
                             {task.dueDate && (
                               <span className="flex items-center gap-1">
                                  Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                               </span>
                             )}
                            {task.priority && (
                                <span className={`uppercase tracking-wider font-medium ${task.priority === 'High' ? 'text-red-400' : task.priority === 'Medium' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                  {task.priority} Priority
                                </span>
                            )}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex gap-1 ml-1">
                                  {task.tags.map(tag => (
                                  <span key={tag} className="px-1.5 py-0.5 rounded bg-onyx-800 text-neutral-400">#{tag}</span>
                                  ))}
                              </div>
                            )}
                        </div>
                    </div>
                    
                    <button onClick={() => onDelete(task.id)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Render Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="pl-1 mt-1 space-y-1.5">
                    {task.subtasks.map(st => (
                        <div key={st.id} className="flex items-center gap-2">
                            <div 
                            onClick={(e) => { e.stopPropagation(); onToggleSubtask && onToggleSubtask(task.id, st.id); }}
                            className={`w-3 h-3 border rounded-[2px] cursor-pointer flex items-center justify-center transition-colors ${st.completed ? 'bg-neutral-600 border-neutral-600' : 'border-neutral-600 hover:border-neutral-400'}`}
                            >
                                {st.completed && <Check size={8} className="text-black" />}
                            </div>
                            <span className={`text-sm ${st.completed ? 'text-neutral-600 line-through' : 'text-neutral-400'}`}>{st.title}</span>
                        </div>
                    ))}
                    </div>
                )}
              </div>
            </div>
          );
        })}
         {activeTasks.length === 0 && !showForm && (
            <div className="py-12 text-center text-neutral-600 border border-dashed border-onyx-800 rounded-xl">
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
            <div className="flex flex-col gap-2 opacity-60">
               {completedTasks.map(task => (
                 <div key={task.id} className="bg-onyx-900/50 border border-onyx-800 rounded-lg p-3 flex items-center gap-4">
                    <button 
                      onClick={() => onToggle(task.id)}
                      className="w-4 h-4 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center text-green-500"
                    >
                      <Check size={10} />
                    </button>
                    <span className="text-neutral-500 line-through flex-1 text-sm">{task.title}</span>
                    <button onClick={() => onDelete(task.id)} className="text-neutral-700 hover:text-red-400">
                      <Trash2 size={14} />
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