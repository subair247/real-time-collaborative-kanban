const prisma = require('../config/database');
const { logActivity } = require('./activity.service');

const createTask = async ({ title, description, board_id, column_id, tenant_id, assigned_to, position, userId }) => {
    return prisma.$transaction(async (tx) => {
        const column = await tx.column.findFirst({
            where: { id: column_id, board_id, tenant_id },
        });

        if (!column) {
            const error = new Error('Invalid board or column for this tenant.');
            error.status = 400;
            throw error;
        }

        let taskPosition = position;
        if (!taskPosition) {
            const lastTask = await tx.task.findFirst({
                where: { column_id, tenant_id },
                orderBy: { position: 'desc' },
            });
            taskPosition = lastTask ? lastTask.position + 1 : 1;
        }

        const task = await tx.task.create({
            data: {
                title,
                description,
                board_id,
                column_id,
                tenant_id,
                assigned_to,
                position: taskPosition,
                version: 1,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
            },
        });

        await logActivity({
            tenant_id,
            user_id: userId,
            entity_type: 'task',
            entity_id: task.id,
            action: 'Created',
            details: { title: task.title, column: column.name },
        });

        return task;
    });
};

const getTenantTasks = async (tenantId, boardId = null) => {
    const where = { tenant_id: tenantId };
    if (boardId) {
        where.board_id = boardId;
    }

    return prisma.task.findMany({
        where,
        include: {
            assignee: { select: { id: true, name: true, email: true } },
            column: { select: { id: true, name: true, position: true } },
        },
        orderBy: [{ column_id: 'asc' }, { position: 'asc' }],
    });
};

const getTaskById = async (id, tenantId) => {
    const task = await prisma.task.findFirst({
        where: { id, tenant_id: tenantId },
        include: {
            assignee: { select: { id: true, name: true, email: true } },
            column: { select: { id: true, name: true } },
            board: { select: { id: true, name: true } },
        },
    });

    if (!task) {
        const error = new Error('Task not found in this tenant.');
        error.status = 404;
        throw error;
    }

    return task;
};

const updateTask = async (id, tenantId, updateData, userId) => {
    const { expected_version, title, description, assigned_to, column_id, position } = updateData;

    return prisma.$transaction(async (tx) => {
        const currentTask = await tx.task.findFirst({
            where: { id, tenant_id: tenantId },
        });

        if (!currentTask) {
            const error = new Error('Task not found.');
            error.status = 404;
            throw error;
        }

        if (expected_version !== undefined && currentTask.version !== expected_version) {
            const conflictError = new Error(
                `Conflict: Task was modified by another user. Current server version is ${currentTask.version}, your version was ${expected_version}. Please refresh to resolve.`
            );
            conflictError.status = 409;
            conflictError.serverTask = currentTask;
            throw conflictError;
        }

        const updated = await tx.task.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(assigned_to !== undefined && { assigned_to }),
                ...(column_id !== undefined && { column_id }),
                ...(position !== undefined && { position }),
                version: currentTask.version + 1,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                column: { select: { id: true, name: true } },
            },
        });

        await logActivity({
            tenant_id: tenantId,
            user_id: userId,
            entity_type: 'task',
            entity_id: id,
            action: 'Updated',
            details: { title: updated.title, new_version: updated.version },
        });

        return updated;
    });
};

const moveTask = async (id, tenantId, { destination_column_id, new_position, expected_version }, userId) => {
    return prisma.$transaction(async (tx) => {
        const task = await tx.task.findFirst({
            where: { id, tenant_id: tenantId },
            include: { column: true },
        });

        if (!task) {
            const error = new Error('Task not found in this tenant.');
            error.status = 404;
            throw error;
        }

        if (expected_version !== undefined && task.version !== expected_version) {
            const conflictError = new Error(
                `Conflict: Task position was updated by another user. Server version is ${task.version}, your version was ${expected_version}.`
            );
            conflictError.status = 409;
            conflictError.serverTask = task;
            throw conflictError;
        }

        const destColumn = await tx.column.findFirst({
            where: { id: destination_column_id, tenant_id: tenantId },
        });

        if (!destColumn) {
            const error = new Error('Destination column not found in this tenant.');
            error.status = 404;
            throw error;
        }

        const sourceColumnId = task.column_id;
        const oldPosition = task.position;
        const isSameColumn = sourceColumnId === destination_column_id;

        if (isSameColumn) {
            if (oldPosition < new_position) {
                await tx.task.updateMany({
                    where: {
                        column_id: sourceColumnId,
                        tenant_id: tenantId,
                        position: { gt: oldPosition, lte: new_position },
                    },
                    data: { position: { decrement: 1 } },
                });
            } else if (oldPosition > new_position) {
                await tx.task.updateMany({
                    where: {
                        column_id: sourceColumnId,
                        tenant_id: tenantId,
                        position: { gte: new_position, lt: oldPosition },
                    },
                    data: { position: { increment: 1 } },
                });
            }
        } else {
            await tx.task.updateMany({
                where: {
                    column_id: sourceColumnId,
                    tenant_id: tenantId,
                    position: { gt: oldPosition },
                },
                data: { position: { decrement: 1 } },
            });

            await tx.task.updateMany({
                where: {
                    column_id: destination_column_id,
                    tenant_id: tenantId,
                    position: { gte: new_position },
                },
                data: { position: { increment: 1 } },
            });
        }

        const updatedTask = await tx.task.update({
            where: { id },
            data: {
                column_id: destination_column_id,
                position: new_position,
                version: task.version + 1,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                column: { select: { id: true, name: true } },
            },
        });

        await logActivity({
            tenant_id: tenantId,
            user_id: userId,
            entity_type: 'task',
            entity_id: id,
            action: 'Moved',
            details: {
                title: task.title,
                from_column: task.column.name,
                to_column: destColumn.name,
                new_position,
                new_version: updatedTask.version,
            },
        });

        return updatedTask;
    });
};

const deleteTask = async (id, tenantId, userId) => {
    const task = await prisma.task.findFirst({
        where: { id, tenant_id: tenantId },
    });

    if (!task) {
        const error = new Error('Task not found.');
        error.status = 404;
        throw error;
    }

    await prisma.task.delete({ where: { id } });

    await logActivity({
        tenant_id: tenantId,
        user_id: userId,
        entity_type: 'task',
        entity_id: id,
        action: 'Deleted',
        details: { title: task.title },
    });

    return { success: true, message: 'Task deleted successfully.' };
};

module.exports = {
    createTask,
    getTenantTasks,
    getTaskById,
    updateTask,
    moveTask,
    deleteTask,
};