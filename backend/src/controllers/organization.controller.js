const orgService = require('../services/organization.service');
const { createOrgSchema } = require('../utils/validators');

const createOrganization = async (req, res) => {
    try {
        const validated = createOrgSchema.parse(req.body);
        const org = await orgService.createOrganization({ ...validated, userId: req.user.id });
        return res.status(201).json(org);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const getAuthorizedOrganizations = async (req, res) => {
    try {
        const orgs = await orgService.getAuthorizedOrganizations(req.user.id);
        return res.status(200).json(orgs);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getOrganizationById = async (req, res) => {
    try {
        const org = await orgService.getOrganizationById(req.params.id, req.user.id);
        return res.status(200).json(org);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const updateOrganization = async (req, res) => {
    try {
        const validated = createOrgSchema.parse(req.body);
        const updated = await orgService.updateOrganization(req.params.id, validated);
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const deleteOrganization = async (req, res) => {
    try {
        await orgService.deleteOrganization(req.params.id);
        return res.status(200).json({ message: 'Organization deleted.' });
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

module.exports = {
    createOrganization,
    getAuthorizedOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
};
