import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTenant } from '../../context/TenantContext';
import { useSocket } from '../../hooks/useSocket';
import { Clock, PlusCircle, ArrowRight, Edit3, Trash2, RefreshCw } from 'lucide-react';

export const ActivityLog = () => {
    const { currentTenant } = useTenant();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        if (!currentTenant) return;
        try {
            setLoading(true);
            const res = await api.get(`/tenants/${currentTenant.id}/activities`);
            setLogs(res.data || []);
        } catch (err) {
            console.error('Failed to load activity logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [currentTenant?.id]);

    // Real-time audit log auto-refresh when changes happen
    useSocket({
        'task:created': () => fetchLogs(),
        'task:updated': () => fetchLogs(),
        'task:moved': () => fetchLogs(),
        'task:deleted': () => fetchLogs(),
    });

    const getActionIcon = (action) => {
        switch (action) {
            case 'Created':
                return <PlusCircle className="w-4 h-4 text-emerald-500" />;
            case 'Moved':
                return <ArrowRight className="w-4 h-4 text-indigo-500" />;
            case 'Updated':
                return <Edit3 className="w-4 h-4 text-amber-500" />;
            case 'Deleted':
                return <Trash2 className="w-4 h-4 text-rose-500" />;
            default:
                return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const formatLogMessage = (log) => {
        const userName = log.user?.name || 'Team Member';
        const title = log.details?.title || log.details?.name || 'Task';

        if (log.action === 'Moved') {
            const fromCol = log.details?.from_column || 'Column';
            const toCol = log.details?.to_column || 'Column';
            return (
                <span>
                    <span className="font-bold text-slate-900">{userName}</span> moved task{' '}
                    <span className="font-semibold text-indigo-600">"{title}"</span> from{' '}
                    <span className="font-medium text-slate-700">{fromCol}</span> to{' '}
                    <span className="font-medium text-slate-700">{toCol}</span>
                </span>
            );
        }

        if (log.action === 'Created') {
            const col = log.details?.column || 'Board';
            return (
                <span>
                    <span className="font-bold text-slate-900">{userName}</span> created new task{' '}
                    <span className="font-semibold text-indigo-600">"{title}"</span> in column{' '}
                    <span className="font-medium text-slate-700">{col}</span>
                </span>
            );
        }

        if (log.action === 'Updated') {
            return (
                <span>
                    <span className="font-bold text-slate-900">{userName}</span> updated task details for{' '}
                    <span className="font-semibold text-indigo-600">"{title}"</span>
                </span>
            );
        }

        if (log.action === 'Deleted') {
            return (
                <span>
                    <span className="font-bold text-slate-900">{userName}</span> deleted task{' '}
                    <span className="font-semibold text-rose-600">"{title}"</span>
                </span>
            );
        }

        return (
            <span>
                <span className="font-bold text-slate-900">{userName}</span> performed {log.action} on{' '}
                <span className="font-semibold text-indigo-600">"{title}"</span>
            </span>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Branch Activity History & Audit Trail</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Server-persisted audit log from PostgreSQL <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded text-[11px]">activity_logs</code> table
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        📍 {currentTenant?.name || 'Workspace'}
                    </span>
                    <button
                        onClick={fetchLogs}
                        title="Refresh logs"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">Loading live audit trail...</div>
            ) : logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">No activity recorded for this branch yet.</div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-start space-x-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/80 bg-slate-50/30"
                        >
                            <div className="mt-0.5 p-1.5 bg-white rounded-lg shadow-2xs border border-slate-200/60">
                                {getActionIcon(log.action)}
                            </div>
                            <div className="flex-1 text-xs">
                                <p className="text-slate-700 leading-relaxed">{formatLogMessage(log)}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {new Date(log.created_at).toLocaleString()}
                                    </span>
                                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                        {log.action}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityLog;