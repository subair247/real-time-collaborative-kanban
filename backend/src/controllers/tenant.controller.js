const tenantService = require('../services/tenant.service');
const activityService = require('../services/activity.service');
const { createTenantSchema } = require('../utils/validators');

const createTenant = async (req, res) => {
    try {
        const validated = createTenantSchema.parse(req.body);
        const tenant = await tenantService.createTenant({ ...validated, userId: req.user.id });
        return res.status(201).json(tenant);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const getAuthorizedTenants = async (req, res) => {
    try {
        const { organization_id } = req.query;
        if (!organization_id) {
            return res.status(400).json({ error: 'organization_id query parameter is required.' });
        }
        const tenants = await tenantService.getAuthorizedTenants(req.user.id, organization_id);
        return res.status(200).json(tenants);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getTenantById = async (req, res) => {
    try {
        const tenant = await tenantService.getTenantById(req.params.id, req.user.id);
        return res.status(200).json(tenant);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const getTenantActivities = async (req, res) => {
    try {
        const activities = await activityService.getTenantActivities(req.params.id);
        return res.status(200).json(activities);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const updateTenant = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Tenant name must be at least 2 characters.' });
        }
        const updated = await tenantService.updateTenant(req.params.id, { name });
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const deleteTenant = async (req, res) => {
    try {
        await tenantService.deleteTenant(req.params.id);
        return res.status(200).json({ message: 'Tenant branch deleted.' });
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

module.exports = {
    createTenant,
    getAuthorizedTenants,
    getTenantById,
    getTenantActivities,
    updateTenant,
    deleteTenant,
};