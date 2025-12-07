import React, { useState, useRef, useEffect } from 'react';
import { AppState, ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Card } from './UIComponents';
import { MessageSquare, Send, Bot, User, X, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  appState: AppState;
  onClose?: () => void;
  isMobile?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ appState, onClose, isMobile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: 'Systems online. How can I assist with your productivity today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToGemini(messages, input, appState);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className={`flex flex-col h-full bg-onyx-950 ${isMobile ? '' : 'border-l border-onyx-800'}`}>
      {/* Header */}
      <div className="p-4 border-b border-onyx-800 flex justify-between items-center bg-onyx-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-white" />
          <h3 className="font-semibold text-white">Onyx AI</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'model' ? 'bg-white text-black' : 'bg-onyx-700 text-neutral-300'}
            `}>
              {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`
              max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'model' 
                ? 'bg-onyx-800 text-neutral-200 rounded-tl-none border border-onyx-700' 
                : 'bg-white text-black rounded-tr-none'
              }
            `}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0"><Bot size={16}/></div>
             <div className="bg-onyx-800 text-neutral-400 p-3 rounded-2xl rounded-tl-none border border-onyx-700 flex items-center gap-2">
               <Loader2 size={14} className="animate-spin"/> Thinking...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-onyx-800 bg-onyx-950">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            className="w-full bg-onyx-900 border border-onyx-700 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
            placeholder="Ask about your schedule..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-full hover:bg-neutral-200 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
