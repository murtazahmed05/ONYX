import React, { useState } from 'react';
import { Task } from '../types';
import { Card } from './UIComponents';
import { Bell, Plus, X, Clock, Trash2 } from 'lucide-react';

interface RemindersProps {
  reminders: Task[];
  onToggle: (id: string) => void;
  onAdd: (task: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export const Reminders: React.FC<RemindersProps> = ({ reminders, onToggle, onAdd, onDelete }) => {
  const [newReminder, setNewReminder] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReminder.trim()) {
      onAdd({
        title: newReminder,
        type: 'reminder',
        priority: 'Medium',
        tags: [],
        dueTime: reminderTime || undefined,
        dueDate: new Date().toISOString().split('T')[0] // Default to today
      });
      setNewReminder('');
      setReminderTime('');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Bell size={20} className="text-neutral-400" />
          Reminders
        </h2>
        <span className="text-xs text-neutral-500">{activeReminders.length} Active</span>
      </div>

      <Card className="p-0 overflow-hidden bg-onyx-900 border-onyx-800">
         <form onSubmit={handleSubmit} className="flex flex-col md:flex-row border-b border-onyx-800">
            <input 
              className="flex-1 bg-transparent p-4 text-white placeholder-neutral-600 focus:outline-none"
              placeholder="Add a new reminder..."
              value={newReminder}
              onChange={e => setNewReminder(e.target.value)}
            />
            <div className="flex items-center border-t md:border-t-0 md:border-l border-onyx-800">
               <input 
                 type="time"
                 className="bg-transparent p-4 text-neutral-400 focus:text-white focus:outline-none"
                 value={reminderTime}
                 onChange={e => setReminderTime(e.target.value)}
                 title="Set time"
               />
               <button type="submit" className="px-6 py-4 text-neutral-400 hover:text-white hover:bg-onyx-800 transition-colors border-l border-onyx-800">
                  <Plus size={20} />
               </button>
            </div>
         </form>
         
         <div className="divide-y divide-onyx-800">
            {activeReminders.map(reminder => (
               <div key={reminder.id} className="p-4 flex items-center gap-3 group hover:bg-onyx-800 transition-colors">
                  <div className="flex-1">
                     <div className="text-neutral-200 font-medium">{reminder.title}</div>
                     {reminder.dueTime && (
                       <div className="flex items-center gap-1 text-xs text-blue-400 mt-1">
                         <Clock size={12} /> {reminder.dueTime}
                       </div>
                     )}
                  </div>
                  <button 
                     onClick={() => onToggle(reminder.id)} 
                     className="text-xs border border-onyx-600 rounded px-3 py-1 text-neutral-400 hover:bg-white hover:text-black hover:border-white transition-all"
                  >
                     Done
                  </button>
                  <button onClick={() => onDelete(reminder.id)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400">
                     <X size={16} />
                  </button>
               </div>
            ))}
            {activeReminders.length === 0 && (
               <div className="p-6 text-center text-neutral-600 text-sm">No active reminders.</div>
            )}
         </div>
      </Card>
      
      {completedReminders.length > 0 && (
         <div className="opacity-60">
            <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-3">Recently Completed</h3>
            <div className="space-y-2">
               {completedReminders.slice(0, 5).map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-2 p-2 rounded bg-onyx-900/50 hover:bg-onyx-900 transition-colors group">
                     <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></div>
                     <span className="text-sm text-neutral-500 line-through decoration-neutral-700 flex-1">{reminder.title}</span>
                     <button onClick={() => onDelete(reminder.id)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                     </button>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};
