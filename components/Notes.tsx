import React, { useState } from 'react';
import { Note } from '../types';
import { Card } from './UIComponents';
import { Notebook, Plus, Trash2, X, Save } from 'lucide-react';

interface NotesProps {
  notes: Note[];
  onAdd: (note: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
}

export const Notes: React.FC<NotesProps> = ({ notes, onAdd, onDelete, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd({
      title: newTitle,
      content: newContent,
      createdAt: Date.now()
    });
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Notebook size={20} className="text-neutral-400" />
          Notes & Ideas
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="p-2 rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <Card className="bg-onyx-900 border-onyx-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleAdd} className="space-y-4">
            <input 
              autoFocus
              className="w-full bg-transparent border-b border-onyx-700 pb-2 text-white font-medium placeholder-neutral-600 focus:outline-none focus:border-white"
              placeholder="Note Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea 
              className="w-full bg-onyx-800/50 rounded p-3 text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none min-h-[100px]"
              placeholder="Write your thoughts here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-neutral-200">
                <Save size={14} /> Save Note
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        {notes.map(note => (
          <div key={note.id} className="group bg-onyx-800 border border-onyx-700 rounded-lg p-5 hover:border-neutral-600 transition-all flex flex-col h-[200px]">
             <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-white truncate pr-4">{note.title}</h3>
                <button 
                  onClick={() => onDelete(note.id)}
                  className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
             </div>
             <textarea 
               className="flex-1 bg-transparent text-sm text-neutral-400 resize-none focus:outline-none focus:text-neutral-200"
               value={note.content}
               onChange={(e) => onUpdate(note.id, e.target.value)}
             />
             <div className="mt-2 text-[10px] text-neutral-600">
               {new Date(note.createdAt).toLocaleDateString()}
             </div>
          </div>
        ))}
        {notes.length === 0 && !isAdding && (
          <div className="col-span-full py-10 text-center text-neutral-600 border border-dashed border-onyx-800 rounded-lg">
            No notes yet. Capture your ideas.
          </div>
        )}
      </div>
    </div>
  );
};