import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import KanbanBoard from '../components/KanbanBoard/KanbanBoard';
import ActivityLog from '../components/ActivityLog/ActivityLog';
import api from '../services/api';
import { useTenant } from '../context/TenantContext';
import { Plus } from 'lucide-react';

export const Board = () => {
    const { currentTenant } = useTenant();
    const [boards, setBoards] = useState([]);
    const [activeBoardId, setActiveBoardId] = useState(null);
    const [activeBoardName, setActiveBoardName] = useState('');
    const [activeTab, setActiveTab] = useState('boards');

    useEffect(() => {
        if (!currentTenant) return;

        const fetchBoards = async () => {
            try {
                const res = await api.get(`/boards?tenant_id=${currentTenant.id}`);
                setBoards(res.data);
                if (res.data.length > 0) {
                    setActiveBoardId(res.data[0].id);
                    setActiveBoardName(res.data[0].name);
                } else {
                    setActiveBoardId(null);
                    setActiveBoardName('');
                }
            } catch (err) {
                console.error('Failed to load boards for tenant:', err);
            }
        };

        fetchBoards();
    }, [currentTenant?.id]);

    const handleSelectBoard = (boardId) => {
        const selected = boards.find((b) => b.id === boardId);
        if (selected) {
            setActiveBoardId(selected.id);
            setActiveBoardName(selected.name);
            setActiveTab('boards');
        }
    };

    const handleCreateBoard = async () => {
        const name = prompt('Enter new board name:');
        if (!name || !name.trim()) return;

        try {
            const res = await api.post('/boards', {
                name: name.trim(),
                description: 'New collaborative board',
                organization_id: currentTenant.organization_id,
                tenant_id: currentTenant.id,
            });

            setBoards((prev) => [...prev, res.data]);
            setActiveBoardId(res.data.id);
            setActiveBoardName(res.data.name);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create board');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar activeBoardName={activeBoardName} />

            <div className="flex flex-1">
                <Sidebar
                    boards={boards}
                    activeBoardId={activeBoardId}
                    onSelectBoard={handleSelectBoard}
                    activeTab={activeTab}
                    onSelectTab={setActiveTab}
                />

                <main className="flex-1 flex flex-col overflow-hidden">
                    {activeTab === 'activity' ? (
                        <div className="p-8 overflow-y-auto flex-1">
                            <ActivityLog />
                        </div>
                    ) : activeBoardId ? (
                        <KanbanBoard
                            boardId={activeBoardId}
                            onBoardLoaded={(b) => setActiveBoardName(b.name)}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <h3 className="text-lg font-bold text-slate-700">No boards in this branch yet</h3>
                            <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm">
                                Create a new board to start collaborating with your team in {currentTenant?.name}.
                            </p>
                            <button
                                onClick={handleCreateBoard}
                                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create First Board</span>
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Board;