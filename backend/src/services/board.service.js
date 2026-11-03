const prisma = require('../config/database');
const { logActivity } = require('./activity.service');

const createBoard = async ({ name, description, organization_id, tenant_id, userId }) => {
    return prisma.$transaction(async (tx) => {
        const board = await tx.board.create({
            data: {
                name,
                description,
                organization_id,
                tenant_id,
                created_by: userId,
            },
        });

        await tx.column.createMany({
            data: [
                { name: 'To Do', position: 1, board_id: board.id, tenant_id },
                { name: 'In Progress', position: 2, board_id: board.id, tenant_id },
                { name: 'Testing', position: 3, board_id: board.id, tenant_id },
                { name: 'Done', position: 4, board_id: board.id, tenant_id },
            ],
        });

        await logActivity({
            tenant_id,
            user_id: userId,
            entity_type: 'board',
            entity_id: board.id,
            action: 'Created',
            details: { name: board.name },
        });

        return tx.board.findUnique({
            where: { id: board.id },
            include: {
                columns: { orderBy: { position: 'asc' } },
                creator: { select: { id: true, name: true, email: true } },
            },
        });
    });
};

const getTenantBoards = async (tenantId) => {
    return prisma.board.findMany({
        where: { tenant_id: tenantId },
        include: {
            columns: {
                orderBy: { position: 'asc' },
                include: {
                    tasks: {
                        orderBy: { position: 'asc' },
                        include: {
                            assignee: { select: { id: true, name: true, email: true } },
                        },
                    },
                },
            },
            creator: { select: { id: true, name: true, email: true } },
            _count: { select: { tasks: true } },
        },
        orderBy: { created_at: 'asc' },
    });
};

const getBoardById = async (id, tenantId) => {
    const board = await prisma.board.findFirst({
        where: {
            id,
            tenant_id: tenantId,
        },
        include: {
            columns: {
                orderBy: { position: 'asc' },
                include: {
                    tasks: {
                        orderBy: { position: 'asc' },
                        include: {
                            assignee: { select: { id: true, name: true, email: true } },
                        },
                    },
                },
            },
            creator: { select: { id: true, name: true, email: true } },
        },
    });

    if (!board) {
        const error = new Error('Board not found in this tenant workspace.');
        error.status = 404;
        throw error;
    }

    return board;
};

const updateBoard = async (id, tenantId, { name, description }) => {
    return prisma.board.updateMany({
        where: { id, tenant_id: tenantId },
        data: { name, description },
    });
};

const deleteBoard = async (id, tenantId) => {
    return prisma.board.deleteMany({
        where: { id, tenant_id: tenantId },
    });
};

module.exports = {
    createBoard,
    getTenantBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
};