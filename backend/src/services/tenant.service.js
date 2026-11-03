const prisma = require('../config/database');

const createTenant = async ({ name, organization_id, userId }) => {
    return prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
            data: {
                name,
                organization_id,
            },
        });

        await tx.membership.create({
            data: {
                user_id: userId,
                organization_id,
                tenant_id: tenant.id,
                role: 'Tenant Admin',
            },
        });

        return tenant;
    });
};

const getAuthorizedTenants = async (userId, organizationId) => {
    const orgMembership = await prisma.membership.findFirst({
        where: {
            user_id: userId,
            organization_id: organizationId,
            role: 'Org Admin',
        },
    });

    if (orgMembership) {
        return prisma.tenant.findMany({
            where: { organization_id: organizationId },
            orderBy: { created_at: 'asc' },
        });
    }

    const memberships = await prisma.membership.findMany({
        where: {
            user_id: userId,
            organization_id: organizationId,
            tenant_id: { not: null },
        },
        select: { tenant_id: true },
    });

    const tenantIds = memberships.map((m) => m.tenant_id);

    return prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
        orderBy: { created_at: 'asc' },
    });
};

const getTenantById = async (id, userId) => {
    const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
            organization: true,
            boards: {
                include: {
                    columns: { orderBy: { position: 'asc' } },
                },
            },
        },
    });

    if (!tenant) {
        const error = new Error('Tenant not found.');
        error.status = 404;
        throw error;
    }

    const membership = await prisma.membership.findFirst({
        where: {
            user_id: userId,
            OR: [
                { tenant_id: id },
                { organization_id: tenant.organization_id, role: 'Org Admin' },
            ],
        },
    });

    if (!membership) {
        const error = new Error('Access denied to this tenant.');
        error.status = 403;
        throw error;
    }

    return tenant;
};

const updateTenant = async (id, { name }) => {
    return prisma.tenant.update({
        where: { id },
        data: { name },
    });
};

const deleteTenant = async (id) => {
    return prisma.tenant.delete({
        where: { id },
    });
};

module.exports = {
    createTenant,
    getAuthorizedTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
};
