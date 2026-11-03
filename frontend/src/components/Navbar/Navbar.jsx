import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import PresenceIndicator from '../PresenceIndicator/PresenceIndicator';
import { LogOut, Shield } from 'lucide-react';

export const Navbar = ({ activeBoardName }) => {
    const { user, logout } = useAuth();
    const { currentOrg, currentTenant } = useTenant();

    const activeMembership = user?.memberships?.find(
        (m) =>
            m.tenant_id === currentTenant?.id ||
            (m.organization_id === currentOrg?.id && m.role === 'Org Admin')
    );
    const currentRole = activeMembership?.role || 'Member';

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center space-x-2 text-sm">
                <span className="font-semibold text-slate-800">{currentOrg?.name || 'Organization'}</span>
                <span className="text-slate-400">/</span>
                <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                    {currentTenant?.name || 'Branch'}
                </span>
                {activeBoardName && (
                    <>
                        <span className="text-slate-400">/</span>
                        <span className="font-semibold text-slate-700">{activeBoardName}</span>
                    </>
                )}
            </div>

            <div className="flex items-center space-x-4">
                <PresenceIndicator />

                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{currentRole}</span>
                </div>

                <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        title="Log out"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;