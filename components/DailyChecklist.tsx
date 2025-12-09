import React from 'react';
import { Task } from '../types';
import { Checkbox, Card } from './UIComponents';
import { CheckSquare, Trash2 } from 'lucide-react';

interface DailyChecklistProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
}

export const DailyChecklist: React.FC<DailyChecklistProps> = ({ tasks, onToggle, onAdd, onDelete }) => {
  const [newHabit, setNewHabit] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.trim()) {
      onAdd(newHabit);
      setNewHabit('');
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <CheckSquare size={20} className="text-neutral-400" />
          Daily Rituals
        </h2>
        <span className="text-xs text-neutral-500">{Math.round((completedTasks.length / tasks.length) * 100 || 0)}% Done</span>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          placeholder="Add a new habit..." 
          className="w-full bg-onyx-800 border border-onyx-700 text-white text-sm rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1">
          +
        </button>
      </form>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {activeTasks.map(task => (
          <div key={task.id} className="group flex items-center gap-3 p-3 rounded-lg bg-onyx-800/40 hover:bg-onyx-800 transition-colors border border-transparent hover:border-onyx-700">
            <Checkbox checked={task.completed} onChange={() => onToggle(task.id)} />
            <span className="flex-1 text-sm text-neutral-200">{task.title}</span>
            <button 
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-opacity p-1"
              title="Delete Habit"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        {completedTasks.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-medium text-neutral-600 uppercase tracking-widest mb-2">Completed Today</h4>
            <div className="space-y-1 opacity-50">
              {completedTasks.map(task => (
                 <div key={task.id} className="group flex items-center gap-3 p-2 hover:bg-onyx-900 rounded transition-colors">
                   <Checkbox checked={task.completed} onChange={() => onToggle(task.id)} />
                   <span className="flex-1 text-sm text-neutral-500 line-through decoration-neutral-700">{task.title}</span>
                   <button 
                      onClick={() => onDelete(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-opacity p-1"
                      title="Delete Habit"
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
              ))}
            </div>
          </div>
        )}
        
        {tasks.length === 0 && (
            <div className="text-center py-10 text-neutral-600 italic text-sm border border-dashed border-onyx-800 rounded-lg">
                No rituals set. Start building habits.
            </div>
        )}
      </div>
    </div>
  );
};