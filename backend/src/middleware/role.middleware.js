const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        // Org Admin always has global management permissions
        const isOrgAdmin = req.memberships && req.memberships.some((m) => m.role === 'Org Admin');

        if (isOrgAdmin && allowedRoles.includes('Org Admin')) {
            return next();
        }

        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                error: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.userRole || 'None'}`,
            });
        }

        next();
    };
};

module.exports = { requireRole };