import React, { useState, useEffect } from 'react';
import { getSocket } from '../../services/socket';
import { useTenant } from '../../context/TenantContext';

export const PresenceIndicator = () => {
    const { currentTenant } = useTenant();
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handlePresence = (data) => {
            if (data && Array.isArray(data.onlineUsers)) {
                setOnlineUsers(data.onlineUsers);
            }
        };

        socket.on('presence:update', handlePresence);

        return () => {
            socket.off('presence:update', handlePresence);
        };
    }, [currentTenant?.id]);

    if (onlineUsers.length === 0) {
        return null;
    }

    const colors = [
        'bg-emerald-500',
        'bg-indigo-500',
        'bg-amber-500',
        'bg-rose-500',
        'bg-cyan-500',
    ];

    return (
        <div className="flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
            <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-700">
                    {onlineUsers.length} online
                </span>
            </div>

            <div className="flex -space-x-1.5 overflow-hidden pl-1">
                {onlineUsers.map((u, idx) => (
                    <div
                        key={u.id}
                        title={`${u.name} (${u.email})`}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white ring-2 ring-white ${colors[idx % colors.length]
                            }`}
                    >
                        {u.name.charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PresenceIndicator;