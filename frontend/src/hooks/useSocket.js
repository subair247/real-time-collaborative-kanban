import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useTenant } from '../context/TenantContext';

export const useSocket = (eventHandlers = {}) => {
    const { currentTenant } = useTenant();

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !currentTenant) return;

        const handleConnect = () => {
            socket.emit('tenant:join', { tenantId: currentTenant.id });
        };

        socket.on('connect', handleConnect);

        Object.entries(eventHandlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off('connect', handleConnect);
            Object.entries(eventHandlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
        };
    }, [currentTenant?.id, eventHandlers]);
};