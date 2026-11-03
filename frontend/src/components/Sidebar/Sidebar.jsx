import React from 'react';
import OrganizationSelector from '../OrganizationSelector/OrganizationSelector';
import TenantSwitcher from '../TenantSwitcher/TenantSwitcher';
import { Kanban, Activity } from 'lucide-react';

export const Sidebar = ({ boards, activeBoardId, onSelectBoard, activeTab, onSelectTab }) => {
    return (
        <aside className="w-64 bg-slate-50 border-r border-slate-200 h-[calc(100vh-4rem)] flex flex-col justify-between p-4 sticky top-16">
            <div className="space-y-6">
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                    <OrganizationSelector />
                    <TenantSwitcher />
                </div>

                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                        Navigation
                    </label>
                    <nav className="space-y-1">
                        <button
                            onClick={() => onSelectTab('boards')}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'boards'
                                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <Kanban className="w-4 h-4" />
                            <span>Kanban Boards</span>
                        </button>

                        <button
                            onClick={() => onSelectTab('activity')}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'activity'
                                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <Activity className="w-4 h-4" />
                            <span>Activity History</span>
                        </button>
                    </nav>
                </div>

                {activeTab === 'boards' && (
                    <div>
                        <div className="flex items-center justify-between mb-2 px-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Tenant Boards ({boards.length})
                            </label>
                        </div>
                        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                            {boards.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => onSelectBoard(b.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${activeBoardId === b.id
                                            ? 'bg-slate-200/70 text-slate-900 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <span className="truncate pr-2">{b.name}</span>
                                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-full text-slate-600 font-bold">
                                        {b._count?.tasks ?? b.columns?.reduce((acc, c) => acc + (c.tasks?.length || 0), 0) ?? 0}
                                    </span>
                                </button>
                            ))}
                            {boards.length === 0 && (
                                <p className="text-xs text-slate-400 italic px-2 py-1">No boards in this branch.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-3 border-t border-slate-200 text-center">
                <p className="text-[11px] text-slate-400 font-medium">JulleyOnline Collaborative Kanban</p>
                <p className="text-[10px] text-slate-400">Strict Tenant-Level Isolation Active</p>
            </div>
        </aside>
    );
};

export default Sidebar;