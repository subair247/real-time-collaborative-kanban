const prisma = require('../config/database');

const requireTenant = async (req, res, next) => {
    try {
        const tenantId =
            req.headers['x-tenant-id'] ||
            req.params.tenantId ||
            req.body.tenant_id ||
            req.query.tenant_id;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant context (x-tenant-id) is required.' });
        }

        // Verify tenant exists
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { organization: true },
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant workspace not found.' });
        }

        // Check user membership for this specific tenant OR org-level admin membership
        const membership = req.memberships.find(
            (m) =>
                m.tenant_id === tenantId ||
                (m.organization_id === tenant.organization_id && m.role === 'Org Admin')
        );

        if (!membership) {
            return res.status(403).json({
                error: 'Forbidden: You do not have access to this tenant workspace (cross-tenant access blocked).',
            });
        }

        req.tenantId = tenantId;
        req.tenant = tenant;
        req.userRole = membership.role;
        req.activeMembership = membership;

        next();
    } catch (err) {
        console.error('Tenant middleware error:', err);
        return res.status(500).json({ error: 'Internal error checking tenant permissions.' });
    }
};

module.exports = { requireTenant };