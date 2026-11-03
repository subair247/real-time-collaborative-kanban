import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState([]);
    const [currentOrg, setCurrentOrg] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [currentTenant, setCurrentTenant] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setOrganizations([]);
            setCurrentOrg(null);
            setTenants([]);
            setCurrentTenant(null);
            return;
        }

        const loadOrgs = async () => {
            try {
                setLoading(true);
                const res = await api.get('/organizations');
                setOrganizations(res.data);

                if (res.data.length > 0) {
                    const savedOrgId = localStorage.getItem('activeOrgId');
                    const matchedOrg = res.data.find((o) => o.id === savedOrgId) || res.data[0];
                    setCurrentOrg(matchedOrg);
                }
            } catch (err) {
                console.error('Failed to load organizations:', err);
            } finally {
                setLoading(false);
            }
        };

        loadOrgs();
    }, [user]);

    useEffect(() => {
        if (!currentOrg) return;

        const loadTenants = async () => {
            try {
                setLoading(true);
                localStorage.setItem('activeOrgId', currentOrg.id);
                const res = await api.get(`/tenants?organization_id=${currentOrg.id}`);
                setTenants(res.data);

                if (res.data.length > 0) {
                    const savedTenantId = localStorage.getItem('activeTenantId');
                    const matchedTenant = res.data.find((t) => t.id === savedTenantId) || res.data[0];
                    switchTenant(matchedTenant);
                } else {
                    setCurrentTenant(null);
                    localStorage.removeItem('activeTenantId');
                }
            } catch (err) {
                console.error('Failed to load tenants:', err);
            } finally {
                setLoading(false);
            }
        };

        loadTenants();
    }, [currentOrg]);

    const switchOrg = (orgId) => {
        const org = organizations.find((o) => o.id === orgId);
        if (org) {
            setCurrentOrg(org);
        }
    };

    const switchTenant = (tenant) => {
        setCurrentTenant(tenant);
        localStorage.setItem('activeTenantId', tenant.id);

        const socket = getSocket();
        if (socket && socket.connected) {
            socket.emit('tenant:join', { tenantId: tenant.id });
        }
    };

    return (
        <TenantContext.Provider
            value={{
                organizations,
                currentOrg,
                tenants,
                currentTenant,
                loading,
                switchOrg,
                switchTenant,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);