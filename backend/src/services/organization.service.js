const prisma = require('../config/database');

const createOrganization = async ({ name, userId }) => {
    return prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
            data: { name },
        });

        await tx.membership.create({
            data: {
                user_id: userId,
                organization_id: org.id,
                role: 'Org Admin',
            },
        });

        return org;
    });
};

const getAuthorizedOrganizations = async (userId) => {
    const memberships = await prisma.membership.findMany({
        where: { user_id: userId },
        select: { organization_id: true },
        distinct: ['organization_id'],
    });

    const orgIds = memberships.map((m) => m.organization_id);

    return prisma.organization.findMany({
        where: { id: { in: orgIds } },
        include: {
            tenants: true,
        },
        orderBy: { created_at: 'asc' },
    });
};

const getOrganizationById = async (id, userId) => {
    const membership = await prisma.membership.findFirst({
        where: { organization_id: id, user_id: userId },
    });

    if (!membership) {
        const error = new Error('Organization not found or access denied.');
        error.status = 404;
        throw error;
    }

    return prisma.organization.findUnique({
        where: { id },
        include: {
            tenants: true,
            memberships: {
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    tenant: true,
                },
            },
        },
    });
};

const updateOrganization = async (id, { name }) => {
    return prisma.organization.update({
        where: { id },
        data: { name },
    });
};

const deleteOrganization = async (id) => {
    return prisma.organization.delete({
        where: { id },
    });
};

module.exports = {
    createOrganization,
    getAuthorizedOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
};