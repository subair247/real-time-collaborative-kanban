const prisma = require('../config/database');

const logActivity = async ({ tenant_id, user_id, entity_type, entity_id, action, details }) => {
    try {
        return await prisma.activityLog.create({
            data: {
                tenant_id,
                user_id,
                entity_type,
                entity_id,
                action,
                details: details || {},
            },
        });
    } catch (err) {
        console.error('Failed to write activity log:', err);
    }
};

const getTenantActivities = async (tenant_id, limit = 50) => {
    return prisma.activityLog.findMany({
        where: { tenant_id },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
    });
};

module.exports = {
    logActivity,
    getTenantActivities,
};