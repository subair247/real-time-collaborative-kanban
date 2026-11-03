import React, { useState } from 'react';
import api from '../../services/api';
import { useTenant } from '../../context/TenantContext';
import { Sparkles, X, Send } from 'lucide-react';

export const AIAssistant = ({ isOpen, onClose, boardId }) => {
    const { currentTenant } = useTenant();
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            text: `Hello! I am your AI Kanban Assistant for ${currentTenant?.name || 'this branch'}. How can I assist with your tasks today?`,
        },
    ]);
    const [loading, setLoading] = useState(false);

    const handleAsk = async (textToSend) => {
        const q = textToSend || question;
        if (!q.trim()) return;

        const userMsg = { sender: 'user', text: q };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion('');
        setLoading(true);

        try {
            const res = await api.post('/ai/ask', {
                question: q,
                board_id: boardId,
            });

            setMessages((prev) => [
                ...prev,
                {
                    sender: 'ai',
                    text: res.data.answer,
                    tools: res.data.tools_executed,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'ai',
                    text: 'Sorry, could not process query right now. Ensure ai-service is running on port 8000.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">AI Kanban Assistant</h3>
                        <p className="text-[10px] text-slate-400">Scoped to 📍 {currentTenant?.name}</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${m.sender === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-xs'
                                    : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60 whitespace-pre-line'
                                }`}
                        >
                            {m.text}
                        </div>
                        {m.tools && m.tools.length > 0 && (
                            <span className="text-[9px] text-indigo-500 font-bold mt-1 px-1">
                                🛠️ Tool used: {m.tools.join(', ')}
                            </span>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="text-xs text-slate-400 flex items-center space-x-2 p-2 italic">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                        <span>Analyzing tenant workspace data...</span>
                    </div>
                )}
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5">
                <button
                    onClick={() => handleAsk('Summarize board progress')}
                    className="text-[10px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
                >
                    📊 Summarize Progress
                </button>
                <button
                    onClick={() => handleAsk('Show pending tasks')}
                    className="text-[10px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
                >
                    ⏳ Pending Tasks
                </button>
                <button
                    onClick={() => handleAsk('Recent activity')}
                    className="text-[10px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
                >
                    🕒 Recent Activities
                </button>
            </div>

            {/* Input */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAsk();
                }}
                className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
            >
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask AI about this board..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-40 shadow-xs hover:bg-indigo-700 transition-colors"
                >
                    <Send className="w-3.5 h-3.5" />
                </button>
            </form>
        </div>
    );
};

export default AIAssistant;