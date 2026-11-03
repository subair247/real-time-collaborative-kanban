import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { ChevronDown } from 'lucide-react';

export const OrganizationSelector = () => {
    const { organizations, currentOrg, switchOrg } = useTenant();

    if (!currentOrg) return null;

    return (
        <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                Organization
            </label>
            <div className="relative">
                <select
                    value={currentOrg.id}
                    onChange={(e) => switchOrg(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2 pr-8 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                    {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                            {org.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
        </div>
    );
};

export default OrganizationSelector;