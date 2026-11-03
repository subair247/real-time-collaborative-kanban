const prisma = require('../config/database');

const createColumn = async ({ name, board_id, tenant_id, position }) => {
    let colPosition = position;
    if (!colPosition) {
        const lastCol = await prisma.column.findFirst({
            where: { board_id, tenant_id },
            orderBy: { position: 'desc' },
        });
        colPosition = lastCol ? lastCol.position + 1 : 1;
    }

    return prisma.column.create({
        data: {
            name,
            board_id,
            tenant_id,
            position: colPosition,
        },
    });
};

const getBoardColumns = async (boardId, tenantId) => {
    return prisma.column.findMany({
        where: {
            board_id: boardId,
            tenant_id: tenantId,
        },
        include: {
            tasks: {
                orderBy: { position: 'asc' },
                include: {
                    assignee: { select: { id: true, name: true, email: true } },
                },
            },
        },
        orderBy: { position: 'asc' },
    });
};

const updateColumn = async (id, tenantId, { name, position }) => {
    return prisma.column.updateMany({
        where: { id, tenant_id: tenantId },
        data: { name, position },
    });
};

const deleteColumn = async (id, tenantId) => {
    return prisma.column.deleteMany({
        where: { id, tenant_id: tenantId },
    });
};

module.exports = {
    createColumn,
    getBoardColumns,
    updateColumn,
    deleteColumn,
};
