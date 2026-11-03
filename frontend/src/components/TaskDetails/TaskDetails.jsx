import React, { useState } from 'react';
import { X, Trash2, ShieldAlert, Clock } from 'lucide-react';

export const TaskDetails = ({ task, columns, onClose, onUpdate, onDelete }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [columnId, setColumnId] = useState(task.column_id);
    const [conflictWarning, setConflictWarning] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setConflictWarning(null);

        try {
            await onUpdate(task.id, {
                title,
                description,
                column_id: columnId,
                expected_version: task.version,
            });
            onClose();
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setConflictWarning(
                    err.response.data.error ||
                    'Conflict detected: Another user modified this task simultaneously. Please refresh to load latest server state.'
                );
            } else {
                alert(err.response?.data?.error || 'Failed to update task');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Version {task.version}
                        </span>
                        <span className="text-xs font-medium text-slate-400">ID: {task.id.slice(0, 8)}...</span>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => onDelete(task.id)}
                            title="Delete task"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {conflictWarning && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-xs text-amber-800">
                        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Concurrency Conflict (HTTP 409)</p>
                            <p className="mt-0.5">{conflictWarning}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSave} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Task Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Status Column
                        </label>
                        <select
                            value={columnId}
                            onChange={(e) => setColumnId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {columns.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Description
                        </label>
                        <textarea
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add detailed task notes or collaboration context..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div>
                            <span className="font-semibold text-slate-700">Assignee:</span>{' '}
                            {task.assignee?.name || 'Unassigned'}
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskDetails;