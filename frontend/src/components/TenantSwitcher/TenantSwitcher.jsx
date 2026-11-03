import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { ChevronDown } from 'lucide-react';

export const TenantSwitcher = () => {
    const { tenants, currentTenant, switchTenant } = useTenant();

    if (!currentTenant) return null;

    return (
        <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                Branch (Tenant)
            </label>
            <div className="relative">
                <select
                    value={currentTenant.id}
                    onChange={(e) => {
                        const selected = tenants.find((t) => t.id === e.target.value);
                        if (selected) switchTenant(selected);
                    }}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2 pr-8 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                    {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                            📍 {t.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
        </div>
    );
};

export default TenantSwitcher;