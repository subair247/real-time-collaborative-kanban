import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, Kanban, Users, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
    const { currentOrg, tenants, currentTenant, switchTenant } = useTenant();
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar activeBoardName="Workspace Overview" />

            <div className="flex flex-1">
                <Sidebar
                    boards={[]}
                    activeBoardId={null}
                    onSelectBoard={() => navigate('/board')}
                    activeTab="dashboard"
                    onSelectTab={(tab) => {
                        if (tab === 'boards' || tab === 'activity') navigate('/board');
                    }}
                />

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-lg shadow-indigo-100 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 bg-indigo-500/30 px-3 py-1 rounded-full">
                                    Organization Dashboard
                                </span>
                                <h1 className="text-2xl font-bold mt-2">
                                    Welcome, {user?.name || 'Engineer'}!
                                </h1>
                                <p className="text-xs text-indigo-100 mt-1 max-w-lg">
                                    You are collaborating under <span className="font-semibold text-white">{currentOrg?.name}</span> with strict multi-tenant branch isolation.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/board')}
                                className="flex items-center space-x-2 bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                            >
                                <span>Open Kanban Board</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Organization</p>
                                    <p className="text-base font-bold text-slate-800">{currentOrg?.name || 'ABC Technologies'}</p>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Active Branch</p>
                                    <p className="text-base font-bold text-slate-800">{currentTenant?.name || 'Hyderabad'}</p>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                    <Kanban className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Collaboration Mode</p>
                                    <p className="text-base font-bold text-slate-800">Real-Time Sync</p>
                                </div>
                            </div>
                        </div>

                        {/* Branch Workspaces List */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Authorized Branch Workspaces</h3>
                                    <p className="text-xs text-slate-400">Select an isolated tenant workspace to manage tasks</p>
                                </div>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                                    {tenants.length} Branches Available
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tenants.map((t) => {
                                    const isCurrent = t.id === currentTenant?.id;
                                    return (
                                        <div
                                            key={t.id}
                                            className={`p-4 rounded-xl border transition-all flex items-center justify-between ${isCurrent
                                                    ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${isCurrent
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    📍
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                                                    <p className="text-[11px] text-slate-400">Tenant ID: {t.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    switchTenant(t);
                                                    navigate('/board');
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isCurrent
                                                        ? 'bg-indigo-600 text-white shadow-xs'
                                                        : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'
                                                    }`}
                                            >
                                                {isCurrent ? 'Active Board' : 'Switch & Open'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;