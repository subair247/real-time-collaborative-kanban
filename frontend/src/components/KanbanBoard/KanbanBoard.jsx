import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import BoardColumn from '../BoardColumn/BoardColumn';
import TaskDetails from '../TaskDetails/TaskDetails';
import AIAssistant from '../AIAssistant/AIAssistant';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useTenant } from '../../context/TenantContext';
import { Undo2, Redo2, RefreshCw, Sparkles } from 'lucide-react';

export const KanbanBoard = ({ boardId, onBoardLoaded }) => {
    const { currentTenant } = useTenant();
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const { canUndo, canRedo, undo, redo, recordAction } = useUndoRedo();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    };

    const fetchBoardData = async () => {
        try {
            setLoading(true);
            const [boardRes, tasksRes] = await Promise.all([
                api.get(`/boards/${boardId}`),
                api.get(`/tasks?board_id=${boardId}`),
            ]);

            setBoard(boardRes.data);
            setColumns(boardRes.data.columns || []);
            setTasks(tasksRes.data || []);
            if (onBoardLoaded) onBoardLoaded(boardRes.data);
        } catch (err) {
            console.error('Failed to load board data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (boardId) {
            fetchBoardData();
        }
    }, [boardId, currentTenant?.id]);

    useSocket({
        'task:created': (newTask) => {
            if (newTask.board_id === boardId) {
                setTasks((prev) => [...prev.filter((t) => t.id !== newTask.id), newTask]);
            }
        },
        'task:updated': (updatedTask) => {
            if (updatedTask.board_id === boardId) {
                setTasks((prev) =>
                    prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
                );
            }
        },
        'task:moved': (movedTask) => {
            if (movedTask.board_id === boardId) {
                setTasks((prev) =>
                    prev.map((t) => (t.id === movedTask.id ? movedTask : t))
                );
            }
        },
        'task:deleted': ({ id }) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
        },
        connect: () => {
            fetchBoardData();
        },
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) handleUndo();
            } else if (
                ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
            ) {
                e.preventDefault();
                if (canRedo) handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo]);

    const handleUndo = async () => {
        showToast('↩ Undone recent task move');
        await undo();
    };

    const handleRedo = async () => {
        showToast('↪ Redone task move');
        await redo();
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeTaskId = active.id;
        const overId = over.id;

        const activeTask = tasks.find((t) => t.id === activeTaskId);
        if (!activeTask) return;

        let destColumnId = overId;
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
            destColumnId = overTask.column_id;
        }

        const previousColumnId = activeTask.column_id;
        const previousPosition = activeTask.position;

        const destTasks = tasks.filter((t) => t.column_id === destColumnId && t.id !== activeTaskId);
        const newPosition = destTasks.length + 1;

        if (previousColumnId === destColumnId && previousPosition === newPosition) {
            return;
        }

        const previousTasksState = [...tasks];
        setTasks((prev) =>
            prev.map((t) =>
                t.id === activeTaskId
                    ? { ...t, column_id: destColumnId, position: newPosition, version: t.version + 1 }
                    : t
            )
        );

        try {
            const res = await api.patch(`/tasks/${activeTaskId}/move`, {
                destination_column_id: destColumnId,
                new_position: newPosition,
                expected_version: activeTask.version,
            });

            setTasks((prev) => prev.map((t) => (t.id === activeTaskId ? res.data : t)));

            recordAction({
                type: 'MOVE_TASK',
                taskId: activeTaskId,
                fromColumnId: previousColumnId,
                toColumnId: destColumnId,
                undo: async () => {
                    setTasks((prev) =>
                        prev.map((t) =>
                            t.id === activeTaskId
                                ? { ...t, column_id: previousColumnId, position: previousPosition }
                                : t
                        )
                    );
                    await api.patch(`/tasks/${activeTaskId}/move`, {
                        destination_column_id: previousColumnId,
                        new_position: previousPosition,
                    });
                    fetchBoardData();
                },
                redo: async () => {
                    setTasks((prev) =>
                        prev.map((t) =>
                            t.id === activeTaskId
                                ? { ...t, column_id: destColumnId, position: newPosition }
                                : t
                        )
                    );
                    await api.patch(`/tasks/${activeTaskId}/move`, {
                        destination_column_id: destColumnId,
                        new_position: newPosition,
                    });
                    fetchBoardData();
                },
            });
        } catch (err) {
            setTasks(previousTasksState);
            if (err.response && err.response.status === 409) {
                alert('Conflict: Another user moved this task. Board was refreshed with latest server state.');
                fetchBoardData();
            } else {
                alert('Failed to move task: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleCreateTask = async (columnId) => {
        const title = prompt('Enter new task title:');
        if (!title || !title.trim()) return;

        try {
            const res = await api.post('/tasks', {
                title: title.trim(),
                board_id: boardId,
                column_id: columnId,
                tenant_id: currentTenant.id,
            });
            setTasks((prev) => [...prev, res.data]);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create task');
        }
    };

    const handleUpdateTask = async (taskId, updateData) => {
        const res = await api.put(`/tasks/${taskId}`, updateData);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
        setSelectedTask(null);
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            setSelectedTask(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete task');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-medium">Loading collaborative board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="px-6 py-3 border-b border-slate-200/80 bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={handleUndo}
                            disabled={!canUndo}
                            title="Undo recent move (Ctrl+Z)"
                            className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors shadow-2xs"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={!canRedo}
                            title="Redo move (Ctrl+Y or Ctrl+Shift+Z)"
                            className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors shadow-2xs"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                    </div>

                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                        Live real-time synchronization active
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsAiOpen(true)}
                        title="Ask AI about this board"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Assistant</span>
                    </button>

                    <button
                        onClick={fetchBoardData}
                        title="Refresh board state"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync Board</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto p-6 bg-slate-50">
                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <div className="flex space-x-4 items-start min-h-full">
                        {columns.map((col) => {
                            const colTasks = tasks.filter((t) => t.column_id === col.id);
                            return (
                                <BoardColumn
                                    key={col.id}
                                    column={col}
                                    tasks={colTasks}
                                    onTaskClick={(t) => setSelectedTask(t)}
                                    onAddTask={handleCreateTask}
                                />
                            );
                        })}
                    </div>
                </DndContext>
            </div>

            {selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    columns={columns}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            )}

            <AIAssistant
                isOpen={isAiOpen}
                onClose={() => setIsAiOpen(false)}
                boardId={boardId}
            />

            {toast && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl z-50 flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xs">
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;