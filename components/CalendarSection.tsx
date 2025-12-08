import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { CalendarEvent, Task } from '../types';
import { Card } from './UIComponents';
import { Calendar as CalendarIcon, Clock, Plus, X, ChevronLeft, ChevronRight, Check, Trash2, Edit2 } from 'lucide-react';

interface CalendarSectionProps {
  events: CalendarEvent[];
  tasks: Task[]; // Pass all tasks to filter for calendar specific ones
  onAddEvent?: (event: Partial<CalendarEvent>) => void;
  onAddTask?: (task: Partial<Task>) => void;
  onUpdateEvent?: (id: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent?: (id: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDeleteTask?: (id: string) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({ 
  events, tasks, 
  onAddEvent, onAddTask, 
  onUpdateEvent, onDeleteEvent, 
  onUpdateTask, onDeleteTask 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal State
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [itemType, setItemType] = useState<'event' | 'task'>('event');
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Filter for Calendar-specific items
  const calendarTasks = tasks.filter(t => t.tags.includes('calendar_only') && !t.completed && t.dueDate);
  // Also checking for reminders that might have been assigned a date manually (though standard flow doesn't set one, this makes it robust)
  const remindersOnDate = tasks.filter(t => t.type === 'reminder' && !t.completed && t.dueDate);

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    // Do not open modal immediately.
    setModalMode('add');
    setItemType('event');
    setTitle('');
    setTime('');
    setEditItemId(null);
  };

  const openAddModal = () => {
    if (selectedDate) {
      setModalMode('add');
      setItemType('event'); // Default
      setTitle('');
      setTime('');
      setEditItemId(null);
      setIsModalOpen(true);
    }
  };

  const openEditModal = (id: string, type: 'event' | 'task', currentTitle: string, currentTime?: string) => {
    setModalMode('edit');
    setItemType(type);
    setEditItemId(id);
    setTitle(currentTitle);
    setTime(currentTime || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (modalMode === 'add') {
      if (itemType === 'event' && onAddEvent) {
        onAddEvent({
          title,
          date: dateStr,
          time: time || undefined
        });
      } else if (itemType === 'task' && onAddTask) {
        onAddTask({
          title,
          type: 'short_term',
          dueDate: dateStr,
          priority: 'Medium',
          tags: ['calendar_only'] // Tagging as requested so it stays here
        });
      }
    } else if (modalMode === 'edit' && editItemId) {
      if (itemType === 'event' && onUpdateEvent) {
        onUpdateEvent(editItemId, { title, time: time || undefined });
      } else if (itemType === 'task' && onUpdateTask) {
        onUpdateTask(editItemId, { title }); // Tasks here don't have time usually in this simplified view, but kept consistent
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 relative max-w-lg mx-auto">
      <Card className="p-3 bg-onyx-900 border-onyx-800">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 uppercase tracking-wider">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1 hover:bg-onyx-700 rounded text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-onyx-700 rounded text-neutral-400 hover:text-white transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        
        {/* Compact Grid - Reduced gaps */}
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-[9px] text-neutral-600 font-bold py-1">{day}</div>
          ))}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const hasEvent = events.some(e => e.date === dateStr);
            const hasTask = calendarTasks.some(t => t.dueDate === dateStr);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button 
                key={day.toString()} 
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-sm text-[10px] relative transition-colors
                  ${isToday(day) ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:bg-onyx-800'}
                  ${isSelected ? 'ring-1 ring-blue-500 bg-onyx-800 text-white' : ''}
                `}
              >
                <span>{format(day, 'd')}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {hasEvent && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-blue-600'}`}></span>}
                  {hasTask && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-green-400' : 'bg-green-600'}`}></span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-widest pl-1">
                {format(selectedDate, 'MMM d')} - Schedule
              </h3>
              <button 
                onClick={openAddModal}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-900/20 transition-colors"
              >
                <Plus size={14} /> Add Item
              </button>
           </div>
           
           <div className="space-y-2">
             {events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).map(e => (
               <div key={e.id} className="p-3 bg-onyx-900 border border-onyx-800 rounded-lg flex gap-3 items-center group">
                  <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                     <div className="text-sm text-white font-medium">{e.title}</div>
                     {e.time && <div className="text-xs text-neutral-500 flex items-center gap-1"><Clock size={10}/> {e.time}</div>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(e.id, 'event', e.title, e.time)} className="text-neutral-500 hover:text-white p-1"><Edit2 size={12}/></button>
                      <button onClick={() => onDeleteEvent && onDeleteEvent(e.id)} className="text-neutral-500 hover:text-red-400 p-1"><Trash2 size={12}/></button>
                  </div>
               </div>
             ))}
             {calendarTasks.filter(t => t.dueDate === format(selectedDate, 'yyyy-MM-dd')).map(t => (
               <div key={t.id} className="p-3 bg-onyx-900 border border-onyx-800 rounded-lg flex gap-3 items-center group">
                  <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                     <div className="text-sm text-white">{t.title}</div>
                     <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Task</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(t.id, 'task', t.title)} className="text-neutral-500 hover:text-white p-1"><Edit2 size={12}/></button>
                      <button onClick={() => onDeleteTask && onDeleteTask(t.id)} className="text-neutral-500 hover:text-red-400 p-1"><Trash2 size={12}/></button>
                  </div>
               </div>
             ))}
             {remindersOnDate.filter(t => t.dueDate === format(selectedDate, 'yyyy-MM-dd')).map(t => (
               <div key={t.id} className="p-3 bg-onyx-900 border border-onyx-800 rounded-lg flex gap-3 items-center group">
                  <div className="w-1 h-8 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{t.title}</div>
                    <span className="text-xs text-neutral-500">(Reminder)</span>
                  </div>
                  <button onClick={() => onDeleteTask && onDeleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1"><Trash2 size={12}/></button>
               </div>
             ))}

             {events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).length === 0 && 
              calendarTasks.filter(t => t.dueDate === format(selectedDate, 'yyyy-MM-dd')).length === 0 && 
              remindersOnDate.filter(t => t.dueDate === format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
                <div className="py-6 text-center border border-dashed border-onyx-800 rounded-lg">
                  <p className="text-xs text-neutral-600 italic">No plans for this day.</p>
                  <button onClick={openAddModal} className="mt-2 text-xs text-neutral-400 hover:text-white underline">Create one</button>
                </div>
             )}
           </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {isModalOpen && selectedDate && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <Card className="relative w-full max-w-sm bg-onyx-900 border-onyx-700 z-10 p-5 shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-neutral-500 hover:text-white">
                <X size={18} />
              </button>
              
              <h3 className="text-lg font-semibold text-white mb-1">
                {modalMode === 'add' ? 'Add Item' : 'Edit Item'}
              </h3>
              <p className="text-sm text-neutral-500 mb-4">{format(selectedDate, 'MMMM d, yyyy')}</p>

              {modalMode === 'add' && (
                <div className="flex bg-onyx-800 rounded-lg p-1 mb-4">
                  <button 
                    onClick={() => setItemType('event')}
                    className={`flex-1 py-1 text-sm rounded-md transition-all ${itemType === 'event' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                  >
                    Event
                  </button>
                  <button 
                    onClick={() => setItemType('task')}
                    className={`flex-1 py-1 text-sm rounded-md transition-all ${itemType === 'task' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                  >
                    Task
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-xs text-neutral-500 mb-1">Title</label>
                   <input 
                      autoFocus
                      className="w-full bg-onyx-800 border border-onyx-700 rounded p-2 text-white focus:outline-none focus:border-neutral-500"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={itemType === 'event' ? "Meeting..." : "Deadline..."}
                   />
                </div>
                
                {itemType === 'event' && (
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Time (Optional)</label>
                    <input 
                        type="time"
                        className="w-full bg-onyx-800 border border-onyx-700 rounded p-2 text-white focus:outline-none focus:border-neutral-500"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                )}

                <button type="submit" className="w-full bg-white text-black font-medium py-2 rounded-lg hover:bg-neutral-200 transition-colors">
                  {modalMode === 'add' ? `Add ${itemType === 'event' ? 'Event' : 'Task'}` : 'Save Changes'}
                </button>
                {modalMode === 'add' && itemType === 'task' && (
                  <p className="text-[10px] text-neutral-600 text-center">
                    Tasks added here will only appear in the calendar view.
                  </p>
                )}
              </form>
           </Card>
        </div>
      )}
    </div>
  );
};