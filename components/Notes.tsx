import React, { useState } from 'react';
import { Note } from '../types';
import { Card } from './UIComponents';
import { Notebook, Plus, Trash2, X, Save, Maximize2 } from 'lucide-react';

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
  
  // Expanded Note State
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');

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

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditContent(note.content);
  };

  const handleSaveExpanded = () => {
    if (selectedNote) {
      onUpdate(selectedNote.id, editContent);
      setSelectedNote(null);
    }
  };

  const handleDeleteExpanded = () => {
    if (selectedNote) {
        onDelete(selectedNote.id);
        setSelectedNote(null);
    }
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
          <div 
            key={note.id} 
            className="group bg-onyx-800 border border-onyx-700 rounded-lg p-5 hover:border-neutral-600 transition-all flex flex-col h-[200px] cursor-pointer"
            onClick={() => openNote(note)}
          >
             <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-white truncate pr-4">{note.title}</h3>
                <div className="flex gap-2">
                    <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                    className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Note"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>
             </div>
             <div className="flex-1 overflow-hidden relative">
               <p className="text-sm text-neutral-400 whitespace-pre-wrap line-clamp-6">{note.content}</p>
               <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-onyx-800 to-transparent"></div>
             </div>
             <div className="mt-2 text-[10px] text-neutral-600 flex justify-between items-center">
               <span>{new Date(note.createdAt).toLocaleDateString()}</span>
               <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">Click to view</span>
             </div>
          </div>
        ))}
        {notes.length === 0 && !isAdding && (
          <div className="col-span-full py-10 text-center text-neutral-600 border border-dashed border-onyx-800 rounded-lg">
            No notes yet. Capture your ideas.
          </div>
        )}
      </div>

      {/* Expanded Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-onyx-900 border border-onyx-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-onyx-800">
                    <h3 className="text-lg font-bold text-white">{selectedNote.title}</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDeleteExpanded} 
                            className="text-neutral-500 hover:text-red-400 p-1"
                            title="Delete Note"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button onClick={() => setSelectedNote(null)} className="text-neutral-500 hover:text-white p-1">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <textarea 
                        className="w-full h-full min-h-[300px] bg-transparent text-neutral-200 resize-none focus:outline-none p-2 leading-relaxed"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Start typing..."
                    />
                </div>
                <div className="p-4 border-t border-onyx-800 flex justify-end gap-3">
                    <span className="text-xs text-neutral-500 self-center mr-auto">
                        Created: {new Date(selectedNote.createdAt).toLocaleString()}
                    </span>
                    <button onClick={() => setSelectedNote(null)} className="px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
                    <button onClick={handleSaveExpanded} className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-neutral-200">Save Changes</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};